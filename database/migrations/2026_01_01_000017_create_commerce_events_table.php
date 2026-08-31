<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('commerce_events', function (Blueprint $table) {
            $table->id();
            $table->string('session_key', 128);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('event_name', ['product_view', 'add_to_cart', 'checkout_started', 'purchase_completed']);
            $table->foreignId('product_id')->nullable()->constrained('catalog_products')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('commerce_events');
    }
};
