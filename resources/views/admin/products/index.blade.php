@extends('layouts.admin')

@section('title', 'إدارة المنتجات — لوحة تحكم مرج')
@section('page_title', 'المنتجات والـ SKUs')

@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <p class="text-xs text-slate-400">إدارة كتالوج الهوديز، المقاسات، والمخزون والوسائط.</p>
        <a href="{{ route('admin.products.create') }}" class="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            إضافة منتج جديد
        </a>
    </div>

    <div class="glass-sidebar rounded-3xl p-6 border border-white/5">
        <div class="overflow-x-auto">
            <table class="w-full text-right text-xs">
                <thead>
                    <tr class="text-slate-400 border-b border-white/5">
                        <th class="pb-3">المنتج</th>
                        <th class="pb-3">الـ SKU</th>
                        <th class="pb-3">السعر</th>
                        <th class="pb-3">المخزون الإجمالي</th>
                        <th class="pb-3">الحالة</th>
                        <th class="pb-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    @foreach($products as $product)
                        <tr class="hover:bg-white/5 transition">
                            <td class="py-3 flex items-center gap-3">
                                <img src="{{ $product->image_url }}" alt="{{ $product->nameArabic }}" class="w-10 h-10 rounded-lg object-cover bg-slate-900">
                                <div>
                                    <strong class="text-white block">{{ $product->nameArabic }}</strong>
                                    <span class="text-slate-400">{{ $product->name }}</span>
                                </div>
                            </td>
                            <td class="py-3 font-mono text-slate-300">{{ $product->sku ?? '—' }}</td>
                            <td class="py-3 font-bold text-cyan-400">{{ $product->effective_price }} ج.م</td>
                            <td class="py-3">
                                @php $totalStock = $product->variants->sum('stock'); @endphp
                                <span class="px-2 py-0.5 rounded-lg {{ $totalStock <= 5 ? 'bg-rose-500/10 text-rose-400 font-bold' : 'text-slate-300' }}">
                                    {{ $totalStock }} قطعة
                                </span>
                            </td>
                            <td class="py-3">
                                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold {{ $product->status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400' }}">
                                    {{ $product->status === 'active' ? 'نشط' : 'مسودة' }}
                                </span>
                            </td>
                            <td class="py-3 text-left">
                                <a href="{{ route('admin.products.edit', $product->id) }}" class="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition font-bold">
                                    تعديل
                                </a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="mt-6">
            {{ $products->links() }}
        </div>
    </div>
</div>
@endsection
