@extends('layouts.admin')

@section('title', 'المراجعات والتقييمات — لوحة تحكم مرج')
@section('page_title', 'مراجعات المشترين الموثقة')

@section('content')
<div class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-6">
    <h3 class="font-bold text-base text-white">التقييمات المسجلة</h3>

    @if($reviews->isEmpty())
        <p class="text-xs text-slate-500 text-center py-8">لا توجد مراجعات حتى الآن.</p>
    @else
        <div class="space-y-4">
            @foreach($reviews as $review)
                <div class="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 text-xs">
                    <div class="flex items-center justify-between">
                        <div>
                            <strong class="text-white text-sm block">{{ $review->customer_name }}</strong>
                            <span class="text-slate-400">طلب #{{ $review->order?->order_number }} • منتج: {{ $review->product?->nameArabic }}</span>
                        </div>
                        <div class="flex text-amber-400 text-sm">
                            @for($i = 0; $i < $review->rating; $i++) ★ @endfor
                        </div>
                    </div>

                    <p class="text-slate-300 leading-relaxed">{{ $review->body }}</p>

                    <div class="flex items-center justify-between pt-2 border-t border-white/5">
                        <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold {{ $review->status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : ($review->status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400') }}">
                            {{ $review->status === 'approved' ? 'معتمد ومنشور' : ($review->status === 'rejected' ? 'مرفوض' : 'قيد المراجعة') }}
                        </span>

                        <div class="flex items-center gap-2">
                            @if($review->status !== 'approved')
                                <form action="{{ route('admin.reviews.update-status', $review->id) }}" method="POST">
                                    @csrf
                                    @method('PUT')
                                    <input type="hidden" name="status" value="approved">
                                    <button type="submit" class="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500 hover:text-slate-950 transition">قبول ونشر</button>
                                </form>
                            @endif

                            @if($review->status !== 'rejected')
                                <form action="{{ route('admin.reviews.update-status', $review->id) }}" method="POST">
                                    @csrf
                                    @method('PUT')
                                    <input type="hidden" name="status" value="rejected">
                                    <button type="submit" class="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500 hover:text-slate-950 transition">رفض</button>
                                </form>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-6">
            {{ $reviews->links() }}
        </div>
    @endif
</div>
@endsection
