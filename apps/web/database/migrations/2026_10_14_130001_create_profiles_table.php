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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->date('date_of_birth');
            $table->enum('sex', ['male', 'female']);
            $table->decimal('height_cm', 5, 2);
            $table->enum('activity_level', [
                'sedentary',
                'lightly_active',
                'moderately_active',
                'very_active',
                'extremely_active',
            ])->default('sedentary');
            $table->string('timezone', 64)->default('UTC');
            $table->string('locale', 12)->default('en');
            $table->enum('unit_preference', ['metric', 'imperial'])->default('metric');
            $table->enum('theme_preference', ['system', 'light', 'dark'])->default('system');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
