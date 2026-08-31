@extends('layouts.app')

@section('title', 'قائمة أمنياتي — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <h1 class="text-3xl font-black text-white mb-8">قائمة المفضلة</h1>

    @if($wishlists->isEmpty())
        <div class="text-center py-20 glass-panel rounded-3xl space-y-4">
            <i data-lucide="heart" class="w-12 h-12 mx-auto text-slate-500"></i>
            <h3 class="text-lg font-bold text-white">قائمة المفضلة فارغة حالياً</h3>
            <a href="{{ route('products.index') }}" class="inline-block px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">تصفح الهوديز</a>
        </div>
    @else
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($wishlists as $item)
                @if($item->product)
                    <div class="glass-panel rounded-3xl overflow-hidden p-4 space-y-3">
                        <img src="{{ $item->product->image_url }}" alt="{{ $item->product->nameArabic }}" class="w-full aspect-square object-cover rounded-2xl bg-slate-900">
                        <h4 class="font-bold text-white text-sm">{{ $item->product->nameArabic }}</h4>
                        <div class="font-black text-cyan-400">{{ $item->product->effective_price }} ج.م</div>
                        <a href="{{ route('products.show', $item->product->slug) }}" class="block w-full py-2 rounded-xl bg-cyan-500 text-slate-950 text-center font-bold text-xs">عرض المنتج</a>
                    </div>
                @endif
            @endforeach
        </div>
    @endif
</div>
@endsection
