@extends('layouts.admin')

@section('title', 'تعديل ' . $product->nameArabic . ' — لوحة تحكم مرج')
@section('page_title', 'تعديل منتج: ' . $product->nameArabic)

@section('content')
<div class="max-w-4xl mx-auto space-y-8">
    <!-- بيانات المنتج الأساسية -->
    <form action="{{ route('admin.products.update', $product->id) }}" method="POST" class="glass-sidebar rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
        @csrf
        @method('PUT')

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الاسم بالعربية *</label>
                <input type="text" name="name_arabic" required value="{{ old('name_arabic', $product->name_arabic) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الاسم بالإنجليزية *</label>
                <input type="text" name="name" required value="{{ old('name', $product->name) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الرابط الفريد (Slug) *</label>
                <input type="text" name="slug" required value="{{ old('slug', $product->slug) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الـ SKU</label>
                <input type="text" name="sku" value="{{ old('sku', $product->sku) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">السعر الأساسي (ج.م) *</label>
                <input type="number" name="price" required min="1" value="{{ old('price', $product->price) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">السعر قبل الخصم (اختياري)</label>
                <input type="number" name="compare_at_price" min="1" value="{{ old('compare_at_price', $product->compare_at_price) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">رابط صورة المنتج الأساسية *</label>
                <input type="text" name="image_url" required value="{{ old('image_url', $product->image_url) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الوصف *</label>
                <textarea name="description" rows="3" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">{{ old('description', $product->description) }}</textarea>
            </div>

            <input type="hidden" name="category" value="{{ $product->category }}">
            <input type="hidden" name="stock_status" value="instock">
            <input type="hidden" name="status" value="active">
        </div>

        <button type="submit" class="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition">
            حفظ التعديلات
        </button>
    </form>

    <!-- إدارة المقاسات والمخزون الـ Variants -->
    <div class="glass-sidebar rounded-3xl p-6 sm:p-8 border border-white/5 space-y-4">
        <h3 class="font-bold text-base text-white">إدارة المقاسات والمخزون (Variants)</h3>

        <div class="space-y-3">
            @foreach($product->variants as $variant)
                <form action="{{ route('admin.variants.update', $variant->id) }}" method="POST" class="p-4 rounded-2xl bg-slate-900/60 border border-white/5 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center text-xs">
                    @csrf
                    @method('PUT')
                    <div>
                        <span class="text-slate-400 block text-[10px]">المقاس</span>
                        <input type="text" name="size" value="{{ $variant->size }}" class="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white font-bold" readonly>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">اللون</span>
                        <input type="text" name="color" value="{{ $variant->color }}" class="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white">
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">الـ SKU</span>
                        <input type="text" name="sku" value="{{ $variant->sku }}" class="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white font-mono">
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">المخزون</span>
                        <input type="number" name="stock" value="{{ $variant->stock }}" min="0" class="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white font-bold">
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">حد الأمان</span>
                        <input type="number" name="safety_stock" value="{{ $variant->safety_stock }}" min="0" class="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white">
                    </div>
                    <div>
                        <input type="hidden" name="stock_status" value="{{ $variant->stock_status }}">
                        <input type="hidden" name="status" value="{{ $variant->status }}">
                        <button type="submit" class="w-full mt-3.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 font-bold transition">
                            حفظ
                        </button>
                    </div>
                </form>
            @endforeach
        </div>
    </div>
</div>
@endsection
