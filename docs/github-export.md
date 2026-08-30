# GitHub export record

هذه الوثيقة تصف النسخة التي ستُرفع إلى `aliabdelazim7/Marg-Site`. تم جعل الريبو Private قبل الرفع، لكن الخصوصية لا تغيّر قاعدة عدم وضع credentials أو بيانات شخصية داخل Git history.

## Included

سيتم تضمين source code كاملًا للواجهة والخادم والـshared modules، مكونات UI، `package.json` و`pnpm-lock.yaml`، `tsconfig.json` وVite/Drizzle/Vitest configuration، migrations من `0000` إلى `0012`، schema وrelations، جميع اختبارات Vitest، التوثيق الموجود في `docs/` و`notes/`، `todo.md`، و`verification-notes.md`. سيتم تضمين standalone WordPress Virtual Try-On package إن كان موجودًا ضمن المشروع، مع توثيق أنه مسار منفصل عن runtime الحالي.

## Excluded

تُستبعد `node_modules/` و`dist/` و`.manus-logs/` و`.git/` المحلية وcoverage/cache/temporary artifacts و`.project-config.json` وملفات version/debug التي تديرها المنصة. تُستبعد كل ملفات `.env` والمفاتيح والشهادات وtokens وملفات customer/order exports وأي bytes أو secrets غير لازمة لبناء source. لا توجد حاجة لرفع قاعدة البيانات أو storage objects؛ migrations والتوثيق يكفيان لإعادة بناء المخطط، بينما الملفات الكبيرة تبقى في S3-compatible storage.

## Secret handling

يقرأ الخادم environment mapping من `server/_core/env.ts`. أسماء المتغيرات والاستخدامات موثقة في `docs/environment.md`، لكن القيم تُحقن في البيئة المحلية أو hosting secrets ولا تُكتب في الملفات. إذا ظهرت قيمة حساسة داخل تاريخ Git بالخطأ، يجب إبطالها وتدويرها قبل اعتبار الريبو آمنًا؛ حذف الملف من working tree وحده لا يزيلها من history.

## Reproducibility

بعد clone، يثبّت المطور Node.js وpnpm، يجهز القيم في `.env` المحلي من الوثيقة، ثم ينفذ `pnpm install`, `pnpm check`, `pnpm test`, `pnpm build`. يتطلب التشغيل قاعدة MySQL/TiDB وOAuth وbuilt-in forge configuration. تُطبق migrations بالترتيب بعد مراجعة بيئة قاعدة البيانات.

## Release traceability

آخر checkpoint منشور قبل هذا التصدير هو `1425b591`. إصلاح parity في محرر المنتج الجديد يجعل أقسام الصور/GLB والـvariations ظاهرة قبل الحفظ مع تعطيلها إلى أن يتوفر `productId`. تم رفع النسخة إلى [aliabdelazim7/Marg-Site](https://github.com/aliabdelazim7/Marg-Site) وهو Private حاليًا. commit التصدير هو [`6eee8c09a2d1d9f8150f29df0b181202d6b92392`](https://github.com/aliabdelazim7/Marg-Site/commit/6eee8c09a2d1d9f8150f29df0b181202d6b92392)، وتمت مطابقة `origin/main` مع هذا الـSHA.
