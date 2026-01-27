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
        $tables = ['settings', 'contents', 'running_texts', 'financials', 'events', 'donations', 'hadiths'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->foreignId('mosque_id')->nullable()->constrained()->cascadeOnDelete();

                if ($tableName === 'settings') {
                    $table->unique(['key', 'mosque_id']);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['settings', 'contents', 'running_texts', 'financials', 'events', 'donations', 'hadiths'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['mosque_id']);
                $table->dropColumn('mosque_id');
            });
        }
    }
};
