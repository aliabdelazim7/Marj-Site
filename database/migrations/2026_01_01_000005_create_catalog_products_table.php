<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('catalog_products', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('name', 160);
            $table->string('name_arabic', 160);
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->integer('price');
            $table->integer('sale_price')->nullable();
            $table->integer('compare_at_price')->nullable();
            $table->string('sku', 80)->nullable();
            $table->text('image_url');
            $table->string('category', 80)->default('هوديز');
            $table->foreignId('category_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->boolean('featured')->default(false);
            $table->boolean('manage_stock')->default(true);
            $table->enum('stock_status', ['instock', 'outofstock', 'onbackorder'])->default('instock');
            $table->enum('status', ['draft', 'active', 'archived'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('catalog_products');
    }
};
