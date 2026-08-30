# مرج — Handoff Document للفريق التالي

**آخر تحديث:** 30 أغسطس 2026

**الهدف من الوثيقة:** تمكين أي Technical Team أو Developer جديد من فهم سبب بناء متجر مرج، وما تم إنجازه، وما هي القرارات التي يجب عدم كسرها، وكيف يبدأ العمل بأقل وقت ضائع وأقل مخاطرة.

> اقرأ هذه الوثيقة مع `README.md` و`docs/environment.md` و`verification-notes.md` و`todo.md`. مصدر الكود المرفوع هو [aliabdelazim7/Marg-Site](https://github.com/aliabdelazim7/Marg-Site)، والريبو Private. لا توجد credentials في الريبو.

---

## 1. الفكرة والهدف الأصلي

مرج هو متجر ملابس مصري عربي/إنجليزي لبيع الهوديز. الاسم والهوية مستوحيان من البحر والموج، لذلك اختيرت ألوان teal/sea مع أسلوب بصري editorial واضح. الهدف لم يكن بناء landing page فقط، بل بناء storefront مستقل يشبه تجربة WooCommerce من حيث الكتالوج والمنتجات والفاريشن والسلة والطلبات ولوحة الإدارة، من غير تشغيل WooCommerce أو Shopify داخل runtime.

الميزة المميزة هي Virtual Try-On مجانية: يختار العميل هوديًا، يرفع صورته، ثم يطلب معاينة ارتداء القطعة. لا يوجد اشتراك للعميل ولا بطاقة دفع مرتبطة بهذه الميزة. الخصوصية قرار أساسي: صورة العميل المدخلة لا تُحفظ كصورة دائمة في كتالوج المتجر ولا تُعرض لعملاء آخرين.

من البداية كان المطلوب أن تكون المنتجات حقيقية ومُدارة من لوحة الإدارة، وأن يدعم كل منتج صفحة مستقلة، صور front/back، variation sizes/colors، وصيغة 3D عند توافر ملف GLB/GLTF. أضيف دعم الشحن لكل محافظات مصر، لكن الرسوم والسياسات owner-managed ولا يجب اختلاق قيم تشغيلية.

---

## 2. أين وصلنا الآن

النسخة الحالية production-like ومتصلة بقاعدة بيانات MySQL/TiDB عبر Drizzle، وبها خادم Express وtRPC وManus OAuth. آخر checkpoint منشور على منصة المتجر هو `1425b591`. آخر نسخة مرفوعة إلى GitHub هي commit `357575da221f4fe92ffb50a0fb935a2691f5021f` على `main`، وقد طابق `origin/main` بعد push.

| المجال | الحالة الحالية |
| --- | --- |
| Storefront | Home، catalog، product detail، cart، checkout، tracking، account، favorites، Lookbook، Virtual Try-On |
| Product management | إنشاء وتحرير المنتجات، الأسعار، الحالة، التصنيف، الصورة الرئيسية، variations، stock، safety stock، gallery، back image، GLB/GLTF |
| Orders | إنشاء order مع server validation، COD/manual payment flows، حالات الطلب، tracking fields، customer lookup، order dashboard |
| Shipping | محافظات مصر وإعدادات الرسوم والملاحظات من لوحة الإدارة؛ لا توجد carrier API |
| Payments | COD متاح عند تفعيله؛ manual transfer owner-managed؛ لا cards ولا Paymob ولا Stripe |
| Reviews | delivered-order buyers فقط، pending moderation، لا reviews أو ratings مزروعة |
| Coupons | fixed/percentage، minimum subtotal، validity، usage limit، enabled، server-authoritative preview and checkout |
| Wishlist | local للزائر، account-backed عند توفر numeric product ID، مع merge strategy في الواجهة |
| Loyalty | account balance وledger، award بعد delivered مرة واحدة، وقواعد redemption خادمية |
| Inventory | variation stock، safety stock، manual adjustment log، low-stock visibility؛ لا automatic stock adjustment |
| Lookbook | owner-managed entries، published-only public view، empty state صادق |
| Analytics | first-party commerce events فقط؛ لا GA4/Meta Pixel ولا conversion claims |
| Team | owner-only invitations، hashed one-time tokens، roles/capabilities، مدد 24 ساعة/3 أيام/7 أيام/30 يومًا/Unlimited |
| QA | `pnpm check` ناجح، `pnpm test` ناجح: 26 ملفًا و67 اختبارًا، `pnpm build` ناجح؛ توجد build warning لحجم bundle أكبر من 500KB |

---

## 3. ما الذي لم نفعله عمدًا

لا تعِد تفعيل payment gateway أو بطاقات الائتمان أو Paymob أو Stripe من دون قرار تجاري وتقني جديد. Shopify تم استبعاده من runtime؛ وجود `references/shopify.md` أو متغيرات connector في بيئة المنصة لا يعني أن storefront يستخدم Shopify.

لا تضف WhatsApp Business API أو إرسالًا تلقائيًا. الموجود هو handoff يدوي: بعد بعض عمليات التحويل يمكن فتح WhatsApp برسالة جاهزة، والعميل أو المدير يراجعها ويضغط إرسال بنفسه. لا ترفع screenshot للتحويل ولا تخزنها. لا تستخدم رقم WhatsApp في مسار مختلف عن الغرض الذي حدده المالك.

لا تنشئ reviews أو ratings أو testimonials أو customer stories وهمية، ولا تضف tracking numbers أو sales أو conversion rates أو product claims مصطنعة. Lookbook لا يُملأ بصور lifestyle إلا إذا قدمها المالك وملك حق استخدامها. الصور الحالية التي وُسمت concept photography لا تتحول تلقائيًا إلى product facts.

لا تعتبر checkout المحلي أو analytics الحالية بديلًا عن payment reconciliation أو customer support أو fulfillment platform حقيقي. لا توجد refunds workflow كاملة، ولا carrier webhook، ولا stock reservation طويل المدى للسلة المحلية.

---

## 4. خريطة المشروع — أين تبدأ القراءة

| الملف/المجلد | المسؤولية |
| --- | --- |
| `client/src/App.tsx` | routes، providers، navigation shells |
| `client/src/pages/Home.tsx` | الصفحة الرئيسية وتجربة Try-On handoff |
| `client/src/pages/Products.tsx` | catalog، filters، sorting، product cards |
| `client/src/pages/ProductDetails.tsx` | PDP، media، variants، wishlist، reviews، JSON-LD، events |
| `client/src/pages/Cart.tsx` و`Checkout.tsx` | السلة والإتمام وcoupon/loyalty/shipping |
| `client/src/pages/TrackOrder.tsx` | customer order lookup وtracking display |
| `client/src/pages/Account.tsx` و`Favorites.tsx` | الحساب والولاء والمفضلة |
| `client/src/pages/Admin.tsx` | admin shell، product editor، orders، team، growth operations |
| `client/src/components/StoreHeader.tsx` | navigation العامة واللغة |
| `client/src/components/DashboardLayout.tsx` | layout الإدارة والصلاحيات البصرية |
| `client/src/contexts/CartContext.tsx` | local cart state وadd-to-cart event |
| `client/src/contexts/WishlistContext.tsx` | local/account wishlist sync |
| `client/src/lib/i18n.ts` | قاموس النصوص التشغيلية وتبديل اللغة |
| `client/src/index.css` | design tokens، RTL/LTR، responsive، admin styles |
| `server/db.ts` | database helpers؛ لا تضع query جديدة في الواجهة |
| `server/routers.ts` | tRPC contracts، validation، authorization، order rules |
| `server/_core/context.ts` | auth context وبناء `ctx.user` |
| `server/_core/env.ts` | mapping لمتغيرات البيئة؛ لا تضع قيمًا هنا |
| `server/storage.ts` | storage helpers للملفات عند الحاجة |
| `drizzle/schema.ts` | مصدر schema المنطقي |
| `drizzle/0000` إلى `0012` | migrations المطبقة بالترتيب |
| `shared/*.ts` | pure rules، types، filters، business logic والاختبارات |
| `docs/` | audits، specs، environment، handoff |
| `verification-notes.md` | أدلة الاختبار والملاحظات والقيود |
| `todo.md` | سجل العمل؛ لا تحذف التاريخ، وأضف تغييرات جديدة كسطور unchecked أولًا |

القالب يضع framework plumbing تحت `server/_core`. لا تعدل هذه الملفات إلا إذا كان التعديل متعلقًا مباشرة بالبنية أو integration، واقرأ الإرشادات قبل أي تغيير infrastructure.

---

## 5. طريقة التشغيل من clone جديد

ابدأ من clone نظيف، وتأكد أنك على branch `main` وعلى commit المطلوب. ثبّت Node.js وpnpm المتوافقين، ثم نفّذ `pnpm install --frozen-lockfile`. أنشئ `.env` محليًا من أسماء المتغيرات في `docs/environment.md`، ولا تنشئ هذا الملف داخل commit.

بعد تجهيز MySQL/TiDB وOAuth وbuilt-in forge secrets، نفّذ `pnpm check` ثم `pnpm test` ثم `pnpm build`. للتطوير استخدم `pnpm dev`. لتشغيل build استخدم `pnpm start`. لا تستخدم `pnpm db:push` عشوائيًا على production؛ راجع `schema.ts`، ولّد migration، اقرأ SQL، طبقه من خلال database workflow المعتمد، ثم تحقق من schema.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm dev
```

الأوامر السابقة لا تنشئ منتجات أو طلبات. لا تستخدم fixtures تشغيلية أو بيانات عملاء حقيقية لمجرد اختبار الواجهة.

---

## 6. Authentication وauthorization

التسجيل يتم عبر Manus OAuth. `server/_core/context.ts` يبني `ctx.user` من session، وtRPC procedures تحدد هل المسار public أو protected. صفحات الإدارة لا تكشف أدواتها للجلسة غير المصادق عليها؛ اختبار مسارات owner/team يتطلب session حقيقية.

المالك هو المرجع الأعلى لإدارة المتجر حسب `OWNER_OPEN_ID`. إدارة الفريق owner-only. دعوة الفريق لا تخزن token الخام؛ تخزن hash أحادي الاستخدام، ولها حالة accepted/revoked وexpiry. `expiresAt = null` يعني Unlimited فقط، وليس تاريخًا بعيدًا أو تجاوزًا لفحص الإلغاء والاستخدام.

عند إضافة procedure جديدة، ابدأ بتحديد capability المطلوبة ثم اربطها بالـteam procedure المناسب. لا تعتمد على إخفاء button في frontend للحماية. يجب أن يعيد الخادم `FORBIDDEN` أو `UNAUTHORIZED` قبل قراءة أو تعديل البيانات الحساسة.

الأدوار الحالية least-privilege. لا تحول عضو team إلى owner أو admin كامل فقط لتسهيل اختبار. إذا احتجت role جديدًا، عدّل model وcapability tests وnavigation والـdatabase strategy معًا.

---

## 7. أهم قواعد البيانات والـbusiness rules

المخطط الأساسي يدير products وproductVariants وproductMedia وcategories وorders وorderItems وإعدادات المتجر. حزمة النمو أضافت `coupons`, `productReviews`, `accountWishlists`, `loyaltyAccounts`, `loyaltyLedger`, `inventoryAdjustments`, `lookbookEntries`, و`commerceEvents`، مع حقول coupon/tracking/loyalty داخل orders و`safetyStock` داخل variants.

| القاعدة | ما يجب أن يفعله الفريق التالي |
| --- | --- |
| Product visibility | لا تعرض للعميل إلا المنتج المنشور والقابل للعرض حسب status/availability |
| Price authority | السعر والvariation والسعر النهائي يعاد فحصها في الخادم؛ لا تثق في localStorage أو discount client |
| Stock | لا تسمح برصيد سالب، ولا تعدّل stock تلقائيًا من event غير موثوق |
| Coupon | تحقق من enabled، dates، minimum subtotal، type/value، usage limit والوقت الحالي في الخادم |
| Review | تحقق من delivered order وemail وproduct item، ابدأ pending، امنع duplicate `(orderId, productId)` |
| Loyalty | award بعد delivered فقط، مرة واحدة عبر `loyaltyAwarded`، والتحقق من user/order association |
| Tracking | carrier/tracking URL يدويان؛ تحقق من URL ولا تدّعِ carrier integration |
| Wishlist | numeric DB product ID مختلف عن public slug؛ لا تحذف local favorites عند merge غير المؤكد |
| Lookbook | owner-provided image/title/link فقط، ولا تنشر draft |
| Analytics | events first-party فقط؛ لا تسمِّ event count conversion rate بدون تعريف ومصدر كافٍ |
| Dates | التخزين الداخلي UTC milliseconds حسب قواعد القالب، والعرض يحول للـlocal timezone |

عند تعديل schema، يجب أن تتبع الدورة: تعديل `drizzle/schema.ts`، تشغيل `pnpm drizzle-kit generate`، قراءة SQL، تطبيق migration بالترتيب، والتحقق من database. لا تعكس migration مطبقة بتعديل SQL قديم؛ أنشئ migration جديدة.

---

## 8. Media وVirtual Try-On

الصور الكبيرة والـGLB لا توضع في `client/public` أو `client/src/assets`. استخدم storage workflow الخاص بالمشروع، وخزن reference/URL فقط في قاعدة البيانات. محرر المنتج يميز بين main image وfront/back/gallery وmodel3d. رابط 3D يجب أن يكون direct GLB/GLTF أو ملف GLB صالحًا وفق validation؛ لا تقبل viewer page أو product page مكان الملف.

Virtual Try-On يحتاج selected product handoff من catalog/PDP إلى Home flow. عند فشل generation يجب الحفاظ على selected hoodie وuploaded photo في retry-safe state، مع رسالة user-safe لا تكشف أسرار provider. لا تُدخل provider credentials في client. أي تغيير على privacy copy يجب أن يطابق retention الفعلي.

إذا أُضيف upload جديد، راجع file type وsize وdimension وfilename وrate limit وerror path. لا تخزن input photo دائمًا لمجرد convenience، ولا تضف gallery item لنتيجة مستخدم من دون موافقة وسياسة واضحة.

---

## 9. اللغة والواجهة

العربية هي default وRTL. English يتم عبر `?lang=en` أو language control مع LTR overrides. النصوص التشغيلية الجديدة يجب أن تضاف إلى dictionary أو تُعرض في نسخة صريحة مناسبة. لا تترجم owner-entered product facts أو shipping/payment policy تلقائيًا، لأن الترجمة قد تغيّر معلومة تجارية.

توجد mobile bottom navigation للعميل وتخطيط sidebar للإدارة. عند تعديل CSS اختبر 390px وdesktop واسع، وتحقق من أن fixed navigation لا يغطي CTA أو checkout submit. حافظ على focus states، labels، native validation، `aria` labels، reduced motion، وcontrast.

محرر المنتج الجديد يعرض الآن sections variations وPRODUCT MEDIA/3D مثل التحرير. قبل حفظ المنتج الأساسي تُعرض الأدوات بصريًا لكن تكون غير فعالة لأن `productId` غير موجود؛ بعد save ينتقل التطبيق إلى `/admin/products/:id` وتصبح الإضافة ممكنة. لا تتخلص من هذا القيد بمحاولة إنشاء variation يتيم.

---

## 10. الاختبارات المطلوبة قبل أي release

نفّذ دائمًا `pnpm check`, `pnpm test`, و`pnpm build`. بعد أي تغيير database أو router، أضف أو حدّث Vitest قبل اعتبار العمل مكتملًا. اختبر success وvalidation error وunauthorized وforbidden وempty/loading/error states، وليس happy path فقط.

### User QA

ابدأ كـGuest: Home، catalog، filters، product slug، media/front/back، 3D fallback، Try-On handoff، wishlist local، cart، tracking empty state، Lookbook empty state، language toggle، وmobile layout. انتقل بعد ذلك إلى authenticated customer: account، account wishlist merge، loyalty balance، checkout، coupon preview، order creation، order lookup، delivered review eligibility، وtracking display.

لا تنشئ طلبًا حقيقيًا أو review أو customer record في production لمجرد QA. استخدم بيئة اختبار أو بيانات صريحة يوافق عليها المالك، ثم احذفها بطريقة آمنة إن كانت البيئة تسمح.

### Technical Team QA

اختبر owner procedures، team capability matrix، invite accepted/revoked/expired/30-day/unlimited، duplicate token، invalid role، coupon boundary/usage race، negative stock، invalid tracking URL، duplicate review، loyalty double award، public-only Lookbook، وevent payload validation. افحص network requests وbrowser console، ولا تكتفِ بأن الصفحة تبدو صحيحة.

اختبر keyboard navigation و390px وdesktop، وحالة انقطاع الشبكة أو tRPC error. استخدم screenshot للصفحات الحساسة، وسجل النتيجة في `verification-notes.md`. إذا كانت session المصادق عليها غير متاحة، اكتب ذلك صراحة ولا تدّعِ اختبار owner/team.

النتيجة المرجعية الأخيرة: 26 test files و67 tests passed، TypeScript passed، production build passed. Build warning الخاصة بحجم bundle ليست failure، لكنها technical debt ينبغي معالجتها بالـcode splitting إذا زاد حجم التطبيق.

---

## 11. خطة الاستكمال المقترحة حسب الأولوية

### P0 — قبل استقبال طلبات حقيقية

يدخل المالك بيانات الشحن الفعلية لكل محافظة، سياسة الإرجاع والاستبدال، تعليمات الدفع اليدوي، وproduct media الحقيقي. يجب مراجعة payment choice وorder status workflow وmanual WhatsApp handoff من حساب مالك حقيقي. فعّل backup لقاعدة البيانات وstorage، وجرّب استرجاعًا محدودًا قبل التشغيل.

أكمل authenticated QA للمالك والعميل وأعضاء الفريق، وراجع صلاحيات كل role. افحص production logs بعد smoke test، وتأكد من عدم وجود secrets في repository history أو deployment configuration.

### P1 — تحسين الاعتمادية

اجعل coupon usage atomic داخل transaction أو conditional update يمنع تجاوز `usageLimit` عند الطلبات المتزامنة. أضف server-level integration tests لعقود orders/growth بدل الاعتماد على pure rules فقط. أضف idempotency strategy لإنشاء الطلب إن كان العميل قد يكرر submit بسبب network retry.

افصل `Admin.tsx` إلى feature pages/hooks إن أصبح الملف صعب القراءة. أضف explicit error boundaries وrequest retry policy مناسبة، وحسّن bundle splitting. راجع accessibility audit بــscreen reader فعلي.

### P2 — ميزات اختيارية مؤجلة

قد يُضاف payment provider بعد قرار تجاري وأمني واضح، مع webhook/reconciliation/refund model واختبارات جديدة. قد تُضاف carrier integrations بعد اختيار شركة شحن وعقد API. قد تُضاف external analytics بعد consent/privacy review؛ لا تخلطها مع first-party event store الحالي.

يمكن توسيع Lookbook إلى CMS أفضل، وتحسين review notifications، وإضافة stock reservation أو abandoned-cart workflow، لكن هذه تغييرات كبيرة وليست ضمن إثبات المتجر الحالي.

---

## 12. قواعد العمل التي لا يجب كسرها

لا تضع secret في source أو commit أو screenshot. لا تستخدم `curl` أو browser workaround لإدارة Shopify في هذا runtime. لا تشغل destructive SQL. لا تعدّل migration قديمة بعد تطبيقها. لا ترفع ملفات media كبيرة إلى repo. لا تعتمد على client-side authorization. لا تنشئ fake UGC. لا تدّعِ أن الدفع أو الشحن أو analytics متصلون إذا لم توجد integration حقيقية.

عند استلام طلب جديد من المالك، أضفه أولًا إلى `todo.md` كسطر unchecked، ثم حدّد الملفات والعقود والاختبارات المتأثرة. نفّذ أصغر slice آمن، شغّل check/tests، اختبر browser بصريًا، حدّث `verification-notes.md`، ثم احفظ checkpoint إذا تغير المشروع المنشور. لا تحذف todo history.

---

## 13. First-session checklist للفريق التالي

1. Clone الريبو وتأكد من أنه Private ومن branch/commit الصحيح.
2. اقرأ هذه الوثيقة و`README.md` و`docs/environment.md` قبل تعديل الكود.
3. افحص `git status` ولا تضع `.env` أو credentials داخل المشروع.
4. نفّذ `pnpm install --frozen-lockfile`, ثم `pnpm check`, `pnpm test`, `pnpm build`.
5. شغّل storefront وراجع public routes، ثم احصل على owner session قبل اختبار admin routes.
6. راجع `todo.md` و`verification-notes.md` لتجنب إعادة fixes أو افتراضات قديمة.
7. قبل migration أو integration جديدة، اكتب plan، حدّث schema/router/tests معًا، واطلب القيم السرية عبر secret manager لا عبر Git.
8. قبل release، راجع الأسعار والمخزون والصور والسياسات يدويًا مع المالك؛ هذه بيانات تشغيلية لا ينبغي للنظام اختلاقها.

---

## 14. تعريف النجاح للنسخة التالية

تُعتبر أي نسخة لاحقة جاهزة للمراجعة عندما يمر TypeScript وVitest وproduction build، وتكون migration مطبقة ومراجعة، وتنجح owner/customer smoke tests، وتكون كل الأفعال الحساسة محمية خادميًا، وتظهر الواجهة صحيحة بالعربية والإنجليزية على mobile وdesktop، ويُحدّث التوثيق والـtodo والـverification notes. لا يعني ذلك أن كل integration التجارية موجودة؛ يجب وصف ما هو متصل وما هو يدوي وما هو مؤجل بدقة.

## References داخل المشروع

- [`README.md`](../README.md) — overview وتشغيل المشروع.
- [`docs/environment.md`](environment.md) — أسماء متغيرات البيئة وإدارة الأسرار.
- [`verification-notes.md`](../verification-notes.md) — evidence وقيود الاختبار.
- [`todo.md`](../todo.md) — تاريخ العمل وبنود الاستكمال.
- [`docs/github-export.md`](github-export.md) — سجل تصدير GitHub وملفات الاستبعاد.
- [`drizzle/schema.ts`](../drizzle/schema.ts) — schema المصدر.
- [`server/routers.ts`](../server/routers.ts) — tRPC procedures والصلاحيات.
- [`server/db.ts`](../server/db.ts) — database helpers.
