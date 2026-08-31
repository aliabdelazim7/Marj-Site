@extends('layouts.admin')

@section('title', 'إدارة اللوك بوك — لوحة تحكم مرج')
@section('page_title', 'لوك بوك وتنسيقات مرج')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <form action="{{ route('admin.lookbook.store') }}" method="POST" class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        @csrf
        <h3 class="font-bold text-base text-white">إضافة إطلالة جديدة</h3>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">العنوان بالعربية *</label>
            <input type="text" name="title_arabic" required placeholder="إطلالة الشارع الشتوية" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">العنوان بالإنجليزية *</label>
            <input type="text" name="title" required placeholder="Winter Street Look" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">رابط الصورة *</label>
            <input type="text" name="image_url" required placeholder="/images/lookbook-1.jpg" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">ربط بهودي محدد (اختياري)</label>
            <select name="product_id" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
                <option value="">بدون ربط</option>
                @foreach($products as $p)
                    <option value="{{ $p->id }}">{{ $p->nameArabic }}</option>
                @endforeach
            </select>
        </div>
        <input type="hidden" name="published" value="1">
        <button type="submit" class="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">نشر الإطلالة</button>
    </form>

    <div class="lg:col-span-2 glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 class="font-bold text-base text-white">الإطلالات المنشورة</h3>
        <div class="grid grid-cols-2 gap-4">
            @foreach($entries as $entry)
                <div class="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
                    <img src="{{ $entry->image_url }}" alt="{{ $entry->title_arabic }}" class="w-full aspect-[3/4] object-cover rounded-xl bg-slate-950">
                    <strong class="text-white block">{{ $entry->title_arabic }}</strong>
                </div>
            @endforeach
        </div>
    </div>
</div>
@endsection
