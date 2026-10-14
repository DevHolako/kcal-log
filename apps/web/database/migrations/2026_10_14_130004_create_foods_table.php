<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->string('off_id')->nullable()->index();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->boolean('is_custom')->default(false)->index();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('barcode')->nullable()->index();
            $table->decimal('serving_size', 8, 2)->default(100.00);
            $table->string('serving_unit', 32)->default('g');
            $table->decimal('calories', 8, 2)->default(0.00);
            $table->decimal('protein', 8, 2)->default(0.00);
            $table->decimal('carbs', 8, 2)->default(0.00);
            $table->decimal('fat', 8, 2)->default(0.00);
            $table->decimal('fiber', 8, 2)->nullable();
            $table->decimal('sugar', 8, 2)->nullable();
            $table->decimal('saturated_fat', 8, 2)->nullable();
            $table->decimal('sodium', 8, 2)->nullable();
            $table->string('nutri_score', 2)->nullable();
            $table->unsignedTinyInteger('nova_group')->nullable();
            $table->string('eco_score', 2)->nullable();
            $table->json('raw_off_data')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_custom']);
            $table->index(['name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};
