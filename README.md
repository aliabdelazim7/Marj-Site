# مرج — Marj Hoodie Store

متجر هوديز عربي/إنجليزي مبني كتطبيق React/Vite مع خادم Express وواجهات tRPC وطبقة بيانات Drizzle/MySQL. الاسم والهوية البصرية مستوحاة من البحر والموج، والواجهة تبدأ بالعربية مع دعم English وLTR. المشروع مستقل عن WooCommerce وShopify في runtime؛ الكتالوج والطلبات والإدارة تعمل من قاعدة بيانات المشروع.

> هذه النسخة هي snapshot من مشروع مرج بعد آخر checkpoint منشور `1425b591`. لا تحتوي على credentials أو ملفات `.env` أو بيانات عملاء.

## ابدأ من هنا

للتسليم الكامل للفريق التالي، اقرأ [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md) أولًا، ثم [`docs/HANDOFF.md`](docs/HANDOFF.md) و[`docs/environment.md`](docs/environment.md) و`verification-notes.md`. يشرح الـProject Brief المشروع من الـFrontend حتى الـBackend والـDatabase والـDeployment وخطة الاستكمال.

## ما تم بناؤه

### تجربة العميل

يوفر الموقع Home وكتالوجًا متصلًا بقاعدة البيانات وصفحة مستقلة لكل منتج باستخدام slug. يدعم الكتالوج البحث والترتيب والتصفية حسب المقاس واللون والسعر والتوفر، كما تعرض بطاقة المنتج اختيار المقاس قبل الإضافة إلى السلة. تحتوي صفحة المنتج على صورة رئيسية ومعرض صور وواجهة أمامية/خلفية، ومعاينة 3D عندما يرفع المالك ملف GLB أو GLTF صالحًا، بالإضافة إلى وصف المنتج ومعلومات العناية والتوفر.

توجد سلة محلية محفوظة في `localStorage` مع تحديث الكمية والحذف وحالة الفراغ. الخادم يعيد التحقق من المنتج المنشور والـvariation والسعر والمخزون عند إنشاء الطلب، لذلك لا تُعتبر قيمة السلة المحلية مصدر الحقيقة. يشمل checkout بيانات العميل والعنوان والمحافظة والشحن والموافقة وطريقة الدفع. الدفع المتاح حاليًا هو Cash on Delivery، أما التحويلات اليدوية فتظل owner-managed ولا تظهر كوسيلة مفعلة ما لم يضع المالك تعليماتها الفعلية. لا توجد بوابة بطاقات أو Paymob في هذا النطاق.

ميزة Virtual Try-On مجانية؛ يختار العميل قطعة ثم يرفع صورته للمحاولة. لا يحفظ التطبيق صورة الإدخال كملف دائم ولا ينشرها في الكتالوج. نتيجة المحاولة يمكن عرضها وتنزيلها حسب تدفق الواجهة. لا يوجد اشتراك أو provider خارجي مدفوع داخل تجربة العميل.

### Growth وRetention وOperations

أضيفت كوبونات fixed وpercentage مع minimum subtotal ونافذة صلاحية وحد استخدام وحالة enabled. المعاينة والاحتساب النهائي server-authoritative، ولا يقبل الخادم قيمة الخصم القادمة من العميل. أضيف نظام Loyalty يسجل ledger ويمنح نقاطًا بعد وصول الطلب إلى delivered مرة واحدة فقط؛ نقطة واحدة لكل 10 جنيهات وفق القاعدة الحالية، وكل نقطة تساوي جنيهًا في الخصم ضمن الحدود الخادمية.

المفضلة مرتبطة بالحساب عند توفر معرف المنتج الرقمي، مع الحفاظ على local wishlist للزائر. المراجعات لا تظهر للعامة إلا بعد موافقة المالك، ولا يستطيع إرسالها إلا مشتري لديه item في طلب delivered، مع ربط رقم الطلب والبريد والمنتج ومنع التكرار. لم تُنشأ reviews أو ratings أو testimonials تجريبية.

يوفر المخزون variation-level stock وsafety stock وسجل تعديلات يدويًا مع منع الرصيد السالب. يوفر order fulfillment حقول carrier وtracking number وtracking URL يدويًا، وتظهر للعميل فقط عند إدخالها من الإدارة؛ لا توجد carrier API أو webhook ضمن هذا الإصدار. Lookbook owner-managed ويعرض الإدخالات المنشورة فقط، مع empty state صادق عند عدم وجود محتوى.

تسجل analytics أحداثًا first-party داخل قاعدة البيانات، مثل product view وadd to cart وcheckout started وpurchase completed، باستخدام session key محلي. لا توجد GA4 أو Meta Pixel أو conversion claims خارجية. لوحة الإدارة تعرض بيانات الطلبات والكتالوج التي تملك مصدرًا فعليًا فقط، وتحجب المقاييس التي تحتاج traffic أو payment gateway أو refunds غير متاحة.

### الإدارة والفريق

لوحة الإدارة ذات تخطيط شبيه بـWooCommerce وتحتوي على Overview وProducts وCategories وAttributes وOrders وShipping وPayments وAnalytics وGrowth & operations وTeam وStore settings. محرر المنتج يدعم بيانات المنتج بالعربية والإنجليزية، slug، SKU، الوصف، الأسعار، الحالة، التصنيف، الصورة الرئيسية، variations بالمقاس واللون والمخزون وsafety stock، الصور الإضافية، صورة الظهر، وروابط أو رفع GLB/GLTF وفق التحقق.

إدارة الفريق owner-only وتستخدم invitations بدل مشاركة credentials. الدعوة تخزن token hash، وتُستخدم مرة واحدة، ويمكن إلغاؤها أو تنتهي بصلاحية 24 ساعة أو 3 أيام أو 7 أيام أو 30 يومًا أو تكون غير محدودة. المدة غير المحدودة تعني `expiresAt = null` فقط، ولا تتجاوز فحص الاستخدام أو الإلغاء أو الدور. الأدوار الأقل صلاحية مقيدة بالـcapabilities الخاصة بالطلبات أو الكتالوج أو التحليلات أو إدارة المتجر.

## البنية التقنية

| الطبقة | التنفيذ |
| --- | --- |
| Frontend | React 19، Vite، Wouter، Tailwind CSS 4، shadcn/Radix UI، React Query عبر tRPC |
| Backend | Express 4، tRPC 11، SuperJSON، Manus OAuth context |
| Database | MySQL/TiDB عبر Drizzle ORM وmysql2 |
| Storage | S3-compatible storage helpers للصور والملفات؛ لا تُحفظ bytes الكبيرة في قاعدة البيانات |
| Authentication | Manus OAuth؛ `protectedProcedure` للمستخدم المسجل وowner/team procedures للإدارة |
| AI try-on | server-side integration عبر built-in forge APIs مع privacy-preserving input handling |
| Testing | Vitest، TypeScript check، Vite/esbuild production build |
| Deployment | Manus WebDev Autoscale؛ آخر domain منشور: `hoodiefit-ymbc2qp6.manus.space` |

الملفات الأساسية هي `client/src/` للواجهة، `server/db.ts` للاستعلامات، `server/routers.ts` لعقود tRPC والصلاحيات، `drizzle/schema.ts` للمخطط، `drizzle/*.sql` للـmigrations، و`shared/` للقواعد والأنواع والاختبارات المشتركة.

## قاعدة البيانات والـmigrations

المخطط يحتوي على users وproducts وproductVariants وproductMedia وcategories وorders وorderItems وcart-related records وstore settings، إضافة إلى جداول growth: `coupons`, `productReviews`, `accountWishlists`, `loyaltyAccounts`, `loyaltyLedger`, `inventoryAdjustments`, `lookbookEntries`, و`commerceEvents`. حقول الطلب تشمل coupon discount وshipment carrier/tracking وloyalty award state. جدول variations يحتوي على `safetyStock`.

المigrations المطبقة في هذه النسخة هي `0000` إلى `0012` بالترتيب. من بينها `0010` لحزمة النمو، `0011` لـsafety stock، و`0012` لجعل `teamInvitations.expiresAt` nullable من أجل الدعوات غير المحدودة. لا تشغّل destructive SQL على قاعدة إنتاجية قبل backup ومراجعة dependency order.

## التشغيل المحلي

1. ثبّت Node.js المتوافق وpnpm.
2. انسخ `.env.example` إلى `.env` وأدخل القيم الحقيقية في بيئة محلية آمنة أو secret manager؛ لا ترفع `.env` إلى GitHub.
3. ثبّت الاعتمادات عبر `pnpm install`.
4. نفّذ typecheck عبر `pnpm check`.
5. شغّل الاختبارات عبر `pnpm test`.
6. شغّل التطوير عبر `pnpm dev`.
7. ابنِ نسخة production عبر `pnpm build` ثم شغّلها عبر `pnpm start`.

يتطلب التشغيل الفعلي قاعدة MySQL وOAuth وbuilt-in forge configuration. عند استخدام migration، راجع `drizzle/schema.ts` والـSQL أولًا، ثم طبّقها من خلال بيئة إدارة قاعدة البيانات المناسبة. لا تستخدم بيانات عميل حقيقية في الاختبارات.

## الأوامر

| الأمر | الغرض |
| --- | --- |
| `pnpm dev` | تشغيل Express/Vite في التطوير |
| `pnpm check` | TypeScript بدون emit |
| `pnpm test` | تشغيل Vitest كاملًا |
| `pnpm build` | بناء واجهة العميل وتجميع الخادم |
| `pnpm start` | تشغيل build الإنتاج |
| `pnpm drizzle-kit generate` | توليد migration بعد تعديل schema |
| `pnpm format` | تنسيق الملفات عبر Prettier |

## الاختبارات والتحقق

آخر فحص موثق في المشروع نجح فيه TypeScript وproduction build وVitest بعدد 26 ملفًا و67 اختبارًا. تمت مراجعة مسارات عامة عند desktop و390px، منها catalog وproduct وcart وLookbook وtracking، كما تمت مراجعة شاشة المنتج الجديد والتحرير بصريًا. مسارات الإدارة محمية بـauth gate؛ اختبار owner/team يتطلب جلسة مصادق عليها.

فحص المنتج الجديد أثبت أن أقسام `PRODUCT VARIATIONS` و`PRODUCT MEDIA / 3D` تظهر في المسار الجديد، لكن الإضافة الفعلية للـvariation أو الوسيط لا تبدأ قبل إنشاء المنتج الأساسي، لأن الخادم يحتاج `productId`. بعد الحفظ ينتقل المسار إلى محرر المنتج ويصبح الربط متاحًا.

## المدفوعات وWhatsApp

لا توجد بطاقات أو Paymob أو Stripe في هذا الإصدار. COD هو المسار القابل للاستخدام عند تفعيله من الإعدادات. التحويل اليدوي يجهز رسالة WhatsApp للعميل ليرسلها بنفسه مع screenshot، ولا يرفع التطبيق screenshot أو يخزنه، ولا يستخدم WhatsApp Business API ولا يرسل تلقائيًا. تحديث حالة الطلب يمكن أن يفتح رسالة جاهزة للمدير كي يراجعها ويرسلها يدويًا.

## الأمان والخصوصية

يجب تخزين credentials في environment أو secret manager فقط. لا تضع `DATABASE_URL` أو `JWT_SECRET` أو OAuth tokens أو built-in forge keys في commit. تحقق الخادم من الأسعار والمخزون والكوبونات والمراجعات والأدوار، وتُخزن دعوات الفريق كhash لا كtoken خام. الصور المدخلة إلى Try-On مؤقتة حسب التدفق ولا تُحفظ كمدخلات دائمة. يجب مراجعة سياسات الخصوصية والاستبدال والشحن قبل تشغيل متجر حقيقي.

## التشغيل قبل الإطلاق

قبل استقبال طلبات حقيقية، أدخل رسوم الشحن الفعلية لكل محافظة، سياسة الإرجاع والاستبدال، تعليمات الدفع اليدوي الفعلية، الصور الحقيقية المملوكة، ملفات GLB عند الحاجة، بيانات المنتجات الإنجليزية، وقواعد الكوبونات. اختبر طلب COD حقيقيًا في بيئة تشغيل آمنة، راجع صلاحيات أعضاء الفريق، وفعّل backup لقاعدة البيانات وstorage. لا تعتمد على الصور الحالية كإثبات لمواصفات أو تقييمات أو نتائج تحويل.

## مراجع المشروع

- `verification-notes.md`: سجل التحقق والملاحظات والقيود.
- `todo.md`: سجل العمل والتغييرات.
- `docs/`: audits وlaunch/readiness وrunbooks.
- `references/shopify.md`: مرجع التكامل الاختياري الموجود في القالب؛ runtime الحالي محلي.

## License

المشروع خاص بالمالك. احتفظ بحقوق الصور والمنتجات والتعليمات التشغيلية، ولا تنشر نسخة عامة قبل إزالة أي بيانات داخلية ومراجعة التراخيص.
