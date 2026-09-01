# دليل رفع وتشغيل متجر «مرج» على هوستنجر (Hostinger Deployment Guide)

يوضح هذا الدليل خطوة بخطوة كيفية رفع وتشغيل متجر **مرج (Marj)** على استضافة **Hostinger** (سواء استضافة سحابية Cloud / Web Hosting عبر Node.js Selector أو خادم VPS).

---

## الطريقة الأولى: الرفع عبر استضافة Hostinger Web / Cloud Hosting (hPanel Node.js)

هذه هي الطريقة الأسهل والأكثر شيوعاً على هوستنجر باستخدام أداة **Node.js Selector** الموجودة في لوحة التحكم (hPanel).

### الخطوة 1: تجهيز وتحميل ملف المشروع
1. ادخل على مستودع GitHub: `https://github.com/aliabdelazim7/Marj-Site`
2. اضغط على زر **`Code`** الأخضر ثم اختر **`Download ZIP`**.
3. قم بفك الضغط عن الملف على جهازك إذا أردت تعديل ملف `.env` أو ارفعه كـ ZIP مباشرة عبر File Manager في هوستنجر.

---

### الخطوة 2: إنشاء قاعدة البيانات في Hostinger (MySQL Database)
1. من لوحة **hPanel**، توجه إلى قسم **Databases (قواعد البيانات)** -> **Management**.
2. أنشئ قاعدة بيانات جديدة:
   - **Database Name:** مثل `u123456789_marj`
   - **Database Username:** مثل `u123456789_marjuser`
   - **Password:** كلمة مرور قوية
3. افتح **phpMyAdmin** بجوار قاعدة البيانات التي أنشأتها.
4. اضغط على تبويب **Import (استيراد)** بالأعلى.
5. اختر الملف الموجود في المشروع:
   `drizzle/hostinger-schema.sql`
6. اضغط **Go / استيراد** لتنفيذ السكربت. (سيقوم بإنشاء الـ 22 جدولاً مع إضافة محافظات مصر، طرق الدفع، المنتجات الأساسية وإعدادات المتجر تلقائياً).

---

### الخطوة 3: إعداد تطبيق Node.js في Hostinger (hPanel Node.js App)
1. من لوحة **hPanel**، ابحث عن **Node.js** في شريط البحث أو من قسم **Advanced**.
2. اضغط **Create Application** (أو Add Application).
3. اضبط الإعدادات كالتالي:
   - **Node.js version:** اختر `20.x` أو `22.x` (LTS).
   - **Application Mode:** `Production`.
   - **Application Root:** مسار المجلد (مثل `/public_html` أو `/marj-site`).
   - **Application URL:** الدومين الخاص بك (مثل `marjstore.com` أو النطاق الفرعي).
   - **Application Startup File:** اكتب `app.js` أو `index.js`.
4. اضغط **Create**.

---

### الخطوة 4: رفع الملفات وضبط ملف البيئة `.env`
1. توجه إلى **File Manager (مدير الملفات)** وادخل إلى مجلد التطبيق (مثلاً `public_html`).
2. ارفع ملفات المشروع (تأكد من وجود مجلدات `client/`, `server/`, `shared/`, `drizzle/`, وملفات `package.json`, `app.js`, `index.js`, `.htaccess`).
3. أنشئ ملفاً باسم `.env` داخل المجلد الرئيسي للتطبيق وضع فيه المتغيرات التالية مع استبدال بياناتك الفعلية:

```env
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=مرج — متجر الهوديز
JWT_SECRET=اكتب_هنا_نص_سري_طويل_وعشوائي_لحماية_الجلسات

# رابط قاعدة البيانات في هوستنجر
DATABASE_URL=mysql://u123456789_marjuser:PASSWORD@127.0.0.1:3306/u123456789_marj

# مصادقة الدخول والـ OAuth (إن توفرت)
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=
OWNER_OPEN_ID=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

---

### الخطوة 5: تثبيت الحزم وبناء المشروع (NPM Install & Build)
1. عُد إلى صفحة **Node.js** في hPanel.
2. اضغط على زر **NPM Install** لتثبيت الحزم تلقائياً من `package.json`.
3. إذا أردت تشغيل سطر الأوامر عبر **SSH / Terminal** في هوستنجر:
   ```bash
   npm install
   npm run build
   ```
4. اضغط على زر **Restart Application** في لوحة التحكم لإعادة تشغيل السيرفر.
5. افتح موقعك لتجد المتجر يعمل بنجاح!

---

## الطريقة الثانية: الرفع على خادم Hostinger VPS (Ubuntu + PM2 + Nginx)

إذا كنت تستخدم سيرفر VPS على Hostinger:

1. **الاتصال بالسيرفر عبر SSH:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **تثبيت Node.js 20 و PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **سحب المشروع وتثبيته:**
   ```bash
   git clone https://github.com/aliabdelazim7/Marj-Site.git /var/www/marj
   cd /var/www/marj
   npm install
   npm run build
   ```

4. **إنشاء ملف `.env`:**
   ```bash
   cp .env.example .env
   nano .env
   ```

5. **تشغيل السيرفر عبر PM2 باستخدام ملف الإعداد الجاهز:**
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

6. **إعداد Nginx (Reverse Proxy):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## ملفات وميزات الدعم المرفقة لتسهيل الاستضافة

- `app.js` / `index.js`: ملفات نقطة انطلاق جاهزة ومباشرة لـ Hostinger Node.js Selector.
- `.htaccess`: إعدادات توجيه تلقائية لخوادم Apache / OpenLiteSpeed في Hostinger.
- `ecosystem.config.cjs`: ملف تشغيل PM2 جاهز لإدارة العمليات وإعادة التشغيل التلقائي.
- `drizzle/hostinger-schema.sql`: ملف SQL متكامل ومجهز للاستيراد المباشر بضغطة زر عبر phpMyAdmin.
