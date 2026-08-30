# Verification notes

Date: 2026-08-24

The real preview was opened at the current project URL. Before the fix, the home catalog exposed only `جرّبه عليك`, and navigating to `/cart` showed `السلة لسه فاضية` after a product-page click attempt. The browser console contained prior React/API errors, but no cart-specific error was isolated from the truncated log.

After the first UI fix, the home page extraction visibly contains `أضف للسلة` for all four hoodie cards. The product detail extraction visibly contains size buttons S/M/L/XL and `أضف للسلة`. A persistent WishlistProvider, visible heart controls, `/favorites` route, and synchronous localStorage cart persistence were then added. TypeScript passed after those changes. The browser preview still has a Management UI overlay bar that can obscure lower controls in screenshots, so the remaining verification must use the extracted interactive element list and direct route navigation as well as screenshots.

The browser coordinate click was rejected because the page had updated since the previous snapshot. This confirms that coordinate-based interaction is unreliable while the preview editor overlay is active; the test should refresh/view immediately before each coordinate click or use direct visible element indices.

Browser verification after the fix: selected Concrete Grey size M on the product page, clicked the visible `أضف للسلة` element, navigated to `/cart`, and confirmed the cart rendered Concrete Grey, size M, quantity 1, subtotal 879 EGP, shipping 60 EGP, total 939 EGP, and an `إتمام الطلب` action. Clicking that action navigated to `/checkout`. Filled synthetic test values for name, email, phone, and Cairo address; checkout summary retained the item and total.

The checkout page reached its lower section in the browser. The interactive list exposed the textarea and the `تأكيد الطلب — ٩٣٩ ج.م` button. The page displayed the privacy/consent copy immediately above the action; the next step is to confirm whether the consent control is correctly represented and then submit only the already-confirmed synthetic test order.

After restarting the dev server, the same browser session still retained the cart item and navigated from `/cart` to `/checkout`. The checkout form reset its inputs (expected), so synthetic values were re-entered. The rendered page now visibly includes the consent sentence; the actual checkbox control must be confirmed from the current DOM before submit.

The approved synthetic order was submitted successfully. Confirmation displayed order number `HF-2026-6059EB6D`, total 939 EGP, and explicit cash-on-delivery confirmation language. The browser then opened `/track-order`, submitted the same order number and test email, and returned the `استلمنا الطلب` status with Concrete Grey, size M, quantity 1, total 939 EGP, and payment-not-completed copy.

The home catalog was inspected in the browser after the order test. The visible collection now exposes four favorite buttons with explicit accessible labels (`إضافة ... للمفضلة`) and the extracted content includes `أضف للسلة` for each card. The current browser screenshot confirms the four product cards and their heart controls are visually present in the collection grid.

The final browser pass shows the home header now includes a `فتح المفضلة، 0 عناصر` button beside the cart. The collection grid visually shows four product cards with heart controls and red `أضف للسلة` buttons. The previous favorite attempt was made before synchronous persistence was added; a fresh click test is required now, followed by navigation to `/favorites` without any intervening route before checking the counter.

The latest collection screenshot confirms the heart controls are visually rendered at the top of each product card and the red `أضف للسلة` buttons are visible below every card. The current live browser element list labels the Signal Red heart as `إضافة إشارة حمراء للمفضلة`, so the next direct interaction uses that exact indexed control.

During the validation pass after the latest code changes, the product page remained responsive and the size selector appeared as expected. PageDown/scroll behavior is affected by the preview chrome, so DOM snapshots are used as the source of truth for the purchase controls before every click.

A synchronized browser pass finally clicked the actual product-page add button (`browser_click` index 9 from the immediately preceding DOM snapshot). The product-page header changed from `السلة 0` to `السلة 1`; `/cart` then rendered Concrete Grey, size M, quantity 1, subtotal 879 EGP, shipping 60 EGP, total 939 EGP. Earlier empty-cart observations were caused by stale/off-screen browser indices targeting the page HTML rather than the button, not by the current cart code.

Validation precondition is now reproduced in the browser: `/checkout` contains one Concrete Grey M line and total 939 EGP; all required name/email/phone/city/address fields contain synthetic values; the consent checkbox is visibly present and currently unchecked. The confirmation button is visible below the consent row in the rendered page.

Final no-consent checkout validation passed in the browser. With one line in cart, synthetic required fields completed, and the consent checkbox left unchecked, clicking the actual visible submit button kept the route at `/checkout`, preserved the form and cart, and rendered the alert: `يجب الموافقة على استخدام بياناتك لإرسال الطلب.` No new order was created by this attempt.

Latest CartDrawer browser check passed. From Home, the header showed `السلة 1`; clicking it opened the RTL drawer with Concrete Grey, size M, quantity controls, delete control, total 939 EGP, and visible `مراجعة السلة` action. The drawer is not an empty placeholder.

Malformed phone browser check passed after the explicit validation fix. With a valid test email, required name/city/address, unchecked consent, and phone `123`, the page stayed on `/checkout` and rendered `اكتب رقم هاتف مصري صحيحًا من 11 رقمًا ويبدأ بـ 01.`. Network log inspection showed no new `orders.create` request; the only create request remains the authorized test order `HF-2026-6059EB6D`.

Email validation retest is now on the current checkout build after restart: the email field renders as a text input with inputMode=email, the cart line remains present, the test email is `bad-email`, the phone is valid `01022222222`, and the page has not navigated or created a new order. The address and consent controls remain below the current viewport for final submission attempt.

Final CartDrawer proof: after navigating to `/`, browser click on the top cart control (`hint="فتح السلة، 1 عناصر"`) opened an `aside` with `hint="سلة المشتريات"`. The open drawer visibly contained `YOUR BAG / السلة`, the Concrete Grey line in size M ×1, quantity decrease/increase controls, delete control, subtotal 879 ج.م, shipping 60 ج.م, total 939 ج.م, and the `مراجعة السلة` action. The background dimmed behind the drawer and the close control was visible.

Deterministic consent retest setup: after reopening `/checkout` from the saved cart, the current browser state contains `اختبار consent المؤكد`, email `bad-email`, phone `01022222222`, city `القاهرة`, address `شارع اختبار ١، مبنى ٢`, one Concrete Grey M line, and total 939 EGP. The new checkout UI exposes the initial status `الموافقة مطلوبة لإرسال الطلب.` before the checkbox is checked.

The checkout form remains on the same route with the invalid email and valid phone/address intact. The first `End` and one page-end scroll did not expose the lower controls because the preview editor chrome intercepted the scroll; the extracted markdown still shows the new initial consent status and no submit mutation has occurred.

The first consent click used a stale index after keyboard focus caused the viewport to update and was rejected by the browser automation layer; no submit occurred. A fresh view confirms the route and all valid/invalid test values remain intact, with the initial visible status still `الموافقة مطلوبة لإرسال الطلب.`. The next interaction must use the newly indexed control or keyboard focus from a current snapshot.

Keyboard focus was intercepted by the preview chrome rather than moving deterministically to the consent checkbox, and the coordinate fallback was rejected as stale. These attempts did not mutate the form or create an order. A fresh snapshot is required before any final consent interaction; if the preview chrome continues to block it, the new visible status can still be validated through a focused browser interaction after reopening the route.

To make the browser proof deterministic, checkout now gives the consent row the stable id `checkout-consent` and scrolls it into view when the URL hash targets it. The row also exposes an aria-live status: `الموافقة مطلوبة لإرسال الطلب.` when unchecked and `تم تأكيد الموافقة.` when checked. After the change, typecheck passed and all 9 Vitest files passed with 22 tests.

The remount-through-cart flow with `/checkout#checkout-consent` succeeded in bringing the consent area into the visible viewport. The latest snapshot exposes `label id="checkout-consent"`, the visible initial status `الموافقة مطلوبة لإرسال الطلب.`, and the checkbox as current interactive element index 15. The form was reset on remount, and the final retest has begun with the name `اختبار consent النهائي` entered.

Deterministic malformed-email browser proof passed: after a fresh mount at `/checkout#checkout-consent`, the checkbox was clicked from current element index 15. The next snapshot visibly showed the checkbox checked, the label status `تم تأكيد الموافقة.`, and the submit button as index 16. Clicking submit kept the route on `/checkout#checkout-consent`, preserved the cart and all values, and rendered `اكتب بريدًا إلكترونيًا صحيحًا.`. No order confirmation was shown.


## Post-polish UI verification — 2026-08-24

- Checkout with consent visibly confirmed and `bad-email` stayed on the form after submit and displayed the Arabic validation message: `اكتب بريدًا إلكترونيًا صحيحًا.` No new `orders.create` request was observed for this invalid submission.
- After replacing the email with the synthetic value `test@hoodiefit.local`, the valid COD submission visibly transitioned through `جاري تسجيل الطلب` and then `تم استلام طلبك`.
- The synthetic success state displayed order `HF-2026-90E64821`, total `٩٣٩ ج.م`, a return-to-collection CTA, and a tracking link. The cart counter changed to 0 after success.
- Tracking lookup with `HF-2026-90E64821` and the same synthetic email returned the order card, current status `استلمنا الطلب`, five-step timeline, item row, and COD note.
- CartDrawer Escape behavior, shared-header keyboard traversal, checkout entry focus, and 390px utility-route containment were also verified in the post-polish UI pass.


## Explicit checkout keyboard audit

A fresh cart-backed checkout traversal used individual keys. `Shift+Tab` from the focused submit button moved focus to the consent checkbox; `Space` checked it and the UI immediately exposed `تم تأكيد الموافقة.`; the next `Tab` returned focus to `تأكيد الطلب — ٩٣٩ ج.م`, with a visible focus ring. The submit button was not activated, so no additional order was created.


## Tracking keyboard audit

A fresh tracking page mount was opened with no lookup submitted. Individual navigation reached the tracking form and the live preview showed a visible focus ring on the email field. The next checks explicitly move backward to the order-number input, then forward through email to the search button.


The tracking keyboard traversal explicitly moved from the order-number input to the email input with a visible focus ring. Both inputs are reachable in the expected order without a mouse.


The next individual Tab moved focus from the tracking email input to `ابحث عن الطلب`; the preview showed the search button with a clear focus ring. No lookup was submitted during this keyboard-only check.


## Final consent focus evidence setup

## Growth, retention, and operations verification — 2026-08-25

- Applied and verified growth migrations `0010_eager_rick_jones.sql` and `0011_loving_titanium_man.sql`; the latter adds `productVariants.safetyStock` with default `3`.
- The owner-only `/admin/growth` workspace was visually checked at 1280px and 390px. It exposes coupon creation/toggling, moderation controls for genuinely submitted reviews, logged stock adjustments, and owner-entered Lookbook management. No customer reviews, ratings, Lookbook photos, tracking values, coupons, or operational claims were seeded.
- Customer pages now expose coupon preview and server-authoritative checkout inputs, loyalty balance/redemption for authenticated accounts, account-linked wishlist controls for DB-backed catalog items, published-only Lookbook empty state, product review submission gated server-side by delivered order + matching email + ordered item, and tracking details only when the store operator enters them.
- First-party commerce event paths are limited to `product_view`, `add_to_cart`, `checkout_started`, and the existing server-recorded `purchase_completed`. The dashboard labels these as first-party captured events; no GA4, Meta Pixel, card gateway, carrier webhook, WhatsApp Business API, fabricated conversion result, or automatic message sending was introduced.
- Final validation after this slice: `pnpm check` passed and Vitest passed **26 files / 66 tests**. Mobile screenshots for Lookbook and Growth at 390px and desktop screenshots at 1280px showed no clipping in the newly added surfaces. The public product screenshot used fallback catalog data, so it correctly showed the honest review-unavailable state until a DB-backed published product is present.

Checkout was mounted again with one persisted cart line. The first individual Tab reached the brand link, starting a fresh traversal; the consent checkbox remains the explicit target for the next individual key presses.


The final consent-focus retest did not mutate the form: a direct index click was rejected as stale after the page snapshot changed, so this was not counted as a successful interaction. The audit is continuing with individual keyboard presses only, avoiding off-screen element indices.


The second individual Tab in the final audit moved focus to the "جرّبه عليك" link.


The third individual Tab moved focus to the "عن الفكرة" link.


The fourth individual Tab moved focus to the favorites link.


The fifth individual Tab moved focus to the cart link.


The sixth individual Tab moved focus to the first checkout input field (name).


The seventh individual Tab moved focus from the name field to the checkout email field.


The eighth individual Tab moved focus to the phone field.


The ninth individual Tab moved focus to the city field.


The tenth individual Tab moved focus to the detailed address field.


The eleventh individual Tab moved focus to the optional notes textarea.


The twelfth individual Tab reached the consent checkbox itself. The browser screenshot visibly shows a distinct orange/red focus outline around the checkbox at the end of the consent row while it remains unchecked, confirming the checkbox focus state—not only the submit-button state.


The thirteenth individual Tab moved focus from the consent checkbox to the submit button. The screenshot shows the submit button outlined in yellow/black while the checkbox remains unchecked; no submit action was activated. This completes explicit visible-focus evidence for both consent and submit.


## Final UI checkpoint traceability

The polished UI checkpoint was saved successfully as version `c82af04d` after the post-polish desktop/mobile screenshots, checkout validation/loading/success checks, CartDrawer verification, tracking lookup, and explicit keyboard focus audits.

## DB catalog/admin continuation — 2026-08-24

- Confirmed authenticated admin session in the live preview at `/admin/orders`; Arabic RTL sidebar and existing order lifecycle controls rendered correctly.
- Confirmed `/admin/products` renders four published catalog products from the database, with image thumbnails, SKU, price, four variations, stock status, and publish status.
- Confirmed `/admin/products/1` renders persisted Arabic/English product content, publishing controls, pricing fields, four size variations with stock quantities, and product gallery controls.
- Migrated the four existing HoodieFit catalog items into `catalogProducts`, `productVariants`, `productMedia`, and `productCategories`; current imagery remains disclosed as concept photography in the detail page.
- Confirmed `/product/night-grid-hoodie` resolves by DB slug and renders the DB price, published gallery, size buttons, stock availability, cart CTA, favorites CTA, and free Virtual Try-On CTA.
- Confirmed public catalog query prefers published DB products and retains a static fallback only when no published DB products exist.
- Confirmed typecheck and Vitest after the integration: `pnpm check` passed and 10 test files / 27 tests passed.
- Captured mobile full-page screenshots for `/`, `/product/night-grid-hoodie`, and `/cart` at 390x844. No horizontal overflow was observed; the checkout/cart actions remain readable and touch-sized.
- CartContext, CartDrawer, Cart, Checkout, and Favorites now resolve product data from the public DB catalog query, use variation price overrides when present, and cap local quantities to available variation stock.
- Server checkout re-resolves published product and variation prices and rejects product/variant out-of-stock or insufficient quantity conditions. Live stock reservation/decrement is not enabled yet, so stock can still change between validation and fulfillment.


## WooCommerce-like dashboard pass — 2026-08-24

تم فحص dashboard والمنتجات ومحرر المنتج وشاشة السمات بصريًا على 1280px و390px. أرقام dashboard تطابق بيانات قاعدة البيانات الحالية: 4 منتجات منشورة، 4 منتجات إجمالًا، 16 variation، وطلبان. تم إضافة قسم مستقل للسمات يعرض الألوان والمقاسات المستخرجة من variations، وإضافة قائمة منتجات حية داخل dashboard من نفس admin catalog query. تم تشغيل `pnpm check` و`pnpm test`: 31 اختبارًا ناجحًا وTypeScript بدون أخطاء. الجداول تستخدم horizontal scroll مقصود على mobile بدل كسر المحتوى، بينما النماذج والبطاقات تتحول إلى عمود واحد.


## Account and WooCommerce-like admin pass — 2026-08-24

تمت إضافة `/account` لعرض جلسة العميل، بيانات الحساب، وتاريخ الطلبات المرتبط ببريد المستخدم المصادق عليه فقط عبر `orders.mine` المحمي. الصفحة تعرض حالات loading، anonymous login، empty orders، وerror، وتم فحصها بصريًا على 390px. تم اختبار أن anonymous caller لا يستطيع استدعاء طلبات الحساب. dashboard والـ attributes والمنتجات ظلت ظاهرة على 390px بدون overflow؛ dashboard يعرض 4 منتجات و4 منشورة وطلبين من البيانات الحالية.


## Virtual Try-On flow refinement — 2026-08-25

- زر «جرّبه عليك» موجود داخل كل ProductCard ويغلق اختيار القطعة عند بدء التجربة من بطاقة المنتج.
- روابط صفحة المنتج وStoreHeader تستخدم product slug، وHome يحل slug أو id من catalog DB ثم يعرض القطعة المختارة تلقائيًا.
- عند وجود product context تظهر رسالة «تم اختيار القطعة من صفحة المنتج. ارفع صورتك فقط.» ويختفي dropdown؛ المسار العام بدون context يحتفظ بالاختيار اليدوي.
- نتيجة التجربة أصبحت زرًا قابلًا للضغط يفتح Dialog/Lightbox accessible، مع إغلاق عبر Escape وfocus handling من Radix، بينما يظل التنزيل اختياريًا.
- تم فحص handoff على `/?tryOn=night-grid-hoodie#try-on` على 390px، وظهر Night Grid بدون selector. TypeScript يمر و32 اختبارًا ناجحًا.

## Full e-commerce catalog expansion — 2026-08-25

- تمت إضافة صفحة `/products` مستقلة تعتمد catalog المنشور من قاعدة البيانات وتعرض البحث والترتيب وفلاتر التصنيف والمقاس واللون والسعر والتوفر.
- فحص المتصفح أكد ظهور 4 منتجات منشورة وكل الفلاتر في DOM. اختيار لون «أحمر إشارة» خفّض النتائج من 4 إلى منتج واحد، ما يؤكد عمل filter state على البيانات الفعلية.
- تم فحص `/`, `/products`, `/product/night-grid-hoodie`, `/favorites`, `/cart`, `/checkout`, `/account`, و`/track-order` على 390px؛ لم يظهر overflow، وظهرت حالات empty/account/tracking بصورة واضحة.
- تمت إضافة route ومنطق اختبار نقي للفلاتر؛ `pnpm check` يمر و35 Vitest tests تمر عبر 12 suites.

## Brand assets and product media expansion — 2026-08-25

- تم رفع رمزي العلامة المرسلين إلى تخزين المشروع، واستخدام رمز الموجة بعد قص المساحات البيضاء غير الإبداعي في هيدر المتجر على desktop و390px.
- تمت إضافة `mediaType` غير الهدّامة إلى `productMedia` مع القيم `front` و`back` و`gallery` و`model3d`؛ الوسائط القديمة حُفظت تلقائيًا كـ `gallery`.
- محرر المنتج يضيف الآن صور الواجهة/الظهر/المعرض أو رابط GLB/GLTF، ويرفض validation امتدادات 3D غير المدعومة. صفحة المنتج تسمي thumbnails الأمامية والخلفية بوضوح وتعرض عارض 3D عندما يوجد أصل حقيقي، أو رسالة fallback عند عدم رفعه بعد.
- تمت مراجعة الواجهة الرئيسية وصفحة المنتج وإدارة الوسائط على desktop وmobile. `pnpm check` يمر و35 Vitest tests تمر عبر 12 suites.

## Store header and page-navigation repair — 2026-08-25

- أزيلت `meta` الخاصة بالصفحة من الشريط العلوي، مثل `PRODUCT / Paper White`، حتى لا تتداخل مع روابط المتجر وأزرار العميل.
- أصبح الـ breadcrumb السياقي داخل صفحة المنتج فقط، بينما يحمل header logo وروابط المنتجات والتجربة والطلبات على desktop، وأيقونات الحساب والمفضلة والسلة المستقلة.
- أضيفت قائمة native accessible على mobile لتبقى المنتجات والتجربة وتتبّع الطلب والحساب قابلة للوصول بعد إخفاء الروابط الأفقية.
- تمت مراجعة `/`, `/products`, و`/product/paper-white-hoodie` على 1280px و390px. `pnpm check` و35 Vitest tests تمر.

## Marj brand and operating settings — 2026-08-25

- تم اعتماد هوية «مرج» الظاهرة للعميل مع لوحة بحرية/موجية وشعار الموجة في الهيدر. تدقيق النصوص الموجهة للمستخدم لم يجد أي ظهور متبقٍ لـ `HoodieFit`؛ بقيت تسميتان تقنيتان في تعليقات CSS فقط ولا تظهران في الواجهة.
- جدول `storeSettings` يحتفظ بالاسم ونطاق الشحن ورسوم الشحن وحد الشحن المجاني الاختياري وملاحظة الشحن وسياسة الاستبدال والإرجاع وإفصاح الدفع. تظهر هذه الإعدادات عبر صفحة `/admin/settings` المحمية، ويمكن لصاحب المتجر تغييرها من دون ادعاء تشغيل بوابة دفع غير مربوطة.
- تم ربط حساب رسوم الشحن في السلة والـ checkout وقيمة `orders.create` بالإعدادات المحفوظة. تعرض صفحة `/policies` للعملاء نطاق مصر وسياسة الإرجاع وإفصاح الدفع الحاليين، والـ checkout لا يعرض طريقة دفع حية غير مهيأة.
- لقطات 1280px و390px لـ `/`, `/policies`, `/checkout`, و`/admin/settings` لم تظهر overflow أو تداخلًا في نموذج الإعدادات بعد إضافة الحقول والأنماط. لقطة `/admin/products` أثبتت وجود 4 منتجات منشورة و16 variation، ولقطة `/admin/products/1` أكدت قسم «الصور وملف 3D» مع أنواع `front` و`back` و`gallery` و`model3d` ورفض امتدادات 3D غير GLB/GLTF في validation. لا توجد أصول 3D أو صور ظهر فعلية مقدمة من المالك بعد، لذلك لم يتم اختلاقها.
- فحص الجودة الأخير: `pnpm check` ناجح و`pnpm test` ناجح: 14 test files و38 tests. أضيف اختبار `storeSettings.validation.test.ts` للتحقق من قبول إعدادات الشحن المصرية ورفض رسوم الشحن السالبة وحد الشحن المجاني غير الصالح.

## E-commerce launch readiness — 2026-08-25

- أضيفت `docs/marj-launch-readiness.md` كوثيقة تشغيلية تفصل الأدلة الحالية، فجوات الإطلاق، أولويات P0/P1، إعدادات الشحن والإرجاع والدفع اللازمة، وخطة قياس لا تجمع بيانات شخصية ولا تفعّل Analytics قبل اختيار مزود وموافقة المالك.
- أضيفت `docs/marj-sku-intake-template.md` كقالب قابل للنسخ لكل SKU؛ يلزم فيه السعر والمخزون وحقائق الخامة والـ fit والعناية وجدول المقاسات وصور `front/back` ومعلومات الإرجاع، فلا تتحول الصور أو الافتراضات إلى claims ظاهرة للعميل.

## Admin dashboard operating UX — 2026-08-25

- فحص `/admin`, `/admin/orders`, `/admin/products`, و`/admin/settings` على 1280px و390px أكد أن مصادر البيانات المتاحة حاليًا هي الكتالوج والـ variations والطلبات وإعدادات المتجر؛ لا توجد Analytics أو Payment Gateway أو Tracking data، لذلك لم تُضف KPIs مثل الإيراد أو التحويل أو AOV بلا مصدر حقيقي.
- النظرة العامة الجديدة ترتب البيانات على شكل قوائم عمل: الطلبات الجديدة/المؤكدة/قيد التجهيز، ثم variations منخفضة أو نافدة المخزون، ثم المسودات والمنتجات المنشورة. الروابط تفتح الفلاتر مباشرة عبر `/admin/orders?status=action` و`/admin/products?inventory=attention`.
- فحص visual للروابط أثبت أن فلتر «تحتاج إجراء» يحصر قائمة الطلبات، وأن فلتر «يحتاج متابعة» يعرض empty state صادقًا عند غياب variations منخفضة المخزون. تم تصحيح قراءة query string من عنوان الصفحة بعد اكتشاف أن router لا يضمّنه في قيمة المسار.
- أضيفت وثيقة `docs/admin-dashboard-audit.md` لتوضيح evidence والنطاق والحدود التشغيلية قبل التوسعة التالية.
- اختبار 390px للنظرة العامة وقائمة طلبات الإجراء وفلتر المخزون وإعدادات المتجر مرّ بنجاح: تتكدس قوائم العمل في عمود واضح، وتبقى الـ empty state وحقول الإعدادات قابلة للقراءة ولا يوجد overflow ظاهر.
- فحص الإصدار: `pnpm check` يمر، وVitest يمر عبر 15 ملفًا و40 اختبارًا. يغطي `shared/adminDashboard.test.ts` ترتيب طابور الطلبات وعرض variations النشطة المعرضة للخطر، بينما يغطي `server/admin.validation.test.ts` منع الأدوار غير الإدارية من إدارة الكتالوج.

## Marj header logo refinement — 2026-08-25

- أزيل تركيب الشعار القديم الذي جمع رمز موجة صغيرًا وكلمة «مرج» وشرطة مائلة؛ ظهر في لقطة العميل كعلامات متنافرة ومضغوطة.
- أصبح الهيدر والفوتر يستخدمان wordmark «مرج» عربيًا واحدًا وواضحًا، من دون رمز/شرطة متداخلة. تمت مراجعته على `/` و`/products` عند 1280px و390px؛ الكلمة واضحة ومحاذاة مع عناصر التنقل والحساب ولا يوجد overflow.
- فحص ما بعد التعديل ناجح: `pnpm check` يمر و15 ملفات Vitest تشمل 40 اختبارًا ناجحًا.

## Admin layout and select visibility repair — 2026-08-25

- لقطة المستخدم أثبتت أن المحتوى كان يمر بصريًا تحت الـ sidebar، وأن نصوص قائمة الحالة المفتوحة لا تملك contrast مناسبًا. تم توثيق السبب في `docs/admin-layout-incident.md`.
- أصبح الـ sidebar يحجز عموده فعليًا على desktop، فيما تملأ `admin-layout-inset` بقية المساحة. تبويبات القائمة لا تلتف، وحقل status ومحددات المنتجات تعرض لون نص وخلفية ثابتين للـ select والـ option مع focus واضح.
- تمت مراجعة `/admin/orders`, `/admin/products`, و`/admin/settings` عند 1718px و390px. لم يعد هناك تداخل بين محتوى الصفحات وsidebar؛ وقيم الفلاتر والحقول مرئية. `pnpm check` و15 ملفات Vitest/40 اختبارًا تمر.

## Full UI/UX audit — 2026-08-25

- تمت مراجعة واجهة العميل: `/`, `/products`, صفحة منتج، `/favorites`, `/cart`, `/checkout`, `/track-order`, `/account`, و`/policies`، وكذلك صفحات الإدارة: overview والمنتجات ومحرر المنتج والتصنيفات والسمات والطلبات والإعدادات؛ على 1280px و390px، إضافة إلى فحص الإدارة عند 1718px. الأدلة والأولويات محفوظة في `docs/full-ui-ux-audit.md`.
- أظهرت المراجعة أن الرحلة التجارية الأساسية وempty states وform stacking والـ drawer والتنقل RTL لا تعاني overflow ظاهرًا. ظلت حدود الصدق التشغيلي ظاهرة: لا توجد بوابة دفع أو Analytics أو تتبع شحن حقيقي، ولم تُعرض أي مؤشرات مصطنعة.
- أُنجز الإصلاح الأعلى أثرًا: جدول الطلبات يتحول على الهاتف إلى بطاقات labels واضحة، والـ variations في محرر المنتج تتحول إلى صفوف قابلة للمسح مع SKU/لون/مقاس/مخزون/حالة، والبريد وأرقام الهاتف تحافظ على LTR دون تكسّر. بقي الجدول كاملًا في desktop.
- تم فحص قواعد focus المرئية للتنقل والحقول والأزرار. `pnpm check` يمر و15 ملفات Vitest تشمل 40 اختبارًا ناجحًا.

## Shipping, payments, and analytics operations — 2026-08-25

- أضيفت migration `0007_jittery_magma.sql` وطبقت على قاعدة البيانات: `shippingZones` و`paymentMethods` وحقل `orders.paymentMethod`. تم تهيئة 27 محافظة مصرية مفعلة وقابلة للتحرير، وطرق الدفع: الدفع عند الاستلام مفعّل، أما Vodafone Cash وInstaPay والتحويل اليدوي والبطاقات فموقوفة افتراضيًا إلى أن يجهزها المالك.
- تبويب `/admin/shipping` يسمح بتغيير رسوم كل محافظة وإيقافها وإضافة ملاحظة توصيل، مع بحث بالاسم. `Checkout` يختار محافظة مفعلة ويعرض رسمها، بينما الخادم يعيد التحقق من المحافظة ويحسب الإجمالي النهائي. السلة تعرض الإجمالي قبل الشحن كي لا تنسب رسمًا عامًا خاطئًا للمحافظة.
- تبويب `/admin/payments` يفعّل الدفع عند الاستلام أو التحويل/المحفظة فقط عندما تكون تعليمات العميل محفوظة. أضيف منع خادمي لتفعيل طريقة `online_card` قبل مزود دفع وحساب تاجر؛ لا توجد Visa أو محفظة online متصلة في هذه النسخة.
- تبويب `/admin/analytics` يحسب من orders/orderItems/catalog فقط: قيمة الطلبات غير الملغاة، المتوسط، الحالات، طرق الدفع، المنتجات والمحافظات، وتنبيهات variations. المقاييس التي تتطلب events أو payment/refund source تعرض Blocked بدل أرقام مصطنعة. المواصفات محفوظة في `docs/shipping-payment-analytics-spec.md`.
- مراجعة desktop و390px لـ `/admin/shipping`, `/admin/payments`, `/admin/analytics`, `/cart`, و`/checkout` لم تظهر تداخلًا. `pnpm check` ناجح و19 ملف Vitest / 47 اختبارًا ناجحًا، بما فيها تحليلات الطلبات وقواعد رسوم المحافظة وتفعيل الدفع وعقود الإدارة.

## Narrow mobile header cart visibility — 2026-08-25

- أثبتت لقطة العميل أن زر السلة كان يظهر كعداد فقط بلا رمز؛ لم تكن المشكلة overflow في التخطيط بل غياب `ShoppingBag` من تركيب زر السلة نفسه بعد إخفاء النص على الهاتف.
- أضيف رمز السلة داخل الزر، مع بقاء عداد العناصر ووصلته إلى `/cart` كما هما. التحقق على `/`, `/products`, و`/cart` عند 290px، ثم `/` عند 390px، أظهر رمز السلة مع الحساب والمفضلة داخل حدود الهيدر.
- فحص ما بعد التصحيح: `pnpm check` يمر و19 ملف Vitest تشمل 47 اختبارًا ناجحًا.

## Header typography readability — 2026-08-25

- كُبّر wordmark «مرج» في هيدر desktop وmobile، وكُبرت روابط التنقل في desktop وروابط القائمة المطوية في الهاتف مع زيادة طفيفة في ارتفاع ومسافات الهيدر.
- تمت المراجعة على `/`, `/products`, و`/cart` عند 290px، ثم `/` عند 1280px. بقيت أزرار الحساب والمفضلة والسلة مرئية، وأصبح الاسم وروابط desktop أكثر قابلية للقراءة من دون overlap.

## Cart icon and checkout CTA clarity — 2026-08-25

- ثُبّت رمز `ShoppingBag` بحجم وسمك stroke أعلى وقاعدة display صريحة داخل زر السلة، كما أضيف `position: relative` للزر حتى يثبت عداد العناصر فوقه بدل الاعتماد على موضع خارجي. لقطة 437px تؤكد أن الرمز مرئي بجوار العداد.
- استُبدل زر الإتمام السابق برابط CTA صريح عالي التباين داخل ملخص السلة: عنوان «إتمام الطلب»، سطر يوضح اختيار المحافظة وطريقة الدفع، خلفية teal، ظل وحالة focus/active مرئية. يظهر هذا فقط عند وجود عناصر في السلة؛ لا يتم اختراع عناصر لاختبار الحالة.
- `pnpm check` و19 ملف Vitest / 47 اختبارًا ناجحًا بعد التعديل.

## Comprehensive UI repair pass — 2026-08-25

- استُبدل الهيدر المحلي المختلف في `/` بـ `StoreHeader`، فاختفى سبب عدم اتساق رمز السلة وقائمة الهاتف بين الصفحة الرئيسية وبقية المسارات.
- فُرضت حاوية إدارة full-width على الهاتف مع صفوف بطاقات للمنتجات؛ راجعت `/admin/products` و`/admin/orders` عند 390px بعد التعديل ولم يعد الـ sidebar غير المرئي أو الجدول المكتبي يحجز عرض المحتوى.
- بطاقات Home وCatalog تعرض صور المنتجات الأربع الفعلية الآن عند 390px، مع fallback مكتوب وصادق إذا فشل مصدر الصورة. لم تُنتج أو تُدخل صور منتج غير مقدمة من المالك.
- جولة desktop عند 1440px شملت Home وCatalog وPDP وOverview/Products/Orders/Shipping/Payments. `pnpm check` و19 ملف Vitest / 47 اختبارًا ناجحًا. يظل اختبار مالك المتجر بسلة مملوءة آخر تحقق يدوي مقترح من دون إنشاء طلب تجريبي.

## Arabic / English localization and direction — 2026-08-25

- أُضيف `LanguageProvider` محفوظ محليًا ومفتاح لغة في `StoreHeader` ولوحة الإدارة، يضبط `html[lang]` و`html[dir]` ويدعم `?lang=ar|en` لفحص النسختين.
- أزيلت اتجاهات RTL المفروضة محليًا من Home وCatalog وAccount وPolicies وAdmin Shell، ثم أضيفت overrides مدروسة للجداول وsidebar وCart Drawer في LTR.
- جرى فحص Home/Catalog/PDP/Cart/Checkout/Admin/Products/Orders عند 1280px بالإنجليزية و390px بالعربية والإنجليزية. تبقى قيم البريد والهاتف وSKU LTR داخل العربية، والأسعار تظهر EGP بالإنجليزية و`ج.م` بالعربية.
- فحص الإصدار النهائي يمر: `pnpm check` ناجح، وVitest يشغل 20 ملفًا و49 اختبارًا ناجحًا، بما فيها `shared/i18n.test.ts` لترجمة labels المشتركة واتجاه المستند.

## Mobile navigation and responsive refinement — 2026-08-25

- أضيف `MobileBottomNav` لواجهات العميل فقط: الرئيسية، المنتجات، التجربة الافتراضية، السلة، والحساب. يدعم active state وعداد السلة ويتبع لغة واتجاه الواجهة.
- فحص viewport مباشر عند 390px أثبت ظهوره بالعربية والإنجليزية في Home وCart، وغيابه في Checkout وAdmin. المساحة السفلية وsafe-area لا تطبق إلا عند ظهور الشريط، وتبقى إجراءات الإتمام وDialogs/Drawer أعلى منه.
- عُدلت مسافات المحتوى والسلة والحساب والسياسات والكتالوج كي لا تُحجب خلف الشريط. لم تُنشأ سلة أو طلب تجريبي.

## Customer purchase journey audit — 2026-08-25
- تمت مراجعة العميل من الكتالوج إلى صفحة المنتج ثم السلة وcheckout. اختُبر اختيار مقاس L من صفحة المنتج وظهر كسطر مستقل صحيح في السلة، كما ثبتت زيادة العداد وحفظ السلة محليًا. أزيلت بيانات السلة وحقول الاختبار في نهاية المراجعة ولم يُنشأ طلب أو بيانات عميل تشغيلية.
- ظهر عائق تحويل واضح: الإضافة المباشرة من الكتالوج كانت تفترض مقاس M من دون توضيح أو feedback. أصبحت المقاسات S/M/L/XL قابلة للاختيار على البطاقة، والزر يذكر المقاس المحدد، وتظهر رسالة نجاح مع رابط مباشر إلى السلة. تعمل النصوص الجديدة بالعربية والإنجليزية؛ جرى فحص `?lang=en` للـ CTA وaria-label.
- عند checkout بسلة غير فارغة، اختُبرت رسالة البريد غير الصحيح ثم موافقة الخصوصية الناقصة، ولم يُرصد طلب `orders.create` قبل اجتياز التحقق. الواجهة تعرض 27 محافظة مفعلة ورسوم المحافظة والـ COD المفعّل؛ الخادم يعيد التحقق من المحافظة وطريقة الدفع والمقاس والمخزون وسعر الـ variation قبل الحفظ.
- أضيفت اختبارات لاختيار مقاس الإضافة السريعة ولإعادة فحص variation الخادمي. `pnpm check` ناجح وVitest: 21 ملفًا و52 اختبارًا ناجحًا. متطلبات الإطلاق المتبقية تشغيلية: ضبط رسوم/ملاحظات المحافظ الفعلية، وإدخال تعليمات وتفعيل أي محفظة يدوية، وربط مزود مدفوعات قبل إتاحة البطاقات.

## 3D product model upload and rendering repair — 2026-08-25
- سبب الخلل في الصورة المرسلة كان أن رابط `https://printblur.com/shop/3d-hoodies` هو صفحة متجر/عرض وليس ملف نموذج 3D أو صورة. حقل الصورة الرئيسية صار يقبل ملف صورة مباشرًا فقط (JPG/PNG/WEBP/AVIF) ويشرح بوضوح أن نموذج 3D يُضاف من قسم الوسائط المخصص.
- أضيف مدير وسائط 3D مستقل داخل محرر المنتج: رفع ملف GLB من الجهاز حتى 12MB مع فحص التوقيع وإصدار glTF 2.0 وطول الملف قبل التخزين، أو رابط مباشر ينتهي بـ `.glb`/`.gltf`. يمنع الرابط غير المباشر قبل الإرسال، ويستبدل أي نموذج 3D سابق للمنتج بدل تراكم نماذج متنافسة.
- اختُبر عارض `@google/model-viewer` فعليًا في المتصفح بملف GLB صالح محفوظ في تخزين المشروع؛ `customElements.get('model-viewer')` كان معرّفًا ووصل حدث `load` بنجاح. صفحة المنتج تعرض fallback واضحًا إذا كان الرابط غير مباشر أو تعذر التحميل. لم يُحفظ نموذج الاختبار على أي منتج، لأن جلسة المدير لم تكن متاحة في متصفح الاختبار.
- `pnpm check` ناجح وVitest: 22 ملفًا و56 اختبارًا ناجحًا، وتشمل فحوص امتدادات الروابط وتوقيع GLB وصيغة رفع النموذج ورابط الصورة الرئيسية.

## WhatsApp manual-payment receipt handoff — 2026-08-25
- أضيف `whatsappNumber` اختياري إلى كل طريقة دفع، مع migration `0008_absurd_morgan_stark.sql` مطبقة بنجاح. يظهر الحقل فقط في طرق `manual_transfer` مثل Vodafone Cash وInstaPay، ويقبل رقمًا مصريًا محليًا أو دوليًا ثم يطبّعه لصيغة WhatsApp. يبقى الرقم اختياريًا؛ بدون حفظه لا تظهر خطوة WhatsApp بعد الطلب.
- بعد نجاح طلب تحويل يدوي مهيأ، يعيد الخادم رقم وجهة ورسالة جاهزة تتضمن رقم الطلب وطريقة الدفع والإجمالي والاسم والهاتف والقطع فقط؛ لا تضع الرسالة العنوان أو البريد. تظهر واجهة تأكيد تفتح `wa.me` بالمحتوى الجاهز، مع خيار مشاركة ملف Screenshot عبر نظام المشاركة عندما يدعم الهاتف مشاركة الملفات.
- لا يرفع المتجر Screenshot ولا يخزنه؛ العميل يرفقه داخل WhatsApp ويؤكد الإرسال بنفسه. لم يُفتح WhatsApp أو تُرسل رسالة أثناء التحقق. فحص tRPC العام أثبت أن `store.paymentMethods` لا يعيد حقل `whatsappNumber` قبل تأكيد الطلب.
- `pnpm check` ناجح وVitest: 23 ملفًا و58 اختبارًا ناجحًا، بما في ذلك تطبيع الرقم ورسالة الإيصال والخصوصية الأساسية.

## WhatsApp order-status handoff — 2026-08-25
- لكل حالة طلب (`جديد`، `تم التأكيد`، `قيد التجهيز`، `تم الشحن`، `تم التسليم`، `ملغي`) رسالة عربية دقيقة لا تدّعي تقدمًا غير مسجل. بعد حفظ تغيير الحالة في الإدارة تظهر رسالة نجاح وبداخل صف الطلب رابط «إرسال تحديث WhatsApp»؛ يفتح المحادثة بالنص المجهز للمدير كي يراجعه ويرسل بإرادته.
- الرسالة تتضمن اسم العميل ورقم الطلب والحالة والإجمالي فقط، ولا تتضمن العنوان أو البريد. رقم العميل يطبع لصيغة مصرية دولية؛ عند رقم غير صالح تتغير الحالة فقط ولا يظهر رابط الرسالة.
- طبق رقم المالك المقدم `+201555627461` على Vodafone Cash وInstaPay والتحويل اليدوي فقط، وبقيت هذه الطرق الثلاث غير مفعلة. لم يتم إرسال WhatsApp أو تعديل حالة أي طلب حقيقي أثناء التحقق.
- `pnpm check` ناجح وVitest: 24 ملفًا و60 اختبارًا ناجحًا، وتشمل قوالب حالات الطلب وتطبيع رقم العميل والرابط. الإرسال التلقائي الحقيقي غير مفعّل ويحتاج WhatsApp Business API وقوالب معتمدة ومفاتيح خادمية.

## English localization completion audit — 2026-08-25
- لقطات English الأولى أثبتت أن Home تحسن بعد توسيع القاموس: hero، القصة، الكتالوج، وتجربة القياس تظهر بالإنجليزية. بقيت ARIA/alt labels عربية في بعض الأزرار والصور لأن نصها مركب مع اسم المنتج.
- صفحة المنتج كشفت محتوى عربيًا مزروعًا خارج النصوص الهيكلية: قيمة fabric، بعض detail/care values، وتسميات المفضلة والصور المركبة. ستترجم فقط قيم العينة المضمنة؛ أي محتوى يضيفه المالك لاحقًا يبقى بلغته حتى يضيف مقابله الإنجليزي.
- إعادة فحص English أكدت أن الكتالوج وصفحة المنتج أصبحا إنجليزيين بصريًا، بما يشمل الفلاتر وخصائص القطعة وقائمة التفاصيل وCTA. ما زالت alt texts الخاصة بصور المنتج عربية في extracted markup فقط؛ لا تظهر كنص واجهة، وسيستبدلها المكوّن بصياغة إنجليزية صريحة ضمن الجولة التالية للوصولية.
- السلة الفارغة تظهر بالإنجليزية بالكامل. صفحة السياسات كشفت ثلاث جمل عربية من نصوص التشغيل المزروعة افتراضيًا، لذلك أضيفت لها ترجمات دقيقة؛ ستبقى سياسات وتعليمات المالك التي يحررها لاحقًا بلغته ما لم يقدم النسخة الإنجليزية لتجنب تغيير معلومات تشغيلية حقيقية.
- تتبع الطلب كامل بالإنجليزية في الصفحة الفارغة. حالة المفضلة الفارغة كانت إنجليزية باستثناء كلمتي heading؛ أضيفت ترجمتهما. لم تُنشأ طلبات أو بيانات عملاء لأجل اختبار حالات التتبع الحية.
- شاشة الحساب والإدارة غير المصرح بها كشفت نصًا عربيًا إضافيًا. عولجت جمل الدخول والصلاحيات، كما أزيلت ترجمة عامة لكلمة «مصر» لأنها كانت تغيّر جزءًا من كلمة «المصرح» داخل النص العربي؛ استبدلت بترجمة العبارة الكاملة الآمنة.
- أُعيد تدقيق المفضلة بعد الإصلاح: الصفحة الإنجليزية كاملة LTR، وفحص نص DOM لم يجد إلا الرمز `ع` داخل زر تبديل اللغة، وهو مقصود لتمكين الرجوع للعربية.
- الحساب غير المسجل ينتقل بعد التحميل إلى نسخة English صحيحة. أضيفت ترجمة حالة `Loading account...` كذلك كي لا تظهر ومضة عربية قبل استجابة المصادقة.
- شاشة تسجيل دخول الإدارة أصبحت English كاملة LTR؛ فحص نص DOM أظهر صفر أحرف عربية. لا تتوفر جلسة مشرف في متصفح الاختبار، لذلك بقي تدقيق شاشات الإدارة المصرح بها على مستوى النصوص الثابتة والمراجعة البرمجية، مع احتفاظ المحتوى الذي يكتبه المالك بلغته.
- جرى فحص نهائي عند 1440px و390px لمسارات Home والكتالوج وصفحة المنتج والسلة وcheckout والمفضلة والتتبع والسياسات. الواجهة الثابتة تظهر English وLTR؛ لا تُترجم حقول المحتوى التشغيلي التي يدخلها المالك لاحقًا كي لا تتغير الحقائق، ويلزم إدخال نسخة إنجليزية منه عند الحاجة.
- أضيف اختبار i18n لحماية عبارات Home وتفاصيل المنتج التي ظهرت عربية في البلاغ. `pnpm check` ناجح وVitest: 24 ملفًا و61 اختبارًا ناجحًا.

## Store team users and invitations — 2026-08-25
- أضيفت migration `0009_overrated_wolfpack.sql` وطُبقت بنجاح لإنشاء `storeTeamMembers` و`storeTeamInvites`. حساب المدير الرئيسي لا يتغير؛ العضو يحصل على سجل وصول منفصل قابل للإلغاء دون مشاركة أي اعتماد للمدير.
- الأدوار الأقل صلاحية هي: متابعة الطلبات، إدارة المنتجات، عرض التحليلات، ومدير المتجر. إعدادات الدفع والشحن وإعدادات المتجر وإدارة الفريق تبقى owner-only. كل إجراء tRPC حساس يفحص القدرة المطلوبة خادميًا، كما يفلتر الشريط الجانبي للعضو حسب دوره.
- الدعوة رابط لمرة واحدة فقط، صالح لمدة 24 ساعة أو 3 أيام أو 7 أيام، ويخزن في قاعدة البيانات كتجزئة SHA-256 لا كرمز خام. يقبلها الموظف بعد تسجيل الدخول؛ يمكن للمالك نسخ الرابط وإلغاؤه أو تغيير الدور أو سحب وصول العضو.
- تمت مراجعة شاشة رابط دعوة ناقص بالعربية ولا تعرض أي بيانات أو رسالة مختلطة. `pnpm check` ناجح وVitest: 25 ملفًا و64 اختبارًا، وتشمل اختبار صلاحيات الدور ورفض الدعوات المستخدمة أو الملغاة أو المنتهية. لم تُنشأ دعوة أو عضو تجريبي على بيانات المتجر.


## Team invitation duration extension — 2026-08-25

تمت إضافة اختيارين جديدين من لوحة فريق المتجر: `30 يوم / 30 days` و`غير محدودة / Unlimited`، مع الإبقاء على 24 ساعة و3 أيام و7 أيام. المدة غير المحدودة تُخزَّن كـ `expiresAt = null` بدل تاريخ اصطناعي، وتظل الدعوة محكومة بتجزئة token، والاستخدام لمرة واحدة، والإلغاء، والتحقق من الدور.

تم تعديل schema وتطبيق migration `0012_tidy_korvac.sql` لجعل `storeTeamInvites.expiresAt` nullable. أضيف اختبار يثبت أن الدعوة غير المحدودة فعالة قبل القبول أو الإلغاء، مع بقاء الدعوة المقبولة أو الملغاة غير فعالة. `pnpm check` ناجح وVitest: 26 ملفًا و67 اختبارًا ناجحًا. لقطة مسار `/admin/team` لم تكتمل بسبب جلسة preview غير مصادق عليها؛ الخادم والواجهة سجلا الحالة الجديدة، ويجب على المالك فتح لوحة الفريق بحسابه للتحقق البصري النهائي.


## Comprehensive QA — initial live user pass — 2026-08-25

تم فتح النطاق المنشور `https://hoodiefit-ymbc2qp6.manus.space/` والتحقق من الصفحة الرئيسية ثم الانتقال إلى `/products`. ظهرت روابط المنتجات وLookbook وTry-On والطلبات والحساب والمفضلة والسلة، كما ظهرت أربع بطاقات منتجات مع اختيار المقاس S/M/L/XL، الفلاتر، البحث، الترتيب، وأزرار الإضافة للسلة. لم يتم إنشاء طلب أو تغيير بيانات تشغيلية خلال هذا الجزء من الاختبار.


- في الاختبار الحي، انتقل رابط المنتجات بنجاح إلى `/products`. ظهرت الفلاتر والبحث والترتيب وأزرار المقاسات. اختيار فلتر S غيّر حالة الفلتر وظهر زر إلغاء الكل؛ لكن عدد النتائج بقي 4 لأن المنتجات الأربع تدعم S، وهو سلوك متوقع. الضغط على زر إضافة أول منتج أبقى الصفحة مستقرة، وسنراجع عداد السلة من مسار مستقل لأن preview قد يثبت اللقطة قبل تحديث العداد.


## Comprehensive QA — product and review negative pass — 2026-08-25

تم فتح صفحة المنتج المنشورة بنجاح. ظهرت صورة المنتج، التحويل بين الواجهة الأمامية والزاوية الإضافية، حالة توفر المنتج، المقاسات، السعر، CTA السلة، Try-On، المفضلة، وقسم المراجعات الذي يوضح عدم وجود مراجعات منشورة حاليًا دون اختلاق تقييمات. تم إدخال رقم طلب غير صالح وبريد غير صحيح ونص قصير للتحقق من منع المراجعة؛ لم يتم إنشاء مراجعة أو بيانات تشغيلية.


## Comprehensive QA — public empty states — 2026-08-25

تم فتح `/lookbook` وظهر empty state صادق يوضح عدم وجود مدخلات منشورة مع رابط تسوق. تم فتح `/cart` وظهر empty state صادق مع رابط استكشاف المجموعة، ولم تُنشأ طلبات أو مراجعات أو بيانات تشغيلية. التنقل العام بقي ظاهرًا في المسارين.


## Comprehensive QA — English and localization pass — 2026-08-25

تم فتح `/products?lang=en` وظهرت واجهة English مع اتجاه LTR، عناوين وفلاتر وأزرار مترجمة، وأسماء المنتجات الإنجليزية. تم الضغط على زر اللغة فعاد إلى العربية بنجاح مع عودة RTL. لم يظهر في النص التشغيلي المختبر خلط عربي غير مقصود داخل نسخة English، بينما بقيت أسماء الصور/المحتوى المالك كما هي حسب السياسة.


## Comprehensive QA — responsive public pass — 2026-08-25

تم التقاط `/products` و`/cart` و`/lookbook` عند viewport 390px. ظهرت القائمة العلوية وشريط التنقل السفلي، ولم يظهر overflow أفقي في اللقطات. الكتالوج يعرض زر الفلاتر والترتيب بشكل مناسب للهاتف، والسلة وLookbook يعرضان empty states قابلة للقراءة مع CTA واضح. أُسجل ملاحظة QA: لقطة الكتالوج تُظهر تسمية زر الفلاتر بالعربية داخل صفحة عربية، وهذا متوقع؛ نسخة English يجب فحصها منفصلة عند الحاجة.


## Comprehensive QA — checkout and tracking guest pass — 2026-08-25

عند فتح `/checkout` كضيف، أعاد التطبيق إلى بوابة تسجيل الدخول بدل السماح بالوصول غير المصادق؛ هذا يثبت وجود auth gate ويمنع إنشاء طلب من جلسة مجهولة. تم فتح `/track-order` كضيف بنجاح، وظهر نموذج رقم الطلب والبريد وزر البحث، دون إدخال رقم حقيقي أو تنفيذ lookup تشغيلي. لا يمكن إكمال اختبارات customer-authenticated وowner/team من هذه الجلسة دون تسجيل دخول فعلي.


## Product creation editor parity fix — 2026-08-25

كان السبب أن JSX الخاص بـ`PRODUCT VARIATIONS` و`PRODUCT MEDIA / 3D` محاط بشرط `!isNew`، لذلك كان يظهر في التحرير فقط. تم إزالة الحجب البصري من مسار الإنشاء، وأصبح القسمان يظهران في `/admin/products/new` بنفس ترتيب التحرير. قبل إنشاء `productId` تبقى أدوات الإضافة مقفلة بصريًا ووظيفيًا مع رسالة واضحة لحفظ بيانات المنتج الأساسية أولًا؛ بعد الحفظ ينتقل المسار إلى `/admin/products/:id` لتفعيل الإضافة المرتبطة بالمنتج.

تم التحقق بصريًا من شاشة المنتج الجديد عند desktop 1280px وmobile 390px، ومن شاشتي تحرير منتجين موجودين عند desktop، وظهرت أقسام variations والصور/3D في المسارات الثلاثة. نجح `pnpm check` و`pnpm test` بنتيجة 26 ملفًا و67 اختبارًا، كما نجح `pnpm build`. لم يتم إنشاء منتج تجريبي أو تعديل بيانات المتجر التشغيلية.


## Comprehensive QA — admin access gate — 2026-08-25

تم فتح `/admin/products` و`/admin/products/new` من جلسة متصفح غير مصادق عليها. كلا المسارين عرضا شاشة تسجيل الدخول للمتابعة ولم يكشفا قائمة المنتجات أو نموذج الإنشاء؛ هذا يؤكد حماية مسارات الإدارة. لا يمكن اختبار إجراءات owner/team المصرح بها في جلسة المتصفح الحالية دون تسجيل دخول فعلي، لذلك لا تُسجّل هذه النتيجة كاختبار صلاحيات داخلي كامل.


## GitHub export verification — 2026-08-30

تم فحص الريبو `https://github.com/aliabdelazim7/Marg-Site` قبل الرفع وتحويل خصوصيته إلى Private. تم رفع مصدر متجر مرج كاملًا إلى branch `main` في commit `6eee8c09a2d1d9f8150f29df0b181202d6b92392`، وتطابق `git ls-remote origin refs/heads/main` مع الـSHA المحلي. النسخة تتضمن source code والواجهة والخادم وshared modules وschema والـmigrations من `0000` إلى `0012` والاختبارات والتوثيق وملفات الإعداد اللازمة.

تم استبعاد `.env` وملفات credentials والمفاتيح والشهادات و`node_modules` و`dist` و`.manus-logs` و`.project-config.json` وملفات version/debug وملفات قواعد البيانات المحلية. فحص أسماء الملفات ومسح literals الشائعة للمفاتيح لم يعثر على أسرار. تم تثبيت الاعتمادات من lockfile داخل clone مستقل، ونجح `pnpm check` و`pnpm test` بنتيجة 26 ملفًا و67 اختبارًا و`pnpm build`. توجد ملاحظة build غير حاجبة عن bundle أكبر من 500KB.
