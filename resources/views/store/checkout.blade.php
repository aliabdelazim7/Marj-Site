@extends('layouts.app')

@section('title', 'إتمام الطلب — مرج')

@section('content')
<div class="container checkout-page" x-data="{
    subtotal: {{ $cart->subtotal }},
    shippingFee: 45,
    couponCode: '',
    couponDiscount: 0,
    couponMessage: '',
    couponSuccess: false,
    selectedGovernorate: 'القاهرة',
    paymentMethod: 'cod',
    consent: true,
    zones: {{ Js::from($shippingZones) }},
    updateShipping() {
        let zone = this.zones.find(z => z.governorate === this.selectedGovernorate);
        @if($storeSettings->free_shipping_threshold && $cart->subtotal >= $storeSettings->free_shipping_threshold)
            this.shippingFee = 0;
        @else
            this.shippingFee = zone ? zone.fee : {{ $storeSettings->shipping_fee ?? 50 }};
        @endif
    },
    applyCoupon() {
        if (!this.couponCode) return;
        fetch('{{ route('checkout.validate-coupon') }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content
            },
            body: JSON.stringify({ code: this.couponCode, subtotal: this.subtotal })
        })
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
                this.couponDiscount = data.discount;
                this.couponMessage = data.message;
                this.couponSuccess = true;
            } else {
                this.couponDiscount = 0;
                this.couponMessage = data.message;
                this.couponSuccess = false;
            }
        });
    },
    get finalTotal() {
        return Math.max(0, this.subtotal - this.couponDiscount) + this.shippingFee;
    }
}" x-init="updateShipping()">

    <div class="commerce-heading">
        <div>
            <p class="kicker"><span class="red-block"></span> إتمام الطلب</p>
            <h1>بيانات<br><em>الشحن والدفع.</em></h1>
        </div>
        <p class="section-aside">خطوات بسيطة لتأكيد شحنتك.<br>توصيل سريع لباب بيتك مع معاينة عند الاستلام.</p>
    </div>

    @if(!$cart || $cart->items->isEmpty())
        <div class="empty-commerce">
            <h2>لا توجد عناصر في السلة</h2>
            <p>أضف هودي من المجموعة أولاً للوصول لصفحة الشحن.</p>
            <a href="{{ route('products.index') }}" class="text-xs font-bold text-[#0b7b8e]">استكشف المجموعة ↙</a>
        </div>
    @else
        <form action="{{ route('checkout.process') }}" method="POST">
            @csrf
            <div class="checkout-layout">
                <!-- نماذج الشحن والبيانات -->
                <div class="checkout-form">
                    <!-- 1. بيانات المستلم -->
                    <div class="form-section">
                        <p class="eyebrow">01 / المستلم</p>
                        <div class="form-grid">
                            <label>
                                <span>الاسم بالكامل *</span>
                                <input type="text" name="customer_name" required value="{{ old('customer_name', auth()->user()?->name) }}" placeholder="الاسم ثلاثي">
                            </label>
                            <label>
                                <span>رقم الهاتف (WhatsApp) *</span>
                                <input type="tel" name="phone" required placeholder="01xxxxxxxxx" value="{{ old('phone') }}">
                            </label>
                        </div>
                        <label>
                            <span>البريد الإلكتروني *</span>
                            <input type="email" name="email" required value="{{ old('email', auth()->user()?->email) }}" placeholder="name@example.com">
                        </label>
                    </div>

                    <!-- 2. عنوان التوصيل -->
                    <div class="form-section">
                        <p class="eyebrow">02 / التوصيل</p>
                        <div class="form-grid">
                            <label>
                                <span>المحافظة *</span>
                                <select name="city" x-model="selectedGovernorate" @change="updateShipping()" class="border border-[#aaa] bg-white p-3.5 outline-none">
                                    @foreach($shippingZones as $zone)
                                        <option value="{{ $zone->governorate }}">{{ $zone->governorate }} ({{ $zone->fee }} ج.م)</option>
                                    @endforeach
                                </select>
                            </label>
                            <label>
                                <span>المنطقة / الحي *</span>
                                <input type="text" name="area" required placeholder="مثال: المعادي / الدقي / سموحة" value="{{ old('area') }}">
                            </label>
                        </div>
                        <label>
                            <span>العنوان بالتفصيل (اسم الشارع، العمارة، الشقة) *</span>
                            <textarea name="address" rows="2" required placeholder="اكتب تفاصيل العنوان لسهولة وصول مندوب الشحن">{{ old('address') }}</textarea>
                        </label>
                    </div>

                    <!-- 3. طريقة الدفع -->
                    <div class="form-section">
                        <p class="eyebrow">03 / طريقة الدفع</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label class="border p-4 cursor-pointer flex items-center gap-3 transition" :class="paymentMethod === 'cod' ? 'border-[#0b7b8e] bg-[#e7f0ed]' : 'border-[#aaa] bg-white'">
                                <input type="radio" name="payment_method" value="cod" x-model="paymentMethod" class="accent-[#0b7b8e]">
                                <div>
                                    <strong class="block text-sm text-[#111]">الدفع عند الاستلام (COD)</strong>
                                    <small class="text-xs text-slate-500">ادفع نقدًا عند استلام الشحنة ومعاينتها</small>
                                </div>
                            </label>

                            <label class="border p-4 cursor-pointer flex items-center gap-3 transition" :class="paymentMethod === 'instapay' ? 'border-[#0b7b8e] bg-[#e7f0ed]' : 'border-[#aaa] bg-white'">
                                <input type="radio" name="payment_method" value="instapay" x-model="paymentMethod" class="accent-[#0b7b8e]">
                                <div>
                                    <strong class="block text-sm text-[#111]">إنستاباي / محفظة إلكترونية</strong>
                                    <small class="text-xs text-slate-500">تحويل سريع مع إرسال إشعار WhatsApp</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- الموافقة والإقرار -->
                    <div class="checkout-consent">
                        <input type="checkbox" id="consent" required x-model="consent" class="accent-[#0b7b8e]">
                        <span>أوافق على استلام الشحنة والتواصل عبر رقم الهاتف لتأكيد الموعد والتفاصيل.</span>
                    </div>

                    <!-- زر تأكيد الطلب -->
                    <button type="submit" class="submit-order p-4 bg-[#0b7b8e] hover:bg-[#085a68] text-white font-bold text-base transition flex items-center justify-between">
                        <span>تأكيد الطلب والشحن</span>
                        <span>↙</span>
                    </button>
                </div>

                <!-- ملخص الطلب الجانبي -->
                <aside class="order-summary">
                    <p class="eyebrow">عناصر الطلب</p>
                    
                    <div class="space-y-3 pb-3 border-b border-[#ccc]">
                        @foreach($cart->items as $item)
                            <div class="mini-line">
                                <img src="{{ $item->variant?->product?->image_url }}" alt="{{ $item->variant?->product?->nameArabic }}">
                                <span>
                                    {{ $item->variant?->product?->nameArabic }}
                                    <small>مقاس {{ $item->variant?->size }} × {{ $item->quantity }}</small>
                                </span>
                                <strong>{{ $item->total_price }} ج.م</strong>
                            </div>
                        @endforeach
                    </div>

                    <!-- كود الخصم -->
                    <div class="pt-3">
                        <div class="flex gap-2">
                            <input type="text" x-model="couponCode" placeholder="كود الخصم" class="border border-[#aaa] p-2 text-xs flex-1 uppercase">
                            <button type="button" @click="applyCoupon()" class="px-4 py-2 bg-[#111] text-white text-xs font-bold">تطبيق</button>
                        </div>
                        <template x-if="couponMessage">
                            <div class="text-[11px] mt-1 font-bold" :class="couponSuccess ? 'text-emerald-700' : 'text-rose-700'" x-text="couponMessage"></div>
                        </template>
                    </div>

                    <hr>

                    <div>
                        <span>المجموع الفرعي:</span>
                        <strong>{{ $cart->subtotal }} ج.م</strong>
                    </div>

                    <template x-if="couponDiscount > 0">
                        <div class="text-emerald-700">
                            <span>خصم الكوبون:</span>
                            <strong>-<span x-text="couponDiscount"></span> ج.م</strong>
                        </div>
                    </template>

                    <div>
                        <span>الشحن (<span x-text="selectedGovernorate"></span>):</span>
                        <strong x-text="shippingFee === 0 ? 'مجاني' : shippingFee + ' ج.م'"></strong>
                    </div>

                    <hr>

                    <div class="summary-total">
                        <span>الإجمالي النهائي:</span>
                        <strong class="text-xl text-[#0b7b8e]"><span x-text="finalTotal"></span> ج.م</strong>
                    </div>

                    <p class="summary-note">
                        شحن مجاني لكافة محافظات مصر عند وصول الطلب إلى {{ $storeSettings->free_shipping_threshold ?? 2000 }} ج.م.
                    </p>
                </aside>
            </div>
        </form>
    @endif
</div>
@endsection
