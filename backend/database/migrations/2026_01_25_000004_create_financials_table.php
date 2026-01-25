<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financials', function (Blueprint $table) {
            $table->id();
            $table->date('record_date');
            $table->decimal('amount', 15, 2);
            $table->string('description')->nullable();
            $table->enum('type', ['infaq', 'zakat', 'sedekah', 'lainnya'])->default('infaq');
            $table->foreignId('recorded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['record_date', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financials');
    }
};
