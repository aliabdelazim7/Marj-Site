@extends('layouts.app')

@section('title', 'إنشاء حساب جديد — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-md mx-auto px-4 py-16">
    <div class="glass-panel p-8 rounded-3xl space-y-6">
        <div class="text-center">
            <h1 class="text-2xl font-black text-white">إنشاء حساب جديد</h1>
            <p class="text-xs text-slate-400 mt-1">انضم لعائلة مرج واجمع نقاط ولاء مع كل طلب.</p>
        </div>

        <form action="{{ route('register') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">الاسم</label>
                <input type="text" name="name" required value="{{ old('name') }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                @error('name') <p class="text-xs text-rose-400 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                <input type="email" name="email" required value="{{ old('email') }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                @error('email') <p class="text-xs text-rose-400 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور</label>
                <input type="password" name="password" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                @error('password') <p class="text-xs text-rose-400 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
                <input type="password" name="password_confirmation" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-bold text-sm">
                تسجيل الحساب
            </button>
        </form>

        <div class="text-center text-xs text-slate-400">
            لديك حساب بالفعل؟ <a href="{{ route('login') }}" class="text-cyan-400 font-bold hover:underline">تسجيل الدخول</a>
        </div>
    </div>
</div>
@endsection
