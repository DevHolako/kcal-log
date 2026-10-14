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
        Schema::create('adaptive_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('review_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('starting_weight_kg', 5, 2);
            $table->decimal('ending_weight_kg', 5, 2);
            $table->decimal('ewma_weight_change_kg', 4, 2);
            $table->decimal('average_daily_calories', 7, 2);
            $table->decimal('calculated_tdee', 7, 2);
            $table->unsignedInteger('current_target_calories');
            $table->unsignedInteger('proposed_target_calories');
            $table->decimal('proposed_protein_g', 6, 2);
            $table->decimal('proposed_carbs_g', 6, 2);
            $table->decimal('proposed_fat_g', 6, 2);
            $table->enum('status', ['pending', 'accepted', 'rejected', 'expired'])->default('pending');
            $table->timestamp('user_decision_at')->nullable();
            $table->foreignId('applied_target_profile_id')->nullable()->constrained('target_profiles')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adaptive_adjustments');
    }
};
