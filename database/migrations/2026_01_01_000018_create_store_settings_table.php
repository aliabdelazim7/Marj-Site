<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('brand_name', 120)->default('مرج');
            $table->string('shipping_scope', 240)->default('الشحن متاح لجميع محافظات مصر');
            $table->integer('shipping_fee')->default(0);
            $table->integer('free_shipping_threshold')->nullable();
            $table->text('shipping_notice');
            $table->text('return_policy');
            $table->text('payment_notice');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('store_settings');
    }
};
