@extends('layouts.admin')

@section('title', 'طرق الدفع — لوحة تحكم مرج')
@section('page_title', 'طرق الدفع والتحويل')

@section('content')
<div class="space-y-6 max-w-4xl mx-auto">
    <div class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-6">
        <h3 class="font-bold text-base text-white">طرق الدفع المتاحة</h3>

        <div class="space-y-4">
            @foreach($methods as $method)
                <form action="{{ route('admin.payments.methods.update', $method->id) }}" method="POST" class="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 text-xs">
                    @csrf
                    @method('PUT')
                    <div class="flex items-center justify-between">
                        <strong class="text-white text-sm">{{ $method->label }} ({{ $method->code }})</strong>
                        <label class="flex items-center gap-2 text-slate-300 cursor-pointer">
                            <input type="checkbox" name="enabled" value="1" {{ $method->enabled ? 'checked' : '' }} class="rounded bg-slate-950 text-cyan-500">
                            تفعيل
                        </label>
                    </div>

                    <input type="text" name="label" value="{{ $method->label }}" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white">

                    @if($method->type === 'manual_transfer')
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-1">رقم المحفظة / WhatsApp لاستلام الإيصالات</label>
                            <input type="text" name="whatsapp_number" value="{{ $method->whatsapp_number }}" placeholder="01012345678" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white">
                        </div>
                    @endif

                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">تعليمات الدفع المعروضة للعميل</label>
                        <textarea name="instructions" rows="2" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white">{{ $method->instructions }}</textarea>
                    </div>

                    <button type="submit" class="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">حفظ الإعدادات</button>
                </form>
            @endforeach
        </div>
    </div>
</div>
@endsection
