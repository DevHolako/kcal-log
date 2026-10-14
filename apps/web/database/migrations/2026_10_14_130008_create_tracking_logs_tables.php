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
        Schema::create('water_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('amount_ml');
            $table->timestamps();

            $table->index(['user_id', 'date']);
        });

        Schema::create('weight_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('weight_kg', 5, 2);
            $table->decimal('body_fat_pct', 4, 2)->nullable();
            $table->string('photo_path')->nullable();
            $table->text('note')->nullable();
            $table->enum('source', ['manual', 'health_connect', 'scale_sync'])->default('manual');
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });

        Schema::create('body_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('neck_cm', 5, 2)->nullable();
            $table->decimal('waist_cm', 5, 2)->nullable();
            $table->decimal('hips_cm', 5, 2)->nullable();
            $table->decimal('chest_cm', 5, 2)->nullable();
            $table->decimal('biceps_cm', 5, 2)->nullable();
            $table->decimal('thighs_cm', 5, 2)->nullable();
            $table->decimal('calves_cm', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });

        Schema::create('exercise_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('name');
            $table->enum('exercise_type', ['cardio', 'strength', 'other'])->default('cardio');
            $table->unsignedInteger('duration_minutes');
            $table->decimal('calories_burned', 7, 2);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_logs');
        Schema::dropIfExists('body_measurements');
        Schema::dropIfExists('weight_logs');
        Schema::dropIfExists('water_logs');
    }
};
