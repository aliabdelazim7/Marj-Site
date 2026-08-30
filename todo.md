# Project TODO

- [x] Establish Arabic RTL storefront shell with International Typographic Style visual system.
- [x] Add responsive header navigation linking to the hoodie catalog and free Virtual Try-On.
- [x] Build editorial hero section with clear primary and secondary calls to action.
- [x] Create curated hoodie catalog with product cards, colors, prices, and direct try-on actions.
- [x] Connect selected hoodie state from catalog/product cards into the Virtual Try-On flow.
- [x] Build Virtual Try-On upload interface with photo guidance, accepted formats, size limits, and accessible labels.
- [x] Add explicit privacy consent notice explaining image processing and temporary handling.
- [x] Add selected garment preview and change-garment control inside the try-on experience.
- [x] Implement server-side image upload/storage path without exposing service credentials.
- [x] Implement server-side AI image generation using the selected hoodie and customer photo.
- [x] Add loading, validation error, generation error, retry, empty, and success states.
- [x] Add downloadable generated try-on result.
- [x] Add mobile-first RTL layout, keyboard focus states, contrast, and reduced-motion behavior.
- [x] Add Vitest coverage for try-on validation and core product-selection behavior.
- [x] Run typecheck, tests, and visual responsive verification.
- [x] Review privacy copy, unsupported claims, and placeholder content before delivery.
- [x] Register the injected Shopify commerce router and env exports. — not applicable; Shopify removed from scope.
- [x] Replace prototype catalog data with normalized Shopify catalog when products are available. — not applicable; local catalog retained.
- [x] Add Shopify cart entry point without exposing storefront credentials. — not applicable; Shopify removed from scope.
- [x] Remove the unused Shopify router/env registration and keep the storefront fully project-local.
- [x] Record the Shopify integration attempt as intentionally cancelled, without using it in the product experience.
- [x] Stop persisting uploaded input photos and revise privacy copy to match actual retention behavior.
- [x] Add product-selection linkage coverage for the catalog and Virtual Try-On state source.
- [x] Remove remaining unused Shopify env fields from server/_core/env.ts.
- [x] Re-run privacy/content review after the corrections.

## Final review note

Privacy copy now states that the visitor photo is sent only for the preview request, is not published in the catalog, and is not shown to other users. The input photo is not persisted by the app; only the generated result is returned through the image-generation storage flow. The storefront contains no fabricated reviews, ratings, testimonials, or unsupported performance claims. Shopify is intentionally excluded from this local-store scope.

- [x] Add an independent RTL detail page for every hoodie with slug routing.
- [x] Expand product model with real product copy, specifications, sizing, care, availability, and gallery media.
- [x] Replace CSS-only hoodie visuals with real photographic product assets in the catalog and detail pages.
- [x] Add a 3D-like product viewer using interactive rotation and a static-photo fallback.
- [x] Add direct product-detail-to-try-on navigation preserving the selected hoodie.
- [x] Diagnose and improve Virtual Try-On generation error handling and user-facing retry feedback.
- [x] Add tests for product detail routing/data and try-on product handoff.

- [x] Add explicit in-stock availability fields and surface them on detail pages.
- [x] Add multiple gallery media entries per product, clearly treated as concept photography until real seller photos are provided.
- [x] Add a deterministic test for detail-page query handoff preserving the selected hoodie.
- [x] Add visible disclosure that current gallery images are concept/generated photography until real seller photos are provided.
- [x] Add deterministic coverage for restoring the selected hoodie from the `?tryOn=` route query.
- [x] Re-run responsive/UX review after adding the disclosure.

- [x] Diagnose repeated Virtual Try-On generation failure from server logs and image-generation contract.
- [x] Add a robust image input normalization path for browser-uploaded photos.
- [x] Preserve actionable service errors while keeping user-facing privacy-safe messaging.
- [x] Add tests for image normalization and retry/error behavior.
- [x] Re-run an equivalent try-on contract check after the fix; live generation still needs one real user-photo test.
- [x] Add a test covering mapped generation failure and retry-safe state behavior.
- [x] Add an integration-style try-on caller test with a normalized sample payload and mocked image service.
- [x] Document post-fix contract verification results.
- [x] Add a state-level retry test proving a failed generate attempt preserves the selected hoodie and uploaded photo.
- [x] Ensure the retry-state test is included in the active Vitest configuration and rerun it.
- [x] Add an actual Home-flow state test or extract the generate-failure transition into a directly tested flow function.

## WordPress Virtual Try-On plugin extraction

- [x] Define a provider-agnostic WordPress AI contract configured server-side via wp-config.php.
- [x] Create a standalone plugin folder with main PHP bootstrap, shortcode UI, REST endpoint, CSS, and JavaScript.
- [x] Add WordPress nonce checks, capability-safe public endpoint behavior, MIME/size/dimension validation, and safe filenames.
- [x] Add privacy-preserving processing with no permanent input-photo storage by default.
- [x] Add IP/user rate limiting, request timeouts, actionable safe errors, retry behavior, and downloadable result handling.
- [x] Add plugin README with installation, configuration, privacy, provider adapter, and troubleshooting instructions.
- [x] Add static checks and test fixtures for validation, nonce/rate-limit logic, and provider response handling.
- [x] Package and audit the plugin ZIP before delivery.

## WordPress plugin verification

- [x] Build a WordPress REST shim with valid image fixtures for end-to-end plugin checks.
- [x] Verify successful provider payload mapping and image response handling.
- [x] Verify nonce, consent, MIME/size/dimension rejection, provider failure, rate limiting, and secret non-disclosure.
- [x] Repackage the ZIP after verification and document any environment-only limitations.
- [x] Add a real provider adapter interface so AI providers can be swapped without changing core REST logic.
- [x] Extend the runtime shim with MIME, decoded-size, and image-dimension rejection cases.
- [x] Rebuild the plugin ZIP after the final verification pass and document the included test limitations.

## WordPress demo

- [x] Choose a safe demo runtime that can host WordPress and expose a temporary preview.
- [x] Add a demo-only provider mode that returns a clearly labeled synthetic preview without external AI secrets.
- [x] Install the standalone plugin into the demo and create a page containing the shortcode.
- [x] Verify demo upload, nonce, validation, result, retry, and privacy messaging flows.
- [x] Expose the demo URL and document its temporary/non-production limitations.
- [x] Replace the demo's real AI secret path with a clearly labeled synthetic provider that makes no external AI call.
- [x] Run the exposed WordPress demo through the real REST path and verify nonce, validation, result, retry, and privacy copy; browser rendering remains proxy-sensitive.
- [x] Record the demo test outcome and distinguish synthetic demo output from real AI try-on output.
- [x] Run equivalent negative REST checks for invalid MIME, oversized payload, and invalid dimensions against the local WordPress REST shim; no stable public demo host was available for a second external run.
- [x] Record the externally verified failure-to-resubmit retry sequence: failed consent attempt followed by a successful synthetic response; the local shim separately covers provider failure handling.

## WooCommerce-like storefront expansion

- [x] Define the local commerce model with catalog, variants, carts, cart lines, orders, order items, addresses, and statuses.
- [x] Add schema and migrations for catalog products, product variants, carts, cart items, orders, and order items.
- [x] Add public local catalog access and admin-safe catalog list/create/status procedures.
- [x] Add local cart add/update/remove/clear behavior with quantity validation and server-side order revalidation; server cart persistence and live stock reservation remain outside this release.
- [x] Build Arabic RTL cart drawer/page with empty state, local persistence, quantity updates, and responsive error-free UI; cart is intentionally synchronous/local.
- [x] Build checkout form with customer/contact/shipping fields and consent copy.
- [x] Create order confirmation flow and user-facing order status lookup without claiming payment success.
- [x] Keep Virtual Try-On linked to the selected product and variant throughout shopping flow.
- [x] Add a clearly scoped first-party admin order-list route; product CRUD remains pending.
- [x] Add tests for totals, checkout validation, local line rules, order input schema, and try-on handoff.
- [x] Run migration, typecheck, Vitest, and responsive/browser verification.
- [x] Document payment gateway and shipping integration requirements before production; current checkout is cash-on-delivery and shipping is a fixed local rule.

- [x] Add persistent local cart context with product/size/quantity lines
- [x] Add Arabic RTL cart drawer/page and checkout form; cart storage is intentionally local and synchronous.
- [x] Persist checkout orders in local database with server-side price validation
- [x] Add order confirmation, customer lookup, and admin order list surface
- [x] Add Vitest coverage for checkout totals and order validation

- [x] Reproduce and fix missing visible add-to-cart and checkout actions in the live preview; verified from product page through cart and checkout.
- [x] Add a persistent Arabic wishlist/favorites flow from cards, product details, header, and `/favorites`.
- [x] Browser-test product size selection, add-to-cart, cart page, checkout validation, order confirmation/lookup, and wishlist persistence; CartDrawer visuals were also captured.

- [x] Browser-test checkout validation failure without consent after the consent fix; the form stayed on checkout and showed the Arabic error without creating an order. Malformed-contact native validation remains a separate check.
- [x] Capture and review an explicitly open CartDrawer state after the latest cart persistence fixes; it showed the saved line, quantity controls, 939 EGP total, and cart action.

- [x] Browser-test malformed email and phone validation in checkout and verify no order is created; invalid phone showed the Arabic error and the network had no new orders.create request.

- [x] Add explicit Egyptian phone-format validation before consent/order mutation.

- [x] Browser-test malformed email separately with a valid Egyptian phone, valid address fields, and consent enabled; the browser kept checkout in place and network logs showed no new orders.create request.
- [x] Native browser email validation was consistent in the browser check, so no duplicate email rule was added.

- [x] Add explicit app-level Arabic email validation and Vitest coverage after browser-native feedback proved insufficient for a deterministic app-level state.
- [x] Re-run malformed-email browser check with confirmed checked consent and verify no orders.create request.

- [x] Add Vitest coverage for valid and malformed customer email values used by checkout and order lookup.

- [x] Deterministically verify the malformed-email browser submit with consent confirmed checked before the click, then verify no orders.create request occurs.
- [x] Add Vitest coverage for the order-lookup email validation path with valid and malformed email cases.

## UI audit and polish pass

- [x] Audit desktop and mobile UI for Home/catalog, product detail, favorites, cart, CartDrawer, checkout, order tracking, admin, and Virtual Try-On surfaces.
- [x] Fix global RTL layout, typography scale, spacing rhythm, header/navigation alignment, and overflow issues.
- [x] Fix product-card and product-detail action layout so Arabic labels do not overlap, clip, or create uneven controls.
- [x] Fix responsive layouts and touch targets at mobile and tablet breakpoints across commerce flows.
- [x] Improve CartDrawer, form, validation, loading, empty, and success states with consistent visual hierarchy and accessibility.
- [x] Run responsive screenshots, keyboard/focus checks, typecheck, Vitest, and browser interaction regression checks after UI changes.
- [x] Review final UI findings and save a new checkpoint for the polished version.

- [x] Run post-polish browser checks for checkout validation, pending/loading submission state, and success confirmation state, then record the results in verification notes.
- [x] Verify keyboard/focus behavior beyond CartDrawer for header links/buttons, checkout fields, consent, submit, and order tracking form, and fix remaining accessibility issues.

- [x] Fix mobile full-page horizontal overflow causing utility pages (favorites, cart, checkout, and tracking) to render mostly off-canvas at 390px.
- [x] Re-run mobile screenshots for every utility route after the overflow fix and document the result.

- [x] Record the post-polish checkout validation/loading/success results in verification-notes.md with observed states and the synthetic test order number.
- [x] Run a fresh keyboard-only checkout audit that explicitly tabs through the consent checkbox and submit button, verify visible focus states, and document/fix remaining issues.
- [x] Re-run and document a keyboard-only order-tracking traversal from inputs through the search button.

- [x] Re-run checkout keyboard-only audit and explicitly capture/document the visible focus state on the consent checkbox itself, then confirm Tab moves to submit with visible focus.

- [x] Save a new webdev checkpoint after the final UI polish changes and verification pass.
- [x] Record the new checkpoint/version ID in verification-notes.md for traceability.


## WooCommerce-like admin expansion

- [x] Audit current product/order schema, admin route, public catalog data, and existing admin components before extending them.
- [x] Add persistent product management for Arabic/English names, slug, descriptions, pricing, compare-at price, SKU, status, featured flag, and catalog metadata.
- [x] Add persistent product variations with size/color attributes, SKU, price override, stock quantity, stock status, and sale availability.
- [x] Add product gallery/media URL management with validation and safe public rendering; do not store binary media in the database.
- [x] Add admin-only CRUD procedures for products, variations, media, categories, and stock/status changes with server-side validation.
- [x] Rebuild the admin area with WooCommerce-like navigation, product list, filters, product editor, variation matrix, stock controls, and order management.
- [x] Connect public catalog/product detail/cart checkout to published products and selected variation stock/price data without breaking current local commerce.
- [x] Add Vitest coverage for admin schemas/procedures, variation pricing/stock rules, product status visibility, and order regression behavior.
- [x] Run migration, typecheck, tests, responsive browser checks, and save a new checkpoint with all todo items complete.
- [x] إصلاح وتحقيق public catalog procedures مع fallback آمن أثناء ترحيل المنتجات
- [x] ربط صفحات Home وProductDetails بمنتجات قاعدة البيانات المنشورة
- [x] تطبيق sale price وstock status على cart والـ checkout
- [x] مراجعة admin editor والـ variations والـ media بصريًا على desktop/mobile
- [x] Wire CartContext/CartDrawer/Cart/Checkout to a DB-backed catalog source for sale prices and availability
- [x] Store selected variation identity or resolved variant pricing in cart lines and enforce stock through checkout
- [x] Add Vitest coverage for published-only catalog visibility, variation pricing/stock checkout rules, and admin authorization regression
- [x] كتابة/تحديث Vitest لدمج catalog والـ pricing والـ stock
- [x] تنفيذ final responsive/accessibility audit وتوثيق النتائج

## Production hardening pass — 2026-08-24

- [x] Diagnose dashboard product counts and database/source-of-truth mismatches.
- [x] Define WooCommerce-like admin information architecture for products, attributes, variations, inventory, orders, and settings.
- [x] Add reusable color and size attribute management connected to product variations.
- [x] Rework the admin dashboard and product editor to match the requested WooCommerce-style workflow while preserving the independent React/tRPC architecture.
- [x] Verify public storefront mapping for attributes, variation selection, sale pricing, inventory, and order status.
- [x] Audit and improve the visual system across storefront, dashboard, and mobile breakpoints.
- [x] Verify and harden auth, product CRUD, variations, inventory, cart, checkout, orders, and account flows.
- [x] Add production regression tests for dashboard data, catalog queries, stock/pricing, and critical commerce journeys.
- [x] Run final responsive/accessibility/console-error checks and publish a stable checkpoint.


## Virtual Try-On flow refinement — 2026-08-25

- [x] Add a per-product Virtual Try-On entry that carries the selected product automatically.
- [x] Hide the product selector when a product context is present and keep manual selection only for the standalone try-on route.
- [x] Make the generated try-on result open in an accessible image viewer/lightbox on click, with close and keyboard support while retaining optional download.
- [x] Verify product-to-try-on handoff, result viewer behavior, responsive layout, privacy copy, typecheck, and Vitest coverage.

## Full e-commerce catalog expansion — 2026-08-25

- [x] Audit storefront navigation, catalog data facets, utility pages, and current responsive gaps.
- [x] Build a standalone Arabic `/products` catalog page with search, sorting, and filters for category, size, color, availability, and price range.
- [x] Extend public catalog data with usable category and variant facets without exposing draft products.
- [x] Update shared storefront navigation and product CTAs to connect the new catalog, detail, try-on, wishlist, cart, account, tracking, and checkout journeys.
- [x] Polish all storefront routes for RTL responsive behavior, empty/loading/error states, accessibility, and conversion-oriented UI.
- [x] Add tests for product filtering/sorting and regression-check core commerce routes on desktop and mobile.

## Brand assets and product media expansion — 2026-08-25

- [x] Store and serve the provided brand logo assets through project-managed static storage.
- [x] Extend product media metadata for front image, back image, gallery image, and optional 3D asset URL/type.
- [x] Update admin product media controls and validation for images plus GLB/GLTF 3D model URLs.
- [x] Update storefront header, product gallery, and product details to use the provided brand identity and distinguish front/back/3D media.
- [x] Verify responsive gallery behavior, 3D fallback messaging, typecheck, Vitest, and final UI screenshots.

## Store header and page-navigation repair — 2026-08-25

- [x] Audit header density and conflicting page metadata on product, catalog, utility, and mobile routes.
- [x] Rebuild the shared storefront header with a clear logo, compact primary navigation, independent utility icons, and no page-specific metadata in the top bar.
- [x] Move product/page context into responsive breadcrumbs and local page headers.
- [x] Verify visual spacing, keyboard navigation, desktop/mobile responsiveness, typecheck, and Vitest before publishing.

## E-commerce creator production roadmap — 2026-08-25

- [x] Audit the current clothing-store journey against production-ready catalog, product, checkout, shipping, returns, and trust requirements; recorded launch-readiness evidence and P0/P1 priorities in `docs/marj-launch-readiness.md`.
- [x] Define the fact-based product data required for each SKU: materials, fit, care, size chart, shipping class, return eligibility, SEO, front/back/3D assets, and inventory by variant; added `docs/marj-sku-intake-template.md`.
- [x] Add or prioritize missing customer-facing utility pages and policy content only after the store's actual shipping and returns facts are provided; the existing policy page is settings-driven and the document prioritizes factual completion before launch.
- [x] Prepare a launch measurement plan for product views, filter/search use, variant selection, add-to-cart, checkout start, purchase, stockouts, and returns; no analytics provider or customer tracking has been enabled yet.

## Marj brand and operating settings — 2026-08-25

- [x] Rebrand storefront and administration from HoodieFit to مرج with a sea-and-wave visual system and provided wave mark.
- [x] Add persistent editable store settings for Egypt-wide shipping, return/exchange policy, and payment-method disclosure.
- [x] Build a WooCommerce-like admin settings page for those operating policies without pretending that an unconfigured payment gateway is live.
- [x] Render the configured shipping, returns, and payment disclosures in the storefront checkout and relevant customer pages.
- [x] Verify brand, responsive UI, settings authorization, front/back media workflow, typecheck, and Vitest before publishing.

## Admin dashboard operating UX — 2026-08-25

- [x] Audit the current admin overview, products, orders, settings, data freshness, and mobile behavior against daily store-operator decisions.
- [x] Define a decision-first overview with only live, supportable operational KPIs and action queues; label unavailable metrics rather than fabricating them.
- [x] Improve dashboard navigation, overview hierarchy, and operational alerts using the existing catalog/order/settings data sources.
- [x] Add regression coverage for any derived admin metrics or status grouping introduced by the dashboard update.
- [x] Verify admin authorization, desktop/mobile rendering, TypeScript, and Vitest before publishing.

## Marj header logo refinement — 2026-08-25

- [x] Audit the current header logo composition and remove conflicting marks or text that reduce recognition of مرج.
- [x] Implement a clean, balanced Marj logo treatment for desktop and mobile using the provided brand asset.
- [x] Verify the header logo visually at desktop/mobile, run checks, and publish the correction.

## Admin layout and select visibility repair — 2026-08-25

- [x] Diagnose the desktop sidebar/content overlap and the hidden text in admin select controls using the reported views.
- [x] Repair the dashboard layout containment, sidebar behavior, and select/option contrast without reducing accessible labels.
- [x] Verify orders/products/settings at desktop and mobile, run checks, and publish the fix.

## Full Marj UI/UX audit — 2026-08-25

- [x] Audit the complete customer and admin route inventory across desktop/mobile, documenting evidence for clarity, navigation, forms, states, RTL, and accessibility.
- [x] Prioritize UI/UX issues by user impact and implement the highest-confidence fixes without inventing product or operational facts.
- [x] Validate storefront and dashboard responsiveness, keyboard/visible-focus behavior, errors/empty states, TypeScript, and Vitest before publishing.

## Shipping, analytics, and payment operations — 2026-08-25

- [x] Add editable shipping zones for Egyptian governorates with per-governorate fees and optional delivery notes.
- [x] Add an admin payment-methods tab that supports COD and manual wallet/transfer instructions while clearly separating unconfigured online-card integrations.
- [x] Add an analytics tab using only persisted catalog and order data, with source definitions and explicit blocked metrics where events or payment sources are absent.
- [x] Apply the selected governorate shipping fee to the customer checkout and server-authoritative order total.
- [x] Add validation and regression tests, verify desktop/mobile admin and checkout behavior, and publish after successful checks.

## Narrow mobile header cart visibility — 2026-08-25

- [x] Diagnose the 290px header overflow that hides the cart control.
- [x] Adjust the mobile header grid, spacing, and action control sizing so account, favorites, and cart remain visible and usable.
- [x] Verify 290px/390px/desktop header rendering, run checks, and publish the correction.

## Header typography readability — 2026-08-25

- [x] Audit current header wordmark and navigation typography at narrow/mobile and desktop widths.
- [x] Increase header typography and adjust spacing without hiding account, favorites, cart, or navigation controls.
- [x] Verify mobile/desktop header rendering, run checks, and publish the readability improvement.

## Cart icon and checkout CTA clarity — 2026-08-25

- [x] Diagnose why the cart glyph remains visually absent and why the checkout link lacks primary-action prominence.
- [x] Make the cart glyph/indicator visibly distinct and implement a high-contrast, explicit checkout CTA in the cart summary.
- [x] Verify desktop/mobile header and cart rendering, run checks, and publish the correction.

## Comprehensive UI repair pass — 2026-08-25

- [x] Audit every customer and admin route at narrow mobile, common mobile, tablet, and desktop widths; record visual, interaction, RTL, accessibility, and content-hierarchy defects in `docs/comprehensive-ui-repair-audit.md`.
- [x] Establish a consistent responsive header, typography, spacing, card, form, and CTA system and prioritize defects by customer/owner impact.
- [x] Implement and regression-test high-impact corrections across storefront, cart/checkout, product pages, and the admin dashboard.
- [x] Re-verify responsive rendering and interactive states, run TypeScript/Vitest, and publish only after documented checks pass; a final owner-side cart interaction is recommended because no test order was created.

## Arabic / English localization and direction — 2026-08-25

- [x] Inventory customer and admin text, labels, statuses, placeholders, errors, policy content, and mixed-script values; define source/translation ownership and direction rules in `docs/localization-and-direction-audit.md`.
- [x] Add a persisted Arabic/English language control and application-level RTL/LTR direction provider.
- [x] Translate customer routes and admin operations without changing factual product data, payment/shipping configuration, or persisted records; newly authored operating content remains in its owner-supplied language until an English version is added.
- [x] Audit navigation, cards, forms, tables, icons, currencies, emails, phone numbers, dates, and focus order in both RTL and LTR at mobile and desktop widths.
- [x] Add localization regression tests, run TypeScript/Vitest, document verification, and publish only after successful checks.

## Mobile navigation and responsive refinement — 2026-08-25

- [x] Audit storefront mobile journeys and determine the bottom-navigation destinations, active states, safe-area rules, and interaction hierarchy in `docs/mobile-navigation-audit.md`.
- [x] Add a localized mobile-only bottom navigation for primary customer journeys without duplicating admin navigation or obscuring checkout actions.
- [x] Refine narrow mobile spacing, typography, touch targets, cards, forms, and bottom clearance on high-traffic storefront pages.
- [x] Verify Arabic RTL and English LTR mobile layouts plus desktop non-regression, run TypeScript/Vitest, and publish only after documented checks pass.

## Customer purchase journey audit — 2026-08-25
- [x] Map the buyer journey from catalog/product selection through cart, shipping governorate, payment selection, validation, and order confirmation; document facts required before submission.
- [x] Test product variation selection, add-to-cart feedback, cart persistence, mobile CTA visibility, and checkout navigation without creating a production order.
- [x] Test checkout validation, governorate shipping calculation, enabled payment methods, and server-side rejection paths using non-submitting checks.
- [x] Fix customer-facing conversion blockers and re-verify the complete safe path on mobile and desktop.
- [x] Run TypeScript/Vitest, document evidence and remaining launch requirements, then publish only after checks pass.

## 3D product model upload and rendering repair — 2026-08-25
- [x] Audit the product editor media workflow and the storefront model viewer against an invalid page URL entered as a 3D model.
- [x] Make the 3D input explicitly accept an uploaded or direct GLB/GLTF model file, prevent page URLs, and explain the required asset format.
- [x] Prevent product or viewer pages from being saved as the primary product image, and direct 3D assets to the dedicated media manager.
- [x] Verify validation, persisted model media, browser rendering/fallback, TypeScript, and Vitest before publishing.

## WhatsApp manual-payment receipt handoff — 2026-08-25
- [x] Add an admin-managed WhatsApp destination for each manual wallet/transfer payment method, with normalized Egyptian phone validation.
- [x] Show the handoff only after a submitted manual-payment order, with a prefilled order-summary message and explicit receipt-screenshot instructions.
- [x] Preserve customer privacy by not uploading or storing the screenshot in the store; leave the WhatsApp attachment and final send under customer control.
- [x] Add validation/tests and verify the mobile/desktop confirmation experience before publishing.

## WhatsApp order-status handoff — 2026-08-25
- [x] Define truthful Arabic customer messages for each order status and prevent an automatic send without a connected WhatsApp Business provider.
- [x] After an admin changes status, expose an explicit WhatsApp action with the customer number and a prefilled status message.
- [x] Test status-message formatting, Egyptian phone normalization, status update behavior, and responsive admin controls before publishing.
- [x] Configure the owner-provided WhatsApp destination (+201555627461) for the existing manual transfer methods without enabling or sending customer messages automatically.

## English localization completion audit — 2026-08-25
- [x] Inventory Arabic characters and untranslated UI strings across storefront, product pages, checkout, account, tracking, policies, try-on, and administration when `?lang=en` is active.
- [x] Replace remaining fixed Arabic copy with explicit English equivalents and expand localization coverage without translating owner-entered operational content.
- [x] Verify desktop and mobile LTR layouts across all customer pages and available admin pages, then run TypeScript/Vitest before publishing.

## Store team users and invitations — 2026-08-25
- [x] Audit existing user roles and create a least-privilege role model for order operations, catalog management, analytics viewing, and full store management.
- [x] Add secure, expiring invitation records and server-side acceptance/revocation flows without exposing admin credentials.
- [x] Build an owner-only team dashboard to create, copy, revoke, and review invitations plus active staff access.
- [x] Gate each dashboard route and mutation by role, test invitation acceptance and blocked privilege escalation, then verify responsive UI before publishing.

## Growth, retention, and operations suite — 2026-08-25
- [x] Add owner-managed coupons with fixed/percentage discounts, validity, minimum cart, usage limits, and server-authoritative checkout validation.
- [x] Add authentic customer reviews only for delivered-order items, with moderation and no seeded ratings or testimonial content.
- [x] Add advanced variant-stock operations: low-stock threshold, safety-stock indicator, adjustment history, and operational alerts without automatic price or stock changes.
- [x] Add shipment tracking reference and carrier URL per order, surfaced in customer tracking and the order dashboard.
- [x] Add account-backed wishlist and a points-based loyalty ledger that awards only after delivery, with transparent balance and redemption rules.
- [x] Add owner-managed Lookbook entries, technical SEO metadata/structured data, and first-party commerce event capture with an honest analytics dashboard.
- [x] Build responsive customer and admin UIs, run migration/tests/browser checks, document limitations, and publish only after verification.

### Growth implementation progress — 2026-08-25
- [x] Add growth tables and apply migrations `0010` plus `0011` for coupons, verified reviews, wishlist, loyalty, inventory adjustments, Lookbook, events, shipment fields, and variation safety stock.
- [x] Add server-authoritative coupon preview and order-time pricing, including coupon discounts and valid loyalty-point redemption requests.
- [x] Add a responsive owner-only Growth & operations workspace for coupon creation/toggling, review moderation, logged inventory adjustments, and owner-provided Lookbook publishing.
- [x] Add manual shipment carrier, tracking number, and optional carrier URL controls to order management; expose saved tracking details in customer order lookup.
- [x] Add an authenticated loyalty balance to Account and an optional loyalty redemption control to checkout; award delivery points once only on a delivered order.
- [x] Add a public Lookbook route and honest empty state; no images, customer stories, ratings, tracking numbers, or operational data were fabricated.
- [x] Verify the new admin and Lookbook layouts at 1280px and 390px, run TypeScript, and run 26 Vitest files / 66 tests.
- [x] Add product-page review submission, account wishlist synchronization, first-party product/add-to-cart/checkout event capture, and factual JSON-LD metadata for DB-backed products.

## Team invitation duration extension — 2026-08-25
- [x] Add 30-day invitation expiry option to the owner team dashboard and server validation.
- [x] Add unlimited invitation duration option with explicit nullable expiry handling, while preserving one-time token use and revocation.
- [x] Add English/Arabic labels, tests, responsive verification, and publish the team-duration change.

### Team invitation duration implementation progress — 2026-08-25
- [x] Confirm current invitation schema, router input, database helper, UI options, and expiry checks before editing.
- [x] Verify 30-day and unlimited invitations cannot bypass token hashing, single-use, revocation, or role restrictions.
- [x] Run TypeScript/Vitest and browser verification, then save a checkpoint.

### Growth implementation progress — 2026-08-25
- [x] Add product-page review submission, account wishlist synchronization, first-party product/add-to-cart/checkout event capture, and factual JSON-LD metadata for DB-backed products.

### Team invitation duration extension — implementation history
- [x] Replace the pending duration items above with completed entries only after code and tests pass.

### Growth implementation progress — 2026-08-25
- [x] Add product-page review submission, account wishlist synchronization, first-party product/add-to-cart/checkout event capture, and factual JSON-LD metadata for DB-backed products.

### Team invitation duration extension — owner request
- [x] Add 30-day invitation duration.
- [x] Add unlimited invitation duration.


## Comprehensive technical and user QA — 2026-08-25
- [ ] Run static/type/build checks and the complete automated test suite.
- [ ] Test database schema/migrations, server procedures, validation, authorization, invitation expiry, checkout totals, stock, coupons, reviews, wishlist, loyalty, tracking, Lookbook, and analytics invariants.
- [ ] Test unauthenticated user, authenticated customer, owner, each least-privilege team role, revoked/expired/accepted invite, and forbidden access paths.
- [ ] Test customer journeys: browse, filters, product details, gallery/3D, try-on, wishlist, cart, checkout/COD/manual transfer, order confirmation, tracking, review submission, loyalty, Lookbook, Arabic/English, RTL/LTR.
- [ ] Test negative, boundary, duplicate, stale-data, network/error, accessibility, responsive, console, and security cases without fabricating operational data.
- [ ] Fix confirmed defects, rerun impacted tests, document limitations and evidence, then save a QA checkpoint only if the release remains stable.


## Product creation editor parity fix — 2026-08-25
- [x] Compare the new-product and edit-product render paths and identify why image/media, variations, safety stock, and operational fields are missing during creation.
- [x] Make the new-product flow expose the same complete media and variation controls as edit-product, while preserving create validation and draft state.
- [x] Verify create/edit behavior, image/GLB validation, variation add/remove, Arabic/English labels, desktop and 390px responsive layouts, TypeScript, and Vitest; document and publish the fix.


## GitHub repository export — 2026-08-25
- [x] Audit the selected GitHub repository and current project diff before export.
- [x] Prepare complete project documentation covering architecture, features, migrations, testing, deployment, integrations, limitations, and operational setup.
- [x] Verify secrets, environment files, generated artifacts, local logs, and sensitive data are excluded while source code and required migrations/docs remain included.
- [x] Commit and push the complete site project to `aliabdelazim7/Marj-Site`, then verify the remote tree and commit contents.
- [x] Record the repository URL and export details in project documentation and deliver them to the owner.


## Detailed handoff documentation — 2026-08-30
- [x] Write a clear Arabic-first technical handoff covering project goal, scope, current state, architecture, routes, database, auth, integrations, privacy, testing, and deployment.
- [x] Document every intentional limitation, deferred item, operational prerequisite, and prohibited behavior so the next team does not fabricate data or re-enable excluded integrations accidentally.
- [x] Add a prioritized continuation plan with file locations, migration rules, QA gates, rollback guidance, and a first-session checklist.
- [x] Copy the handoff into the GitHub repository, validate the document against the current source and tests, commit, push, and record the final link.
