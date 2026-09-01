@extends('layouts.app')

@section('title', 'تتبع طلبك — مرج')

@section('content')
<div class="container checkout-page" x-data="{
    orderNumber: '',
    email: '',
    loading: false,
    order: null,
    error: '',
    statusLabels: {
        'pending': 'استلمنا الطلب',
        'confirmed': 'أكدنا التفاصيل',
        'processing': 'بنجهز طلبك',
        'shipped': 'خرج للتوصيل',
        'delivered': 'تم التسليم'
    },
    statuses: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'],
    async searchOrder() {
        if (!this.orderNumber || !this.email) return;
        this.loading = true;
        this.error = '';
        this.order = null;

        try {
            let res = await fetch('{{ route('track-order.search') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ order_number: this.orderNumber, email: this.email })
            });

            let data = await res.json();
            this.loading = false;

            if (data.success && data.order) {
                this.order = data.order;
            } else {
                this.error = data.message || 'لم نتمكن من العثور على طلب بهذه البيانات. تأكد من رقم الطلب والبريد.';
            }
        } catch (e) {
            this.loading = false;
            this.error = 'حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.';
        }
    }
}">
    <div class="commerce-heading">
        <div>
            <p class="kicker"><span class="red-block"></span> متابعة الطلب</p>
            <h1>أين وصل<br><em>طلبك؟</em></h1>
        </div>
        <p class="section-aside">اكتب رقم الطلب والبريد المستخدم<br>عند إتمام الشراء.</p>
    </div>

    <div class="track-layout">
        <!-- نموذج البحث -->
        <form class="track-form" @submit.prevent="searchOrder">
            <label>
                <span>رقم الطلب</span>
                <input required type="text" x-model="orderNumber" placeholder="MRJ-XXXXXXXX" class="uppercase">
            </label>
            <label>
                <span>البريد الإلكتروني</span>
                <input required type="email" x-model="email" placeholder="name@example.com">
            </label>
            <button type="submit" class="p-3.5 bg-[#0b7b8e] hover:bg-[#085a68] text-white font-bold text-xs flex items-center justify-between transition" :disabled="loading">
                <span x-text="loading ? 'جاري البحث...' : 'ابحث عن الطلب'"></span>
                <i data-lucide="search" class="w-4 h-4"></i>
            </button>

            <template x-if="error">
                <div class="error-message" role="alert" x-text="error"></div>
            </template>
        </form>

        <!-- نتيجة البحث ومخطط الشحنة -->
        <template x-if="order">
            <section class="track-result">
                <div class="track-result-head">
                    <div>
                        <p class="eyebrow" x-text="order.order_number"></p>
                        <h2 x-text="statusLabels[order.status] || order.status"></h2>
                    </div>
                    <strong x-text="order.total + ' ج.م'"></strong>
                </div>

                <div class="status-timeline">
                    <template x-for="(st, idx) in statuses" :key="st">
                        <div class="status-step" :class="{ 'done': statuses.indexOf(order.status) >= idx }">
                            <span x-text="statuses.indexOf(order.status) >= idx ? '✓' : (idx + 1)"></span>
                            <small x-text="statusLabels[st]"></small>
                        </div>
                    </template>
                </div>

                <div class="track-items">
                    <template x-for="item in (order.items || [])" :key="item.id">
                        <div class="flex justify-between py-2 border-b border-[#eee]">
                            <span x-text="item.product_name + ' · مقاس ' + item.size + ' × ' + item.quantity"></span>
                            <strong x-text="item.line_total + ' ج.م'"></strong>
                        </div>
                    </template>
                </div>

                <p class="track-note mt-4 text-xs text-slate-500">
                    الدفع عند الاستلام ويتم تأكيد موعد التوصيل معك هاتفياً قبل وصول المندوب.
                </p>
            </section>
        </template>
    </div>
</div>
@endsection
