<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 32)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->string('customer_name', 160);
            $table->string('email', 320);
            $table->string('phone', 40);
            $table->text('address');
            $table->string('city', 80);
            $table->string('payment_method', 40)->default('cod');
            $table->string('coupon_code', 80)->nullable();
            $table->integer('coupon_discount')->default(0);
            $table->string('shipment_carrier', 120)->nullable();
            $table->string('tracking_number', 160)->nullable();
            $table->text('tracking_url')->nullable();
            $table->boolean('loyalty_awarded')->default(false);
            $table->text('notes')->nullable();
            $table->integer('subtotal');
            $table->integer('shipping');
            $table->integer('total');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('orders');
    }
};
