<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserOffConnection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserOffConnection>
 */
class UserOffConnectionFactory extends Factory
{
    protected $model = UserOffConnection::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'username' => fake()->userName(),
            'password' => 'secret_off_token_pass',
            'auth_token' => 'sample_bearer_token_'.fake()->uuid(),
            'is_connected' => true,
            'last_synced_at' => now(),
        ];
    }
}
