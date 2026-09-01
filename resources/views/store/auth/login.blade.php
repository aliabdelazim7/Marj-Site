@extends('layouts.app')

@section('title', 'تسجيل الدخول — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-md mx-auto px-4 py-16">
    <div class="glass-panel p-8 rounded-3xl space-y-6">
        <div class="text-center">
            <h1 class="text-2xl font-black text-white">تسجيل الدخول</h1>
            <p class="text-xs text-slate-400 mt-1">سجل دخولك لمتابعة طلباتك ونقاط الولاء.</p>
        </div>

        <form action="{{ route('login') }}" method="POST" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                <input type="email" name="email" required value="{{ old('email') }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
                @error('email') <p class="text-xs text-rose-400 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور</label>
                <input type="password" name="password" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div class="flex items-center justify-between text-xs">
                <label class="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" name="remember" class="rounded bg-slate-900 text-cyan-500 focus:ring-cyan-500">
                    تذكرني
                </label>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-bold text-sm">
                دخول
            </button>
        </form>

        <div class="text-center text-xs text-slate-400">
            ليس لديك حساب؟ <a href="{{ route('register') }}" class="text-cyan-400 font-bold hover:underline">إنشاء حساب جديد</a>
        </div>
    </div>
</div>
@endsection
