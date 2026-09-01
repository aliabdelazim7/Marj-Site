@extends('layouts.admin')

@section('title', 'فريق العمل — لوحة تحكم مرج')
@section('page_title', 'إدارة صلاحيات فريق العمل')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <form action="{{ route('admin.team.invites.create') }}" method="POST" class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        @csrf
        <h3 class="font-bold text-base text-white">دعوة عضو جديد للفريق</h3>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">الدور والصلاحية *</label>
            <select name="role" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
                <option value="store_manager">مدير متجر (كامل الصلاحيات)</option>
                <option value="order_operator">مسؤول طلبات (متابعة وتحديث الطلبات)</option>
                <option value="catalog_editor">محرر منتجات (الكتالوج والمخزون)</option>
                <option value="analytics_viewer">مشاهد تحليلات (التقارير فقط)</option>
            </select>
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">صلاحية الرابط *</label>
            <select name="expires_in_hours" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
                <option value="72">72 ساعة (3 أيام)</option>
                <option value="24">24 ساعة (يوم واحد)</option>
                <option value="168">7 أيام (أسبوع)</option>
                <option value="unlimited">غير محدد</option>
            </select>
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">توليد رابط الدعوة</button>
    </form>

    <div class="lg:col-span-2 glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 class="font-bold text-base text-white">أعضاء الفريق الحاليين</h3>

        <div class="space-y-3">
            @foreach($members as $member)
                <div class="p-4 rounded-2xl bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                        <strong class="text-white text-sm block">{{ $member->user?->name }}</strong>
                        <span class="text-slate-400">{{ $member->user?->email }} • دور: <strong class="text-cyan-400">{{ $member->role }}</strong></span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
@endsection
