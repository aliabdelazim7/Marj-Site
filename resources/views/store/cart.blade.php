@extends('layouts.app')

@section('title', 'سلة المشتريات — مرج')

@section('content')
<div class="container commerce-page">
    <div class="commerce-heading">
        <div>
            <p class="kicker"><span class="red-block"></span> السلة</p>
            <h1>اختياراتك<br><em>جاهزة.</em></h1>
        </div>
        <p class="section-aside">راجع المقاس والكمية قبل إتمام الطلب.<br>الشحن متاح لجميع محافظات مصر.</p>
    </div>

    @if(!$cart || $cart->items->isEmpty())
        <div class="empty-commerce">
            <i data-lucide="shopping-bag" class="w-12 h-12 text-[#555] mx-auto"></i>
            <h2>السلة لسه فاضية</h2>
            <p>اختار هودي من المجموعة، أو جرّبه عليك أولًا.</p>
            <a href="{{ route('products.index') }}" class="inline-flex items-center gap-2 px-6 py-3 bg-[#0b7b8e] text-white font-bold text-sm">
                <span>استكشف المجموعة</span>
                <span>↙</span>
            </a>
        </div>
    @else
        <div class="cart-layout">
            <section class="cart-lines">
                @foreach($cart->items as $item)
                    <article class="cart-line">
                        <img src="{{ $item->variant?->product?->image_url }}" alt="{{ $item->variant?->product?->nameArabic }}">
                        <div class="cart-line-copy">
                            <p class="eyebrow">{{ $item->variant?->product?->name }}</p>
                            <h2>{{ $item->variant?->product?->nameArabic }}</h2>
                            <p>{{ $item->unit_price }} ج.م · المقاس {{ $item->variant?->size }}</p>
                            <a href="{{ route('products.show', $item->variant?->product?->slug) }}">عرض المنتج</a>
                        </div>
                        <div class="cart-line-actions">
                            <div class="quantity-control">
                                <form action="{{ route('cart.update', $item->id) }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="quantity" value="{{ max(1, $item->quantity - 1) }}">
                                    <button type="submit" aria-label="تقليل الكمية">−</button>
                                </form>
                                <strong>{{ $item->quantity }}</strong>
                                <form action="{{ route('cart.update', $item->id) }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="quantity" value="{{ $item->quantity + 1 }}">
                                    <button type="submit" aria-label="زيادة الكمية">+</button>
                                </form>
                            </div>
                            <strong>{{ $item->total_price }} ج.م</strong>
                            <form action="{{ route('cart.remove', $item->id) }}" method="POST">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="icon-danger" aria-label="حذف">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </form>
                        </div>
                    </article>
                @endforeach
            </section>

            <aside class="order-summary">
                <p class="eyebrow">ملخص الطلب</p>
                <div>
                    <span>الإجمالي الفرعي</span>
                    <strong>{{ $cart->subtotal }} ج.م</strong>
                </div>
                <div>
                    <span>الشحن</span>
                    <strong>يُحدد حسب المحافظة</strong>
                </div>
                <hr>
                <div class="summary-total">
                    <span>الإجمالي قبل الشحن</span>
                    <strong>{{ $cart->subtotal }} ج.م</strong>
                </div>
                <a href="{{ route('checkout.index') }}" class="cart-checkout-cta flex flex-col p-4 bg-[#0b7b8e] hover:bg-[#085a68] text-white transition mt-4">
                    <div class="flex items-center justify-between w-full font-bold text-base">
                        <span>إتمام الطلب</span>
                        <span>↙</span>
                    </div>
                    <small class="text-xs text-cyan-200 mt-0.5">اختر المحافظة وطريقة الدفع</small>
                </a>
                <p class="summary-note">
                    يظهر رسم الشحن النهائي بعد اختيار المحافظة في صفحة الإتمام. شحن مجاني للطلبات فوق {{ $storeSettings->free_shipping_threshold ?? 2000 }} ج.م.
                </p>
            </aside>
        </div>
    @endif
</div>
@endsection
