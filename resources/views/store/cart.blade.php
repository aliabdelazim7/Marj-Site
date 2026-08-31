@extends('layouts.app')

@section('title', 'سلة المشتريات — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <h1 class="text-3xl font-black text-white mb-8">سلة المشتريات</h1>

    @if(!$cart || $cart->items->isEmpty())
        <div class="text-center py-20 glass-panel rounded-3xl space-y-4">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <i data-lucide="shopping-bag" class="w-8 h-8"></i>
            </div>
            <h3 class="text-xl font-bold text-white">سلة المشتريات فارغة حالياً</h3>
            <p class="text-sm text-slate-400">تصفح تشكيلة الهوديز وأضف قطعك المفضلة إلى السلة.</p>
            <a href="{{ route('products.index') }}" class="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-bold text-sm">
                تصفح المنتجات
            </a>
        </div>
    @else
        <!-- شريط الشحن المجاني -->
        @php
            $threshold = $storeSettings->free_shipping_threshold ?? 2000;
            $subtotal = $cart->subtotal;
            $progress = min(100, ($subtotal / $threshold) * 100);
            $remaining = max(0, $threshold - $subtotal);
        @endphp

        <div class="glass-panel p-4 rounded-2xl mb-8 space-y-2">
            <div class="flex items-center justify-between text-xs sm:text-sm font-semibold">
                @if($remaining <= 0)
                    <span class="text-emerald-400 flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4"></i> مبروك! حصلت على شحن مجاني لكافة محافظات مصر.</span>
                @else
                    <span class="text-slate-300">أضف منتجات بقيمة <strong class="text-cyan-400">{{ $remaining }} ج.م</strong> إضافية للحصول على <strong class="text-emerald-400">شحن مجاني</strong>!</span>
                @endif
                <span class="text-slate-400">{{ (int)$progress }}%</span>
            </div>
            <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500" style="width: {{ $progress }}%"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <!-- قائمة المنتجات بالسلة -->
            <div class="lg:col-span-2 space-y-4">
                @foreach($cart->items as $item)
                    <div class="glass-panel p-4 sm:p-5 rounded-2xl flex items-center gap-4">
                        <img src="{{ $item->variant?->product?->image_url }}" alt="{{ $item->variant?->product?->nameArabic }}" class="w-20 h-20 rounded-xl object-cover bg-slate-900 shrink-0">
                        
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-sm text-white truncate">{{ $item->variant?->product?->nameArabic }}</h4>
                            <div class="text-xs text-slate-400 mt-0.5">المقاس: <span class="font-bold text-cyan-400">{{ $item->variant?->size }}</span> | {{ $item->variant?->color }}</div>
                            <div class="font-black text-sm text-white mt-2">{{ $item->unit_price }} ج.م</div>
                        </div>

                        <!-- تعديل الكمية وحذف -->
                        <div class="flex items-center gap-3">
                            <form action="{{ route('cart.update', $item->id) }}" method="POST" class="flex items-center gap-2">
                                @csrf
                                <input type="number" name="quantity" value="{{ $item->quantity }}" min="1" max="50" onchange="this.form.submit()" class="w-14 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs text-white text-center font-bold">
                            </form>

                            <form action="{{ route('cart.remove', $item->id) }}" method="POST">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition" title="حذف من السلة">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>

            <!-- ملخص السلة -->
            <div class="glass-panel p-6 rounded-3xl space-y-6">
                <h3 class="font-black text-lg text-white">ملخص الطلب</h3>

                <div class="space-y-3 text-sm">
                    <div class="flex justify-between text-slate-300">
                        <span>المجموع الفرعي:</span>
                        <span class="font-bold text-white">{{ $cart->subtotal }} ج.م</span>
                    </div>
                    <div class="flex justify-between text-slate-300">
                        <span>مصاريف الشحن:</span>
                        <span class="text-xs text-slate-400">تُحتسب في خطوة الدفع</span>
                    </div>
                </div>

                <div class="pt-4 border-t border-white/10 flex justify-between items-baseline font-black">
                    <span class="text-base text-white">الإجمالي التقديري:</span>
                    <span class="text-2xl text-cyan-400">{{ $cart->subtotal }} <span class="text-xs text-slate-400">ج.م</span></span>
                </div>

                <a href="{{ route('checkout.index') }}" class="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-black text-center text-sm hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition block">
                    الاستمرار إلى الدفع والشحن
                </a>
            </div>
        </div>
    @endif
</div>
@endsection
