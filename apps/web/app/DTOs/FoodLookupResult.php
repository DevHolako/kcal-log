<?php

namespace App\DTOs;

use App\Models\Food;

class FoodLookupResult
{
    /**
     * @param  'off_authenticated'|'off_anonymous'|'cache'  $source
     */
    public function __construct(
        public readonly Food $food,
        public readonly string $source,
        public readonly bool $isDegraded = false,
    ) {}

    /**
     * @return array{
     *     food: Food,
     *     source: string,
     *     is_degraded: bool
     * }
     */
    public function toArray(): array
    {
        return [
            'food' => $this->food,
            'source' => $this->source,
            'is_degraded' => $this->isDegraded,
        ];
    }
}
