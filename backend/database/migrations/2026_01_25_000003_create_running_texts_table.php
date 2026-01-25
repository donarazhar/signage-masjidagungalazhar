<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('running_texts', function (Blueprint $table) {
            $table->id();
            $table->text('content');
            $table->enum('type', ['normal', 'urgent', 'berita_duka'])->default('normal');
            $table->integer('priority')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('show_on_days')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('running_texts');
    }
};
