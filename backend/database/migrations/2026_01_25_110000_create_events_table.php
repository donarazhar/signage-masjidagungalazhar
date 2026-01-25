<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('event_date');
            $table->time('event_time')->nullable();
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Index for faster queries
            $table->index(['event_date', 'is_enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
