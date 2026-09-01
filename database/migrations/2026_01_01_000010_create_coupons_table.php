<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 80)->unique();
            $table->enum('type', ['percentage', 'fixed']);
            $table->integer('value');
            $table->integer('minimum_subtotal')->default(0);
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at')->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('coupons');
    }
};
