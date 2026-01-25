<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['image', 'video']);
            $table->string('file_path');
            $table->integer('duration')->default(10); // seconds
            $table->integer('priority')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('show_on_days')->nullable(); // [0,1,2,3,4,5,6]
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};
