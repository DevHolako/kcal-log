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
        Schema::create('target_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('calories');
            $table->decimal('protein_g', 6, 2);
            $table->decimal('carbs_g', 6, 2);
            $table->decimal('fat_g', 6, 2);
            $table->decimal('fiber_g', 6, 2)->nullable();
            $table->unsignedInteger('water_ml')->default(2000);
            $table->decimal('bmr', 7, 2)->nullable();
            $table->decimal('tdee', 7, 2)->nullable();
            $table->enum('goal_type', ['lose', 'maintain', 'gain'])->default('maintain');
            $table->decimal('weekly_rate_kg', 4, 2)->default(0.00);
            $table->enum('diet_type', [
                'balanced',
                'low_carb',
                'high_protein',
                'keto',
                'custom',
            ])->default('balanced');
            $table->json('formula_inputs')->nullable();
            $table->enum('source', [
                'onboarding',
                'manual',
                'adaptive_checkpoint',
            ])->default('onboarding');
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('target_profiles');
    }
};
