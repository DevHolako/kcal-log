<?php

use App\Ai\Agents\NutritionAssistant;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\UserAiConnection;
use Inertia\Testing\AssertableInertia as Assert;

function createTestUser(): User
{
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);
    TargetProfile::factory()->create(['user_id' => $user->id, 'is_active' => true]);

    return $user;
}

test('assistant page shows onboarding state when user is not connected', function () {
    $user = createTestUser();

    $this->actingAs($user)
        ->get(route('assistant.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('assistant')
            ->where('isConnected', false)
            ->where('conversations', [])
        );
});

test('assistant page displays conversations and active thread', function () {
    $user = createTestUser();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-test-key',
        'is_connected' => true,
    ]);

    $conv = AiConversation::create([
        'user_id' => $user->id,
        'title' => 'Nutrition Plan Discussion',
    ]);

    AiMessage::create([
        'ai_conversation_id' => $conv->id,
        'role' => 'user',
        'content' => 'What is my calorie target?',
    ]);

    AiMessage::create([
        'ai_conversation_id' => $conv->id,
        'role' => 'assistant',
        'content' => 'Your target is 2000 kcal.',
    ]);

    $this->actingAs($user)
        ->get(route('assistant.index', ['conversation' => $conv->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('assistant')
            ->where('isConnected', true)
            ->has('conversations', 1)
            ->where('conversations.0.title', 'Nutrition Plan Discussion')
            ->has('activeConversation.messages', 2)
        );
});

test('user can create a new conversation thread', function () {
    $user = createTestUser();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-test-key',
        'is_connected' => true,
    ]);

    $response = $this->actingAs($user)
        ->post(route('assistant.conversations.store'));

    $response->assertRedirect();

    $this->assertDatabaseHas('ai_conversations', [
        'user_id' => $user->id,
        'title' => 'New Conversation',
    ]);
});

test('user can delete a conversation thread', function () {
    $user = createTestUser();

    $conv = AiConversation::create([
        'user_id' => $user->id,
        'title' => 'Old Chat',
    ]);

    $response = $this->actingAs($user)
        ->delete(route('assistant.conversations.destroy', $conv));

    $response->assertRedirect(route('assistant.index'));

    $this->assertDatabaseMissing('ai_conversations', [
        'id' => $conv->id,
    ]);
});

test('user cannot view or delete another users conversation', function () {
    $user1 = createTestUser();
    $user2 = createTestUser();

    $conv = AiConversation::create([
        'user_id' => $user1->id,
        'title' => 'Private Chat',
    ]);

    $response = $this->actingAs($user2)
        ->delete(route('assistant.conversations.destroy', $conv));

    $response->assertForbidden();

    $this->assertDatabaseHas('ai_conversations', [
        'id' => $conv->id,
    ]);
});

test('user can stream assistant message and thread is auto-titled', function () {
    $user = createTestUser();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-test-key',
        'is_connected' => true,
    ]);

    $conv = AiConversation::create([
        'user_id' => $user->id,
        'title' => 'New Conversation',
    ]);

    NutritionAssistant::fake([
        'You have 500 kcal remaining today.',
    ]);

    $response = $this->actingAs($user)
        ->post(route('assistant.conversations.stream', $conv), [
            'prompt' => 'How many calories do I have left today?',
        ]);

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/event-stream');

    ob_start();
    $response->sendContent();
    ob_end_clean();

    $this->assertDatabaseHas('ai_conversations', [
        'id' => $conv->id,
        'title' => 'How many calories do I have left to...',
    ]);

    $this->assertDatabaseHas('ai_messages', [
        'ai_conversation_id' => $conv->id,
        'role' => 'user',
        'content' => 'How many calories do I have left today?',
    ]);

    $this->assertDatabaseHas('ai_messages', [
        'ai_conversation_id' => $conv->id,
        'role' => 'assistant',
        'content' => 'You have 500 kcal remaining today.',
    ]);
});

test('upstream provider quota failure streams error card and marks connection disconnected', function () {
    $user = createTestUser();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-expired-key',
        'is_connected' => true,
    ]);

    $conv = AiConversation::create([
        'user_id' => $user->id,
        'title' => 'Test Thread',
    ]);

    NutritionAssistant::fake(function () {
        throw new RuntimeException('You exceeded your current quota, please check your plan and billing details (429)');
    });

    $response = $this->actingAs($user)
        ->post(route('assistant.conversations.stream', $conv), [
            'prompt' => 'Hello',
        ]);

    $response->assertOk();

    ob_start();
    ob_start();
    $response->sendContent();
    ob_get_clean();
    $output = ob_get_clean();

    expect($output)->toContain('provider_error');
    expect($output)->toContain('/settings/ai');

    // Connection must be marked disconnected
    $this->assertDatabaseHas('user_ai_connections', [
        'user_id' => $user->id,
        'is_connected' => false,
    ]);
});
