<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            // Make file_path nullable
            $table->string('file_path')->nullable()->change();

            // Add YouTube fields
            $table->string('youtube_url')->nullable()->after('file_path');
            $table->string('youtube_id', 20)->nullable()->after('youtube_url');
        });

        // Update type enum to include 'youtube'
        Schema::table('contents', function (Blueprint $table) {
            $table->string('type', 20)->change();
        });
    }

    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropColumn(['youtube_url', 'youtube_id']);
        });
    }
};
