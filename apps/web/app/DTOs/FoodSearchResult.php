<?php

namespace App\DTOs;

use App\Models\Food;
use Illuminate\Support\Collection;

class FoodSearchResult
{
    /**
     * @param  Collection<int, Food>  $items
     * @param  'off_authenticated'|'off_anonymous'|'cache'  $source
     */
    public function __construct(
        public readonly Collection $items,
        public readonly string $source,
        public readonly bool $isDegraded,
        public readonly int $total,
        public readonly int $page,
        public readonly int $perPage,
    ) {}

    /**
     * @return array{
     *     items: Collection<int, Food>,
     *     source: string,
     *     is_degraded: bool,
     *     total: int,
     *     page: int,
     *     per_page: int
     * }
     */
    public function toArray(): array
    {
        return [
            'items' => $this->items,
            'source' => $this->source,
            'is_degraded' => $this->isDegraded,
            'total' => $this->total,
            'page' => $this->page,
            'per_page' => $this->perPage,
        ];
    }
}
