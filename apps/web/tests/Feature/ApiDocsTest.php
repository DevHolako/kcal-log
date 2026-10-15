<?php

use function Pest\Laravel\get;

it('serves interactive scalar documentation at /docs/api', function () {
    $response = get('/docs/api');

    $response->assertOk();
    $response->assertSee('scalar');
});

it('serves valid openapi 3.1 specification at /docs/api.json', function () {
    $response = get('/docs/api.json');

    $response->assertOk();
    $response->assertHeader('content-type', 'application/json');

    $data = $response->json();
    expect($data)->toBeArray()
        ->and($data['openapi'])->toStartWith('3.1')
        ->and($data['info']['title'])->toBe('kcal-log API Reference')
        ->and($data['paths'])->toHaveKeys([
            '/v1/diary',
            '/v1/foods/search',
            '/v1/recipes',
            '/v1/adaptive/current',
            '/v1/reports/exports',
            '/v1/auth/tokens',
        ]);
});
