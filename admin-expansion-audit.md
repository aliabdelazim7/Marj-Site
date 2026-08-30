# HoodieFit WooCommerce-like Admin Audit

## Current state

The project already contains `catalogProducts`, `productVariants`, `orders`, and `orderItems` tables. The product table currently stores only slug, English/Arabic names, one description, one base price, one image URL, status, and timestamps. Variants currently store product ID, SKU, size, stock, optional price override, and active/inactive status.

The existing admin surface is an orders-only page backed by a protected `adminList` procedure. A minimal catalog list/create/status API exists, but there is no product editor, variation editor, media gallery management, category model, inventory controls, filters, pagination, or product-to-admin navigation.

The public catalog still reads from the static `shared/products.ts` model. Cart lines store product ID, size, and quantity; they do not yet retain a variation ID. Therefore the implementation must preserve the current public flow while introducing a database-backed admin catalog and a compatibility layer before making published products the public source of truth.

## Planned admin scope

The WooCommerce-like release will provide an admin dashboard with a sidebar and summary cards, product listing and filters, create/edit product form, Arabic and English content, slug and catalog status, regular/sale pricing, SKU, featured flag, gallery URL entries, categories, and a variation matrix. Each variation will support size/color attributes, SKU, stock quantity, active status, and optional price override. Admin-only procedures will validate every mutation and enforce the existing `user.role === admin` boundary.

The public storefront will consume only published products and active variations once the compatibility layer is ready. Stock and price checks will be applied when adding to cart and creating an order. Existing order snapshots will remain immutable so historical orders do not change when catalog data is edited.

## Explicit non-goals for this release

Binary product media will not be stored in MySQL; the database will store validated public or S3-backed URLs only. No fabricated reviews, ratings, testimonials, or customer-generated content will be added. Payment gateways, shipping-rate automation, coupons, taxes, and advanced WooCommerce extensions remain separate follow-up work unless they are already supported by the current local commerce model.
