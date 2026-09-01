@extends('layouts.app')

@section('title', 'اللوك بوك — مرج')

@section('content')
<div class="container commerce-page">
    <header class="commerce-heading">
        <div>
            <p class="kicker"><span class="red-block"></span> LOOKBOOK</p>
            <h1>الهوية<br><em>في حركة.</em></h1>
        </div>
        <p class="section-aside">اختيارات بصرية وتنسيقات ينشرها المتجر بنفسه.</p>
    </header>

    @if(!isset($entries) || $entries->isEmpty())
        <div class="empty-commerce">
            <i data-lucide="image" class="w-10 h-10 text-[#555] mx-auto"></i>
            <h2>تنسيقات اللوك بوك</h2>
            <p>سيتم نشر صور وتنسيقات اللوك بوك قريباً مع إطلاق المجموعات الجديدة.</p>
            <a href="{{ route('products.index') }}" class="px-6 py-3 bg-[#0b7b8e] text-white font-bold text-xs">
                تسوق المنتجات ↙
            </a>
        </div>
    @else
        <section class="lookbook-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($entries as $index => $entry)
                <article class="lookbook-card border-t border-[#111] pt-3 space-y-3">
                    <img src="{{ $entry->image_url }}" alt="{{ $entry->title_arabic ?? $entry->title }}" class="w-full aspect-[4/5] object-cover bg-[#eeece7]">
                    <div>
                        <p class="eyebrow">LOOKBOOK / {{ sprintf('%02d', $index + 1) }}</p>
                        <h2 class="text-xl font-bold text-[#111] mt-1">{{ $entry->title_arabic ?? $entry->title }}</h2>
                        @if($entry->description)
                            <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ $entry->description }}</p>
                        @endif
                    </div>
                </article>
            @endforeach
        </section>
    @endif
</div>
@endsection
