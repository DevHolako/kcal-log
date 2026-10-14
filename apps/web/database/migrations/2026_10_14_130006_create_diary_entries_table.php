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
        Schema::create('diary_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('food_id')->constrained('foods')->cascadeOnDelete();
            $table->foreignId('food_serving_id')->nullable()->constrained('food_servings')->nullOnDelete();
            $table->date('date');
            $table->enum('meal_slot', ['breakfast', 'lunch', 'dinner', 'snack']);
            $table->decimal('quantity', 8, 2)->default(1.00);
            $table->string('unit', 32)->default('serving');
            $table->decimal('grams', 8, 2);
            $table->decimal('calories', 8, 2);
            $table->decimal('protein', 8, 2);
            $table->decimal('carbs', 8, 2);
            $table->decimal('fat', 8, 2);
            $table->decimal('fiber', 8, 2)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'date', 'meal_slot']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diary_entries');
    }
};
