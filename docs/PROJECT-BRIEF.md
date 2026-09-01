# مرج — Project Brief الكامل

**النسخة:** 1.0

**آخر تحديث:** 30 أغسطس 2026

**الغرض:** هذه الوثيقة تشرح مشروع مرج من أول تجربة المستخدم في الـFrontend حتى الـBackend والـDatabase وعمليات الإدارة والاختبارات والـDeployment. هي ملخص تنفيذي وتقني يستطيع مالك المشروع أو Technical Team جديد استخدامه لفهم ما تم بناؤه، ولماذا اتخذت القرارات، وما الذي يجب عمله بعد ذلك.

> **الخلاصة في سطر واحد:** مرج هو independent Arabic-first hoodie e-commerce application يشبه WooCommerce في تجربة التشغيل، لكنه مبني بـReact/Vite وExpress/tRPC وDrizzle/MySQL، ويحتوي على catalog وproduct variations وcart وcheckout وorders وadmin dashboard وfree Virtual Try-On وGrowth suite، مع إبقاء card payments وWhatsApp Business API خارج النطاق عمدًا.

---

## 1. هدف المشروع من البداية

المطلوب الأصلي كان بناء متجر هوديز حقيقي باسم «مرج»، وليس صفحة عرض شكلية. الاسم مستوحى من البحر والموج، لذلك اعتمد التصميم على sea/wave teal identity. البلد المستهدف مصر، والشحن يجب أن يغطي جميع المحافظات، مع رسوم قابلة للتعديل من لوحة الإدارة.

كان المطلوب أن يدير المالك المنتجات بنفسه، وأن تكون لكل قطعة صفحة مستقلة فيها وصف وصور ومقاسات وألوان وفاريشن ومخزون. كما كان مطلوبًا دعم front/back print imagery ورفع 3D model حقيقي للمنتج، مع زر Virtual Try-On خاص بكل قطعة بحيث يختار العميل المنتج تلقائيًا ثم يرفع صورته فقط.

الهدف التشغيلي توسع بعد ذلك ليشمل تجربة شبيهة بـWooCommerce: حسابات، مفضلة، سلة، checkout، طلبات، تتبع، shipping settings، payment settings، analytics، إدارة فريق بصلاحيات، ثم إضافات النمو المقترحة باستثناء بوابة البطاقات وWhatsApp Business API.

---

## 2. النتيجة الحالية والحالة العامة

المشروع الآن production-like وليس مجرد prototype، لكنه لا يزال يحتاج إدخال بيانات المالك الفعلية وQA مصادق عليه قبل استقبال تشغيل تجاري كامل.

| المحور | ما هو موجود الآن |
| --- | --- |
| Storefront | Home، Products، Product Details، Cart، Checkout، Track Order، Account، Favorites، Lookbook، Policies |
| Product catalog | منتجات من database، slug مستقل، بيانات عربية/إنجليزية، status، categories، SKU، price، sale price، description، care، availability |
| Product media | main image، front/back imagery، gallery، direct GLB/GLTF، validation للامتداد والحجم والتوقيع |
| Variations | size/color، price override عند الحاجة، stock، safety stock، اختيار قبل الإضافة للسلة |
| Virtual Try-On | مجاني، selected-product handoff، رفع صورة العميل، retry-safe state، عدم حفظ input photo كبيانات دائمة |
| Cart | localStorage، quantity، remove، empty state، اختيار variation، add-to-cart event |
| Checkout | customer details، governorate، shipping fee، payment method، coupon، loyalty points، server-side recalculation |
| Orders | guest order creation، logged-in association عند وجود user، order items، status، manual fulfillment، tracking fields |
| Admin | dashboard، products، categories، attributes، shipping، payments، analytics، growth، team، store settings، orders |
| Team | owner-only invitations، hashed one-time tokens، revoke، accept، roles، capabilities، 24h/3d/7d/30d/unlimited |
| Growth | coupons، verified reviews، account wishlist، loyalty ledger، inventory adjustments، Lookbook، first-party events |
| Localization | Arabic default وRTL، English/LTR عبر language state و`?lang=en`، dictionary للنصوص التشغيلية |
| QA baseline | `pnpm check`، `pnpm test` = 26 files/67 tests، `pnpm build` ناجح |
| Live deployment | Manus WebDev Autoscale، domain `hoodiefit-ymbc2qp6.manus.space` |
| GitHub | Private canonical repository: `aliabdelazim7/Marj-Site` |

آخر checkpoint لمنصة المتجر قبل تصدير المستودع كان `1425b591`. إصلاح parity في محرر المنتج الجديد يجعل sections الخاصة بالصور و3D وvariations ظاهرة مثل شاشة التحرير؛ لكنها لا تبدأ تعديل variation قبل حفظ المنتج الأساسي لأن `productId` غير متاح قبل الإنشاء.

---

## 3. Frontend بالتفصيل

### 3.1 App shell والـproviders

نقطة الدخول الأساسية هي `client/src/App.tsx`. التطبيق يركب `ErrorBoundary` ثم `ThemeProvider` بنمط light، ثم `TooltipProvider`، ثم `CartProvider` و`WishlistProvider`، وبعد ذلك الـToaster والـRouter و`MobileBottomNav`.

هذا الترتيب مهم: Cart وWishlist متاحان في كل الصفحات، والـMobileBottomNav جزء من customer shell وليس من admin/checkout flows عندما يكون إخفاؤه مطلوبًا حتى لا يغطي CTA. أي تغيير في providers أو route guards يجب أن يحافظ على هذا السلوك.

### 3.2 Public routes

| Route | الوظيفة | حالة الوصول |
| --- | --- | --- |
| `/` | Home، brand story، catalog entry، Try-On entry | Public |
| `/products` | catalog مع filters وsorting | Public |
| `/product/:slug` | تفاصيل منتج مستقل، media، variants، reviews، wishlist | Public + optional auth |
| `/lookbook` | الإدخالات المنشورة فقط | Public |
| `/cart` | local cart وsubtotal | Public |
| `/checkout` | بيانات العميل والشحن والدفع وتأكيد الطلب | Public؛ user اختياري |
| `/track-order` | lookup عبر order number/email بحسب التدفق | Public |
| `/favorites` | local أو account-backed favorites | Public + optional auth |
| `/account` | user account وloyalty وبيانات المفضلة | Protected content |
| `/policies` | سياسات يحددها المالك | Public |
| `/team/join` | قبول دعوة team بعد login | Protected action |

### 3.3 Home وStoreHeader

`Home.tsx` يقدم هوية مرج ومسارًا واضحًا للكتالوج وVirtual Try-On، ويستخدم StoreHeader الموحد حتى لا تختلف السلة أو اللغة أو navigation عن بقية المتجر. `StoreHeader.tsx` يحتوي brand wordmark وروابط المتجر وLookbook وlanguage control والحساب والمفضلة والسلة.

تمت معالجة مشاكل سابقة في حجم الخط والهيدر، وضوح ShoppingBag، عداد السلة، contrast، وmobile navigation. عند تغيير header يجب الاختبار على 290px و390px وdesktop واسع لأن هذه كانت نقاط حساسة في الـQA السابق.

### 3.4 Products catalog

`Products.tsx` يعرض البيانات القادمة من server catalog procedures، ويتيح filtering حسب المقاس واللون والسعر والتوفر، مع sorting. بطاقة المنتج تتطلب اختيار المقاس قبل add to cart عندما توجد variations، وتستخدم public slug للتنقل وnumeric database ID عند مزامنة wishlist أو إرسال review/event.

لا يجب افتراض أن `product.id` المعروض في الواجهة هو database integer. التحويل في `server/db.ts` يمرر معرفًا رقميًا اختياريًا للعمليات التي تحتاجه، بينما slug يبقى مسؤولًا عن navigation. هذا التفريق يمنع كسر صفحات المنتج عند ربط features الحساب.

### 3.5 Product Details

`ProductDetails.tsx` هو أكثر صفحة كثافة. يعرض name/title والوصف والسعر والصورة الرئيسية والمعرض وfront/back والـ3D، ويمكّن اختيار size/color والكمية والإضافة للسلة والمفضلة وتجربة القطعة.

يحتوي أيضًا على approved reviews فقط، ونموذج review لا يقبل الإرسال إلا مع order number وemail وrating/comment وفق العقد الخادمي. الاختبار السلبي يجب أن يرفض email غير صحيح ورقم الطلب غير صالح، والـreview الجديدة تبدأ pending ولا تظهر للعامة حتى يوافق المالك.

تسجل الصفحة `product_view` عبر first-party event collector، وتصل الإضافة للسلة إلى `CartContext` حتى لا يتكرر تسجيل event عندما تتم الإضافة من أكثر من component. يضاف JSON-LD واقعي اعتمادًا على بيانات product القادمة من database، من دون اختلاق review aggregate أو availability أو fabric claim.

### 3.6 Cart وCheckout

`CartContext.tsx` هو المصدر المحلي لحالة السلة، ويستخدم localStorage لاستمرارها بين الصفحات. هذا مفيد لتجربة guest، لكنه ليس مصدر الحقيقة للسعر أو المخزون. عند add-to-cart يتم تسجيل `add_to_cart` best effort.

`Cart.tsx` يعرض lines والـvariation والكمية وsubtotal والـCTA الواضح إلى checkout. `Checkout.tsx` يجمع customer name/phone/email والعنوان والمحافظة وطريقة الدفع والكوبون والنقاط. قبل إنشاء الطلب يسجل `checkout_started`، ويعرض coupon preview وloyalty discount إن كان user authenticated.

الـserver يعيد حساب subtotal والشحن والخصومات من cart payload بعد فحص المنتج المنشور والـvariation والسعر والمخزون. العميل يرسل `couponCode` و`loyaltyPoints` فقط، ولا يرسل coupon discount كقيمة موثوقة. بعد النجاح يعرض OrderSuccess تفاصيل الطلب والخصومات المستخدمة وفق البيانات التي أعادها الخادم.

### 3.7 Account وFavorites

`Account.tsx` يعرض user state ومعلومات الولاء والحالة، مع توضيح أن نقاط الولاء تمنح بعد delivered وليس عند إنشاء الطلب. `Favorites.tsx` يدعم local wishlist للزائر، وعند authentication يستخدم mapping إلى numeric product IDs لمزامنة account wishlist دون فقد local entries المؤكدة.

يجب عدم حذف عناصر local تلقائيًا إذا لم يوجد mapping آمن. عند توسيع strategy، أضف اختبارات merge وduplicate وremove وlogout/login، لأن public slug وnumeric database ID ليسا الشيء نفسه.

### 3.8 Track Order وLookbook

`TrackOrder.tsx` يسمح للعميل بالبحث عن طلبه ويعرض status وcarrier وtracking number وtracking URL فقط إذا أدخلها فريق الإدارة. عدم وجود tracking لا يعني أن هناك carrier integration؛ الرسالة يجب أن تكون واضحة بأن البيانات لم تُسجل بعد.

`Lookbook.tsx` يعرض published entries فقط. إذا لم توجد entries يظهر empty state صادق، ولا يجب وضع lifestyle images أو testimonials مصطنعة لإخفاء الفراغ.

### 3.9 RTL/LTR وresponsive

العربية default وRTL، والإنجليزية LTR عبر language state وdictionary. النصوص التشغيلية الثابتة يجب إضافتها إلى `client/src/lib/i18n.ts`. أما title/description/policy التي يدخلها المالك فلا تترجم تلقائيًا، حتى لا تتغير الحقائق.

`client/src/index.css` يجمع design tokens وadmin styles وgrowth cards وresponsive overrides. عند أي تعديل، راجع fixed bottom navigation، الجداول، select/option contrast، text wrapping، email/phone LTR، وعدم وجود horizontal overflow عند 390px.

---

## 4. Backend بالتفصيل

### 4.1 Server architecture

الخادم يبدأ من `server/_core/index.ts` ويستخدم Express، بينما `server/_core/trpc.ts` و`server/_core/context.ts` يوفران context وprocedures. كل RPC تحت `/api/trpc`. الـFrontend يستخدم `client/src/lib/trpc.ts` ولا ينبغي إضافة Axios أو REST wrapper جديد لمسارات features الموجودة.

`server/routers.ts` هو contract layer. كل input يجب أن يمر عبر Zod schema، وكل query/mutation يجب أن يختار `publicProcedure` أو `protectedProcedure` أو owner/team capability procedure حسب الحساسية. حماية الواجهة وحدها غير كافية.

### 4.2 Root router areas

| Area | أمثلة الوظائف |
| --- | --- |
| `auth` | user state وlogout ومسار OAuth |
| `products` | public catalog وproduct detail والـmapping |
| `categories`/`attributes` | catalog taxonomy والإدارة |
| `orders` | `mine`, `create`, `lookup`, admin order operations |
| `admin` | products، coupons، reviews، inventory، Lookbook، fulfillment، team، settings |
| `growth` | coupon preview، approved reviews، submit review، wishlist، loyalty، public Lookbook، event capture |
| `tryOn` | free Virtual Try-On generation flow |
| shipping/payment/settings | owner-managed configuration وcheckout options |
| analytics | first-party event counts وadmin metrics |
| `team` | invite acceptance بعد authentication |

### 4.3 Order creation

`orders.create` public لأن guest checkout مسموح. إذا كان `ctx.user` موجودًا، يمكن ربط order بالمستخدم واستخدام loyalty بحسب association. في كل الحالات يعيد الخادم فحص بيانات المنتج والـvariation والـstock والسعر، ثم يحسب الشحن والـcoupon والـloyalty من القواعد الحالية.

بعد إنشاء الطلب يسجل server-side `purchase_completed` عبر `recordCommerceEvent` باستخدام session key من header أو UUID fallback. الـclient event mutation مخصص حاليًا لـ`product_view` و`add_to_cart` و`checkout_started`. لا تستخدم event count كـconversion rate ما لم تضف تعريفًا موثوقًا للـfunnel والـdeduplication.

### 4.4 Coupons

القواعد pure موجودة في `shared/growthRules.ts`. الكوبون قد يكون fixed أو percentage، وله enabled flag وvalid-from/valid-until وminimum subtotal وusage limit. `growth.couponPreview` يعيد نتيجة تحقق server-side، لكن create order يعيد التحقق النهائي باستخدام الوقت الحالي والبيانات من database.

التطوير التالي الموصى به هو جعل استهلاك الكوبون atomic داخل transaction أو conditional update حتى لا تتجاوز طلبات متزامنة usage limit. لا تعتمد على preview وحده، ولا تعرض كوبونًا فعالًا لمجرد أن العميل كتبه في local state.

### 4.5 Reviews

review submission تتطلب product ID وorder number وemail والنص والتقييم وفق schema. الخادم يبحث عن order مطابق ويثبت أن المنتج موجود في order item وأن status وصل إلى delivered. يرفض duplicate review لنفس `(orderId, productId)`، ويبدأ السجل pending.

المالك هو من يقرر approved أو rejected. public query تعرض approved فقط. لا توجد بيانات reviews أو ratings أو testimonials seeded، ولا ينبغي إضافتها تحت أي اسم مثل sample أو demo.

### 4.6 Wishlist وLoyalty

account wishlist تستخدم جدول `accountWishlists` مع numeric `productId` وuser ID. procedures محمية بـ`protectedProcedure`. الواجهة تحافظ على local fallback للزائر وتنفذ merge محافظًا عند login.

loyalty يعتمد على `loyaltyAccounts` و`loyaltyLedger`. القاعدة الحالية: نقطة لكل 10 EGP delivered، والنقطة تعادل 1 EGP discount ضمن الحدود. award يحدث بعد delivered، ويستخدم `orders.loyaltyAwarded` لمنع award المكرر. redemption يتحقق من user ownership وbalance والحدود في الخادم.

### 4.7 Inventory وFulfillment

`productVariants.stock` هو الرصيد التشغيلي، و`safetyStock` هو threshold تنبيه وليس كمية بيع إضافية. `inventoryAdjustments` يسجل delta وreason والمرجع والمستخدم. لا يوجد automatic stock adjustment من analytics أو event.

orders تحتوي shipment carrier وtracking number وtracking URL. الإدارة تدخلها يدويًا، والعميل يراها عند توفرها. URL يجب أن يمر validation، ولا يجوز الادعاء بأن شركة الشحن متصلة أو أن tracking number حقيقي إذا لم يدخلها المالك.

### 4.8 Team invitations

دعوات الفريق owner-only وتستخدم token hash أحادي الاستخدام. حالات accepted/revoked وexpiry تُفحص على الخادم. المدد هي 24 ساعة، 3 أيام، 7 أيام، 30 يومًا، وUnlimited. Unlimited مخزنة كـ`expiresAt = null` وليس كتاريخ بعيد.

التغيير الأخير الخاص بالـUnlimited احتاج migration `0012` لجعل `teamInvitations.expiresAt` nullable. لا تغيّر هذا السلوك بحيث تتجاوز الدعوة unlimited فحص revoked أو accepted أو role/capability.

---

## 5. Database وmigrations

مصدر schema هو `drizzle/schema.ts`. آخر migration مطبقة هي `drizzle/0012_tidy_korvac.sql`. التسلسل `0000` إلى `0012` يجب أن يظل محفوظًا، ولا يجب تعديل migration قديمة بعد تطبيقها.

| مجموعة الجداول | المحتوى |
| --- | --- |
| Identity | `users`, team members, team invitations |
| Catalog | products، variants، media، categories، attributes |
| Commerce | orders، order items، payment/shipping/store settings |
| Growth | coupons، product reviews، account wishlists، loyalty accounts/ledger |
| Operations | inventory adjustments، fulfillment fields |
| Content/analytics | Lookbook entries، commerce events |

### قواعد migration

عند إضافة column أو table، عدّل schema أولًا ثم نفّذ `pnpm drizzle-kit generate`. اقرأ SQL الناتج يدويًا. طبّق SQL على database من خلال workflow المعتمد، ثم تحقق من actual schema. لا تستخدم `pnpm db:push` على production بلا review. لا تنفذ DROP أو destructive ALTER دون backup وخطة rollback.

الـdatabase ليست مكانًا لصور أو screenshots أو GLB bytes. خزن references والmetadata فقط، واستخدم S3-compatible storage للملفات الكبيرة.

---

## 6. Storage وMedia

المشروع يستخدم storage helpers للصور والملفات. الملفات الكبيرة لا توضع في `client/public` أو `client/src/assets` ولا في GitHub؛ تستخدم storage URL/reference. محرر المنتج يميز بين image URL وGLB/GLTF direct URL أو upload صالح.

main image يجب أن تكون صورة فعلية direct URL، و3D يجب أن يكون ملفًا مباشرًا لا صفحة viewer. validation السابقة تمنع الملفات غير المطابقة أو الكبيرة جدًا. عند إضافة media feature، اختبر file type وsize وsignature وerror state وpermission، ولا تخزن input photo الخاصة بالعميل بشكل دائم من غير قرار privacy صريح.

---

## 7. Admin Dashboard وعمليات المالك

`Admin.tsx` يحتوي على admin shell ومناطق الإدارة الحالية. الوصول يتحقق خادميًا، والواجهة تعرض navigation بحسب role/capabilities عندما يكون العضو team وليس owner.

| شاشة الإدارة | ما يفعله المالك |
| --- | --- |
| Dashboard | ملخص catalog/orders/operational metrics المتاحة فعليًا |
| Products | list، create، edit، status، pricing، media، variations |
| Categories | إدارة taxonomy |
| Attributes | مقاسات وألوان وخصائص catalog |
| Orders | list، status، customer/order details، fulfillment tracking |
| Shipping | رسوم المحافظات والملاحظات |
| Payments | تفعيل COD وإعداد طرق manual وفق التعليمات التي يدخلها المالك |
| Analytics | first-party events ومقاييس الطلبات المتاحة فقط |
| Growth | coupons، reviews moderation، inventory adjustment، Lookbook |
| Team | invitations، duration، role، revoke، members |
| Store settings | brand وpolicies وoperational copy |

محرر المنتج الجديد كان أقل من محرر التحرير؛ تم إصلاح ذلك بإظهار media/3D وvariations في الإنشاء أيضًا. لكن التعديل على هذه الأقسام يظل مقفولًا حتى حفظ المنتج الأساسي وإنشاء `productId`. هذا قيد منطقي، وليس نقصًا يجب التحايل عليه بإنشاء records يتيمة.

---

## 8. Payments وWhatsApp وShipping

الدفع الحالي لا يحتوي على card gateway. COD هو المسار القابل للاستخدام حسب إعداد المالك. Vodafone Cash/InstaPay/manual transfer owner-managed، وتحتاج تعليمات فعلية قبل التفعيل. لا يوجد Paymob أو Stripe أو card processing.

WhatsApp handoff يدوي فقط. بعد التحويل يمكن فتح WhatsApp برسالة جاهزة تشمل بيانات الطلب، لكن العميل أو المدير هو من يراجع ويضغط Send. لا يتم رفع screenshot للتحويل ولا تخزينه، ولا توجد WhatsApp Business API أو automatic outbound messages.

الشحن يدعم محافظات مصر ورسومًا قابلة للتعديل من dashboard. لا توجد carrier API أو webhook. `trackingUrl` و`trackingNumber` مجرد بيانات يدخلها المالك يدويًا، والواجهة تعرضها إن وجدت.

---

## 9. Analytics وSEO

الأحداث first-party الحالية هي `product_view`, `add_to_cart`, `checkout_started` من الواجهة، و`purchase_completed` من الخادم بعد إنشاء الطلب. يتم استخدام session key محلي أو header/UUID، ولا توجد GA4 أو Meta Pixel.

لا توجد وعود conversion أو revenue accuracy لمجرد وجود event rows. إذا أراد الفريق التالي analytics احترافية، فعليه تعريف funnel وdeduplication وconsent وretention وtimezone ثم إضافة tests وdashboard labels بوضوح.

أضيفت metadata عامة وJSON-LD للمنتجات المعتمدة على بيانات database. لا تضف rating أو review aggregate إن لم تكن هناك reviews approved حقيقية، ولا تضف material/fabric/shipping claim غير موجود في مصدر المالك. SSR ليس جزءًا من runtime الحالي؛ إذا أصبح SEO crawler visibility هدفًا رئيسيًا، يجب تقييم SSR/SSG كعمل معماري منفصل.

---

## 10. Testing وQA

الأوامر الأساسية:

```bash
pnpm check
pnpm test
pnpm build
```

النتيجة المرجعية الأخيرة: TypeScript ناجح، Vitest ناجح بعدد 26 test files و67 tests، وproduction build ناجح. توجد build warning بسبب client bundle أكبر من 500KB؛ ليست failure، لكنها debt يستحسن علاجه بـcode splitting.

| نوع الاختبار | ما يجب تغطيته |
| --- | --- |
| Static | TypeScript، diff check، build |
| Unit | rules الخاصة بالـcart، shipping، payment، growth، team، i18n، model3d |
| Server validation | order input، product input، coupon، review، stock، fulfillment |
| Authorization | guest، user، owner، كل team capability، forbidden paths |
| User flow | browse، filter، product، media، try-on، wishlist، cart، checkout، tracking |
| Negative | invalid email، invalid order، expired coupon، over-limit points، negative stock، invalid URL، duplicate review |
| Responsive | 390px mobile، desktop واسع، RTL/LTR، fixed nav، tables/forms |
| Runtime | browser console، network requests، loading/error/empty states |

الـQA السابق اختبر public pages كـGuest، catalog filters، add-to-cart، product details، negative review form، Lookbook empty state، cart empty state، English/LTR، language toggle، tracking guest state، و390px screenshots. اختبار owner/team الحقيقي يتطلب login session مصادقًا عليها؛ لا تعتبر شاشة login دليلًا على نجاح إجراءات owner.

---

## 11. ما يحتاجه المالك قبل التشغيل الحقيقي

أدخل product data الحقيقية، main/front/back/gallery images المملوكة، GLB files عند الحاجة، prices وSKU وvariants وstock، النص العربي والإنجليزي، رسوم المحافظات، سياسة الشحن، سياسة الاستبدال، تعليمات COD/manual transfer، وبيانات الدعم.

اختبر أول order في بيئة آمنة، راجع order status ومسار fulfillment، أنشئ team invite لمدة 30 يومًا وUnlimited، اختبر revoke، وراجع أن كل عضو يرى capability المطلوبة فقط. فعّل database/storage backup واختبر restore محدودًا.

لا تستخدم customer data أو payment screenshots أو real credentials للاختبار. لا تعتبر الصور الحالية أو أي catalog imagery مراجعات أو testimonials. لا تفعّل manual payment إلا بعد إدخال تعليمات حقيقية ومراجعتها.

---

## 12. خطة الاستكمال المقترحة

### P0 — launch readiness

أكمل authenticated QA للمالك والعميل وأعضاء الفريق. نفّذ smoke test لطلب COD في بيئة متفق عليها. راجع كل policy وshipping fee وpayment instruction وproduct media. راقب logs بعد أول تشغيل ولا تعتبر عدم وجود error في الصفحة دليلًا على نجاح database mutation.

### P1 — reliability

اجعل coupon usage atomic، وأضف order idempotency لمنع duplicate orders عند network retry. أضف integration tests server-level لربط order، coupon، loyalty، stock، review، وfulfillment في حالات transaction/rollback. راجع error boundaries وrate limits وinput sanitization.

### P1 — maintainability

قسّم `Admin.tsx` إلى feature modules عندما يصبح الملف صعب القراءة، مع إبقاء shell وcapability map مركزيين. أضف shared hooks للـloading/error/invalidation، واعمل bundle splitting. لا تكرر query logic في صفحات العميل.

### P2 — integrations اختيارية

إذا تقرر لاحقًا إضافة card payments أو carrier API أو WhatsApp Business API أو external analytics، اعتبر كل واحد integration جديدًا يحتاج secret management وconsent/security review وwebhooks وreconciliation وtests وdocumentation. لا تخلط integration حقيقية مع manual handoff الحالي.

### P2 — content and merchandising

يمكن توسيع Lookbook إلى CMS أكثر مرونة، إضافة product bundles أو abandoned cart، تحسين review notifications، أو إضافة stock reservation. كل هذه ميزات لاحقة وليست جزءًا من ضمان checkout الحالي.

---

## 13. تعليمات لأي Developer يكمل بعد ذلك

1. ابدأ من `docs/PROJECT-BRIEF.md` ثم `docs/HANDOFF.md` ثم `README.md` و`verification-notes.md`.
2. نفّذ `git status` و`pnpm install --frozen-lockfile` و`pnpm check` و`pnpm test` قبل تعديل أي شيء.
3. أضف كل طلب جديد إلى `todo.md` كسطر `[ ]` قبل التنفيذ.
4. حدد مصدر الحقيقة: database للمنتج والسعر والمخزون والطلب، server procedures للصلاحيات، storage للملفات، dictionary للنصوص التشغيلية.
5. إذا عدّلت schema، أنشئ migration جديدة ولا تعدل migration مطبقة.
6. إذا أضفت procedure، أضف Zod validation وauthorization واختبار success وfailure.
7. إذا أضفت customer UI، اختبر Guest وauthenticated user وArabic/English و390px/desktop.
8. لا تنشئ fake reviews أو fake inventory أو fake tracking أو fake conversions.
9. لا تضع secrets في source أو GitHub أو screenshots؛ استخدم environment/secret manager.
10. حدّث `verification-notes.md` بالأدلة والقيود، ثم احفظ checkpoint قبل تسليم تغيير production.

---

## 14. Definition of Done للميزة القادمة

الميزة لا تعتبر مكتملة إلا إذا كان لها contract واضح، وdatabase migration عند الحاجة، وDB helper، وtRPC procedure، وFrontend state/UI، وحالات loading/error/empty، واختبارات Vitest، وcheck/build ناجحين، وفحص Browser مناسب، وتوثيق يذكر ما تم فعله وما لم يتم فعله.

بالنسبة لأي feature تجاري، يجب أن يعرف الفريق هل هي public أو protected أو owner-only، وهل بياناتها owner-entered أو system-generated، وهل تعتمد على integration خارجية أو manual operation. يجب ألا تعطي الواجهة انطباعًا بوجود تكامل غير متصل فعليًا.

---

## 15. المراجع الداخلية

- [`README.md`](../README.md) — نظرة عامة وتشغيل المشروع.
- [`docs/HANDOFF.md`](HANDOFF.md) — handoff تفصيلي للفريق التالي.
- [`docs/environment.md`](environment.md) — environment variables وإدارة الأسرار.
- [`docs/github-export.md`](github-export.md) — تفاصيل تصدير GitHub والاستبعادات.
- [`verification-notes.md`](../verification-notes.md) — evidence وقيود الاختبارات.
- [`todo.md`](../todo.md) — تاريخ العمل والعناصر المتبقية.
- [`client/src/App.tsx`](../client/src/App.tsx) — routes وproviders.
- [`server/routers.ts`](../server/routers.ts) — tRPC contracts والـauthorization.
- [`server/db.ts`](../server/db.ts) — database helpers.
- [`drizzle/schema.ts`](../drizzle/schema.ts) — database schema.
- [`shared/growthRules.ts`](../shared/growthRules.ts) — coupon وloyalty rules.
