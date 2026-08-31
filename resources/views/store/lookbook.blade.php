@extends('layouts.app')

@section('title', 'اللوك بوك والتنسيقات — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-widest text-cyan-400">إطلالات الشارع والبحر</span>
        <h1 class="text-3xl sm:text-5xl font-black text-white mt-1">لوك بوك مرج 2026</h1>
        <p class="text-sm text-slate-400 mt-2">تنسيقات بصرية مختارة لقطع الهوديز الأساسية.</p>
    </div>

    @if($entries->isEmpty())
        <div class="text-center py-20 glass-panel rounded-3xl text-sm text-slate-400">
            سيتم نشر إطلالات المجموعة الجديدة قريباً!
        </div>
    @else
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($entries as $entry)
                <div class="group glass-panel rounded-3xl overflow-hidden border border-white/10 flex flex-col">
                    <div class="relative aspect-[3/4] bg-slate-900 overflow-hidden">
                        <img src="{{ $entry->image_url }}" alt="{{ $entry->title_arabic }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    </div>
                    <div class="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-black text-lg text-white">{{ $entry->title_arabic }}</h3>
                            <div class="text-xs text-slate-400 mt-0.5">{{ $entry->title }}</div>
                            @if($entry->description)
                                <p class="text-xs text-slate-300 mt-2 leading-relaxed">{{ $entry->description }}</p>
                            @endif
                        </div>

                        @if($entry->product)
                            <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <span class="font-bold text-sm text-cyan-400">{{ $entry->product->effective_price }} ج.م</span>
                                <a href="{{ route('products.show', $entry->product->slug) }}" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition">
                                    تسوق هذا الهودي ➔
                                </a>
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>
@endsection
