@extends('layouts.admin')

@section('title', 'إدارة التصنيفات — لوحة تحكم مرج')
@section('page_title', 'تصنيفات المتجر')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <form action="{{ route('admin.categories.store') }}" method="POST" class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        @csrf
        <h3 class="font-bold text-base text-white">إضافة تصنيف جديد</h3>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">اسم التصنيف *</label>
            <input type="text" name="name" required placeholder="مثال: هوديز شتوية" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">الرابط الفريد (Slug) *</label>
            <input type="text" name="slug" required placeholder="winter-hoodies" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>
        <input type="hidden" name="status" value="active">
        <button type="submit" class="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">إضافة التصنيف</button>
    </form>

    <div class="lg:col-span-2 glass-sidebar rounded-3xl p-6 border border-white/5">
        <h3 class="font-bold text-base text-white mb-4">التصنيفات الحالية</h3>
        <div class="space-y-3">
            @foreach($categories as $category)
                <div class="p-4 rounded-2xl bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                        <strong class="text-white text-sm block">{{ $category->name }}</strong>
                        <span class="text-slate-500 font-mono">{{ $category->slug }} • {{ $category->products_count }} منتج</span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
@endsection
