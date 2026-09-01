<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('lookbook_entries', function (Blueprint $table) {
            $table->id();
            $table->string('title', 160);
            $table->string('title_arabic', 160);
            $table->text('description')->nullable();
            $table->text('image_url');
            $table->foreignId('product_id')->nullable()->constrained('catalog_products')->nullOnDelete();
            $table->integer('sort_order')->default(0);
            $table->boolean('published')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('lookbook_entries');
    }
};
