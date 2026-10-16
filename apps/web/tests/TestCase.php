<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! file_exists(public_path('build/manifest.json'))) {
            @mkdir(public_path('build'), 0755, true);
            file_put_contents(public_path('build/manifest.json'), json_encode([
                'resources/js/app.tsx' => [
                    'file' => 'assets/app.js',
                    'isEntry' => true,
                    'src' => 'resources/js/app.tsx',
                ],
            ]));
        }
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
