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
        Schema::table('diary_entries', function (Blueprint $table) {
            $table->decimal('sugar', 8, 2)->nullable()->after('fiber');
            $table->decimal('saturated_fat', 8, 2)->nullable()->after('sugar');
            $table->decimal('sodium', 8, 4)->nullable()->after('saturated_fat');
        });

        Schema::table('meals_recipes', function (Blueprint $table) {
            $table->decimal('total_sugar', 8, 2)->nullable()->after('total_fiber');
            $table->decimal('total_saturated_fat', 8, 2)->nullable()->after('total_sugar');
            $table->decimal('total_sodium', 8, 4)->nullable()->after('total_saturated_fat');
        });

        Schema::table('recipe_items', function (Blueprint $table) {
            $table->decimal('sugar', 8, 2)->nullable()->after('fiber');
            $table->decimal('saturated_fat', 8, 2)->nullable()->after('sugar');
            $table->decimal('sodium', 8, 4)->nullable()->after('saturated_fat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recipe_items', function (Blueprint $table) {
            $table->dropColumn(['sugar', 'saturated_fat', 'sodium']);
        });

        Schema::table('meals_recipes', function (Blueprint $table) {
            $table->dropColumn(['total_sugar', 'total_saturated_fat', 'total_sodium']);
        });

        Schema::table('diary_entries', function (Blueprint $table) {
            $table->dropColumn(['sugar', 'saturated_fat', 'sodium']);
        });
    }
};
