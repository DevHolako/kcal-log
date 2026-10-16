<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FoodCatalogSyncProgress implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public int $current,
        public int $total,
        public int $percent,
        public string $status,
        public int $savedCount = 0,
        public ?int $userId = null,
        public bool $isCompleted = false,
        public array $metadata = []
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new Channel('foods'),
        ];

        if ($this->userId !== null) {
            $channels[] = new PrivateChannel('user.'.$this->userId);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'FoodCatalogSyncProgress';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'current' => $this->current,
            'total' => $this->total,
            'percent' => $this->percent,
            'status' => $this->status,
            'saved_count' => $this->savedCount,
            'user_id' => $this->userId,
            'is_completed' => $this->isCompleted,
            'metadata' => $this->metadata,
        ];
    }
}
