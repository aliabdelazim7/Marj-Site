@extends('layouts.app')

@section('title', 'إتمام الطلب — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16" x-data="{
    subtotal: {{ $cart->subtotal }},
    shippingFee: 45,
    couponCode: '',
    couponDiscount: 0,
    couponMessage: '',
    couponSuccess: false,
    redeemPoints: 0,
    maxPoints: {{ $loyaltyPoints }},
    pointsDiscount: 0,
    selectedGovernorate: 'القاهرة',
    paymentMethod: 'cod',
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
    updatePoints() {
        this.pointsDiscount = Math.min(this.redeemPoints, this.maxPoints, Math.max(0, this.subtotal - this.couponDiscount));
    },
    get finalTotal() {
        return Math.max(0, this.subtotal - this.couponDiscount - this.pointsDiscount) + this.shippingFee;
    }
}" x-init="updateShipping()">
    <h1 class="text-3xl font-black text-white mb-8">إتمام الطلب والشحن</h1>

    <form action="{{ route('checkout.process') }}" method="POST">
        @csrf
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <!-- نموذج بيانات العميل والشحن -->
            <div class="lg:col-span-2 space-y-6">
                <!-- بيانات العميل -->
                <div class="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 class="font-bold text-base text-white flex items-center gap-2">
                        <i data-lucide="user" class="w-4 h-4 text-cyan-400"></i>
                        بيانات المستلم
                    </h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1.5">الاسم بالكامل *</label>
                            <input type="text" name="customer_name" required value="{{ old('customer_name', auth()->user()?->name) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1.5">رقم الهاتف (WhatsApp) *</label>
                            <input type="tel" name="phone" required placeholder="01xxxxxxxxx" value="{{ old('phone') }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                        </div>

                        <div class="sm:col-span-2">
                            <label class="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني *</label>
                            <input type="email" name="email" required value="{{ old('email', auth()->user()?->email) }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                        </div>
                    </div>
                </div>

                <!-- عنوان الشحن -->
                <div class="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 class="font-bold text-base text-white flex items-center gap-2">
                        <i data-lucide="map-pin" class="w-4 h-4 text-cyan-400"></i>
                        عنوان التوصيل
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1.5">المحافظة *</label>
                            <select name="city" x-model="selectedGovernorate" @change="updateShipping()" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                                @foreach($shippingZones as $zone)
                                    <option value="{{ $zone->governorate }}">{{ $zone->governorate }} ({{ $zone->fee }} ج.م - {{ $zone->delivery_note }})</option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1.5">العنوان بالتفصيل (الشارع، رقم العمارة، الشقة) *</label>
                            <textarea name="address" rows="2" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">{{ old('address') }}</textarea>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1.5">ملاحظات للمندوب (اختياري)</label>
                            <input type="text" name="notes" placeholder="مثال: الاتصال قبل الوصول بنصف ساعة" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                        </div>
                    </div>
                </div>

                <!-- طريقة الدفع -->
                <div class="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 class="font-bold text-base text-white flex items-center gap-2">
                        <i data-lucide="credit-card" class="w-4 h-4 text-cyan-400"></i>
                        طريقة الدفع
                    </h3>

                    <div class="space-y-3">
                        @foreach($paymentMethods as $method)
                            <label class="flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer" :class="paymentMethod === '{{ $method->code }}' ? 'bg-cyan-500/10 border-cyan-400 text-white' : 'bg-slate-900/60 border-white/10 text-slate-300'">
                                <div class="flex items-center gap-3">
                                    <input type="radio" name="payment_method" value="{{ $method->code }}" x-model="paymentMethod" class="text-cyan-500 focus:ring-cyan-500">
                                    <span class="font-bold text-sm">{{ $method->label }}</span>
                                </div>
                                <span class="text-xs text-slate-400">{{ $method->type === 'cod' ? 'نقدًا عند الاستلام' : 'تحويل محفظة / إيصال' }}</span>
                            </label>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- ملخص الطلب والكوبون -->
            <div class="space-y-6">
                <!-- الكوبون ونقاط الولاء -->
                <div class="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 class="font-bold text-base text-white">كوبون الخصم ونقاط الولاء</h3>

                    <!-- كود الخصم -->
                    <div>
                        <div class="flex gap-2">
                            <input type="text" name="coupon_code" x-model="couponCode" placeholder="أدخل كود الخصم..." class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white uppercase focus:outline-none focus:border-cyan-500">
                            <button type="button" @click="applyCoupon()" class="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shrink-0">تطبيق</button>
                        </div>
                        <template x-if="couponMessage">
                            <p class="text-xs mt-1.5" :class="couponSuccess ? 'text-emerald-400' : 'text-rose-400'" x-text="couponMessage"></p>
                        </template>
                    </div>

                    <!-- نقاط الولاء -->
                    @if($loyaltyPoints > 0)
                        <div class="pt-4 border-t border-white/10 space-y-2">
                            <div class="flex justify-between text-xs text-slate-300">
                                <span>نقاط الولاء المتاحة:</span>
                                <span class="font-bold text-cyan-400">{{ $loyaltyPoints }} نقطة ({{ $loyaltyPoints }} ج.م)</span>
                            </div>
                            <input type="number" name="redeem_points" x-model.number="redeemPoints" @input="updatePoints()" min="0" max="{{ $loyaltyPoints }}" placeholder="النقاط المراد استخدامها" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500">
                        </div>
                    @endif
                </div>

                <!-- الفاتورة النهائية -->
                <div class="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 class="font-black text-lg text-white">تفاصيل الحساب</h3>

                    <div class="space-y-2.5 text-sm text-slate-300">
                        <div class="flex justify-between">
                            <span>المجموع الفرعي:</span>
                            <span class="font-bold text-white" x-text="subtotal + ' ج.م'"></span>
                        </div>
                        <template x-if="couponDiscount > 0">
                            <div class="flex justify-between text-emerald-400 font-bold">
                                <span>خصم الكوبون:</span>
                                <span x-text="'-' + couponDiscount + ' ج.م'"></span>
                            </div>
                        </template>
                        <template x-if="pointsDiscount > 0">
                            <div class="flex justify-between text-cyan-400 font-bold">
                                <span>خصم نقاط الولاء:</span>
                                <span x-text="'-' + pointsDiscount + ' ج.م'"></span>
                            </div>
                        </template>
                        <div class="flex justify-between">
                            <span>مصاريف الشحن:</span>
                            <span class="font-bold text-white" x-text="shippingFee === 0 ? 'مجاناً' : shippingFee + ' ج.م'"></span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-white/10 flex justify-between items-baseline font-black">
                        <span class="text-base text-white">الإجمالي للدفع:</span>
                        <span class="text-2xl text-cyan-400" x-text="finalTotal + ' ج.م'"></span>
                    </div>

                    <button type="submit" class="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-black text-sm hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition">
                        تأكيد الطلب الآن
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection
