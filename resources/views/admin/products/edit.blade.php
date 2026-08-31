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
    <!-- إدارة الوسائط والصور وعارض الـ 3D (Media & 3D Assets) -->
    <div class="glass-sidebar rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h3 class="font-bold text-base text-white flex items-center gap-2">
                    <i data-lucide="image" class="w-5 h-5 text-cyan-400"></i>
                    إدارة صور المنتج وملف الـ 3D (Front, Back, Gallery, 3D)
                </h3>
                <p class="text-xs text-slate-400 mt-1">أضف صورة الوجه، صورة الظهر، صور المعرض الإضافية، أو ملف ثلاثي الأبعاد بصيغة GLB/GLTF.</p>
            </div>
        </div>

        <!-- إضافة وسيط جديد -->
        <form action="{{ route('admin.media.add', $product->id) }}" method="POST" enctype="multipart/form-data" class="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            @csrf
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1.5">نوع الوسيط *</label>
                    <select name="media_type" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500">
                        <option value="front">صورة أمامية (Front View)</option>
                        <option value="back">صورة الظهر (Back View)</option>
                        <option value="gallery">صورة معرض إضافية (Gallery)</option>
                        <option value="model3d">ملف ثلاثي الأبعاد (3D Model .glb)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1.5">رفع ملف من الجهاز (اختياري)</label>
                    <input type="file" name="file" accept="image/*,.glb,.gltf" class="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1.5">أو رابط مباشر (URL)</label>
                    <input type="text" name="url" placeholder="https://... أو /manus-storage/..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500">
                </div>
            </div>

            <div class="flex items-center justify-between pt-2">
                <input type="text" name="alt_text" placeholder="نص وصفي بديل (Alt Text اختياري)" class="flex-1 ml-4 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500">
                <button type="submit" class="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition shrink-0 flex items-center gap-1.5">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i>
                    إضافة الوسيط
                </button>
            </div>
        </form>

        <!-- قائمة الوسائط الحالية للمنتج -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            @forelse($product->media as $media)
                <div class="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2 relative group">
                    <div class="aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative">
                        @if($media->media_type === 'model3d')
                            <div class="text-center p-3">
                                <i data-lucide="box" class="w-8 h-8 mx-auto text-cyan-400 mb-1"></i>
                                <span class="text-[10px] text-slate-400 block truncate font-mono">{{ basename($media->url) }}</span>
                            </div>
                        @else
                            <img src="{{ $media->url }}" alt="{{ $media->alt_text }}" class="w-full h-full object-cover">
                        @endif

                        <span class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-bold text-cyan-300">
                            {{ match($media->media_type) { 'front' => 'أمامي', 'back' => 'ظهر', 'gallery' => 'معرض', 'model3d' => '3D', default => $media->media_type } }}
                        </span>
                    </div>

                    <form action="{{ route('admin.media.delete', $media->id) }}" method="POST" onsubmit="return confirm('هل أنت متأكد من حذف هذا الوسيط؟');">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="w-full py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            حذف
                        </button>
                    </form>
                </div>
            @empty
                <div class="col-span-full p-6 rounded-2xl bg-slate-900/40 text-center text-xs text-slate-500">
                    لا توجد وسائط إضافية مضافة بعد. يمكنك رفع صورة الظهر أو ملف الـ 3D من النموذج أعلاه.
                </div>
            @endforelse
        </div>
    </div>
</div>
@endsection
