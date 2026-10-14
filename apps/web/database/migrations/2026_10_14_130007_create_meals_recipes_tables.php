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
        Schema::create('meals_recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('servings', 5, 2)->default(1.00);
            $table->boolean('is_recipe')->default(true);
            $table->decimal('total_calories', 8, 2)->default(0.00);
            $table->decimal('total_protein', 8, 2)->default(0.00);
            $table->decimal('total_carbs', 8, 2)->default(0.00);
            $table->decimal('total_fat', 8, 2)->default(0.00);
            $table->decimal('total_fiber', 8, 2)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_recipe']);
        });

        Schema::create('recipe_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meal_recipe_id')->constrained('meals_recipes')->cascadeOnDelete();
            $table->foreignId('food_id')->constrained('foods')->cascadeOnDelete();
            $table->foreignId('food_serving_id')->nullable()->constrained('food_servings')->nullOnDelete();
            $table->decimal('quantity', 8, 2)->default(1.00);
            $table->decimal('grams', 8, 2);
            $table->decimal('calories', 8, 2);
            $table->decimal('protein', 8, 2);
            $table->decimal('carbs', 8, 2);
            $table->decimal('fat', 8, 2);
            $table->decimal('fiber', 8, 2)->nullable();
            $table->timestamps();

            $table->index(['meal_recipe_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipe_items');
        Schema::dropIfExists('meals_recipes');
    }
};
