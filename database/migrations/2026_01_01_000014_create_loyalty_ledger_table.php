<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('loyalty_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->integer('points');
            $table->enum('type', ['earned_delivery', 'redeemed_checkout', 'manual_adjustment']);
            $table->string('note', 240)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('loyalty_ledger');
    }
};
