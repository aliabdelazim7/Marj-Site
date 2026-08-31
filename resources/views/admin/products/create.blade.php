@extends('layouts.admin')

@section('title', 'إضافة منتج جديد — لوحة تحكم مرج')
@section('page_title', 'إضافة هودي جديد للكتالوج')

@section('content')
<div class="max-w-3xl mx-auto">
    <form action="{{ route('admin.products.store') }}" method="POST" class="glass-sidebar rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
        @csrf
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الاسم بالعربية *</label>
                <input type="text" name="name_arabic" required value="{{ old('name_arabic') }}" placeholder="مثال: إشارة حمراء" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الاسم بالإنجليزية *</label>
                <input type="text" name="name" required value="{{ old('name') }}" placeholder="Signal Red" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الرابط الفريد (Slug) *</label>
                <input type="text" name="slug" required value="{{ old('slug') }}" placeholder="signal-red-hoodie" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الـ SKU الأساسي</label>
                <input type="text" name="sku" value="{{ old('sku') }}" placeholder="HF-SR-001" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">السعر الأساسي (ج.م) *</label>
                <input type="number" name="price" required min="1" value="{{ old('price', 899) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">السعر قبل الخصم (اختياري)</label>
                <input type="number" name="compare_at_price" min="1" value="{{ old('compare_at_price') }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">رابط صورة المنتج الأساسية *</label>
                <input type="text" name="image_url" required value="{{ old('image_url') }}" placeholder="/images/signal-red-front.jpg" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الوصف التفصيلي *</label>
                <textarea name="description" rows="3" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">{{ old('description') }}</textarea>
            </div>

            <input type="hidden" name="category" value="هوديز">
            <input type="hidden" name="stock_status" value="instock">
            <input type="hidden" name="status" value="active">
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-bold text-sm">
            حفظ المنتج وإعداد المقاسات
        </button>
    </form>
</div>
@endsection
