<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('catalog_products')->cascadeOnDelete();
            $table->text('url');
            $table->enum('media_type', ['front', 'back', 'gallery', 'model3d'])->default('gallery');
            $table->string('alt_text', 180)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('product_media');
    }
};
