<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('governorate', 80)->unique();
            $table->integer('fee')->default(0);
            $table->string('delivery_note', 240)->nullable();
            $table->boolean('enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('shipping_zones');
    }
};
