<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('label', 120);
            $table->enum('type', ['cod', 'manual_transfer', 'online_card']);
            $table->boolean('enabled')->default(false);
            $table->text('instructions')->nullable();
            $table->string('whatsapp_number', 16)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('payment_methods');
    }
};
