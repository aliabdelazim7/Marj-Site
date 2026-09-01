# Standalone Virtual Try-On

هذه حزمة مستقلة من ميزة Virtual Try-On المستخدمة في مرج. الحزمة تتكون من React component للواجهة وExpress-compatible handler للخادم وManus Forge adapter اختياري. هي لا تعتمد على `@/` aliases أو Drizzle أو tRPC أو ملفات مرج الداخلية.

## ماذا تفعل؟

يختار العميل منتجًا محددًا، يرفع صورة JPEG أو PNG أو WebP، يوافق صراحة على إرسال الصورة إلى image-generation service، ثم يطلب preview يستبدل upper garment بالهودي المختار. النتيجة تظهر داخل الصفحة ويمكن فتحها في نافذة أكبر. المكوّن لا يفرض تنزيل النتيجة.

الصورة الأصلية تُرسل إلى الخادم/provider أثناء الطلب. المكوّن نفسه لا يحفظها في localStorage أو database. يجب على المشروع المستضيف مراجعة retention وprivacy policy الخاصة بالـprovider، وعدم تسجيل request body أو الصورة في logs.

## محتويات الحزمة

| الملف | الوظيفة |
| --- | --- |
| `src/VirtualTryOn.tsx` | React UI كاملة للرفع، consent، preview، loading، error، result، retry |
| `src/types.ts` | Types وendpoint contract |
| `src/virtual-try-on.css` | CSS مستقل responsive بدون اعتماد على Tailwind أو design system |
| `server/tryOnValidation.ts` | Zod validation وdata URL parsing |
| `server/tryOnHandler.ts` | Express-compatible endpoint handler وprompt builder |
| `server/manusForgeAdapter.ts` | Adapter اختياري لـManus Forge ImageService مع upload callback |
| `.env.example` | أسماء environment variables فقط |

## المتطلبات

تحتاج الواجهة إلى React 18 أو 19. يحتاج الخادم إلى Node.js 18+ لأن adapter يستخدم `fetch` و`Buffer`. تحتاج الخوادم إلى `zod`. إذا لم يكن المشروع يستخدم Zod، يمكن استبدال `tryOnInputSchema` بvalidator مكافئ، لكن يجب الحفاظ على نفس الحدود.

ستحتاج إلى image-generation provider. adapter المرفق يعمل مع Manus Forge عندما تتوفر `BUILT_IN_FORGE_API_URL` و`BUILT_IN_FORGE_API_KEY`. يمكنك بدلًا من ذلك كتابة `generateImage` function ترسل إلى provider آخر وتعيد `{ url: string }` بعد حفظ الصورة الناتجة في object storage.

## تشغيل الواجهة

انسخ `src/VirtualTryOn.tsx` و`src/types.ts` و`src/virtual-try-on.css` إلى مشروع React، ثم استخدم المكوّن:

```tsx
import VirtualTryOn from "./VirtualTryOn";
import type { TryOnEndpoint } from "./types";

const generate: TryOnEndpoint = async (input) => {
  const response = await fetch("/api/virtual-try-on", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Try-On request failed");
  return response.json();
};

export function ProductTryOn({ product }: { product: { id: string; name: string; imageUrl?: string } }) {
  return <VirtualTryOn product={product} generate={generate} />;
}
```

مرر `product.id` من المنتج الحالي، وليس product title أو user input غير موثوق. استخدم direct product image اختيارية للعرض فقط. المكوّن يقبل JPEG/PNG/WebP حتى 6MB افتراضيًا، بينما validation الخادم يسمح data URL حتى 8.5MB كنص base64. يمكن تغيير حد الواجهة عبر `maxFileBytes`، لكن لا ترفع حد الخادم بلا سبب.

## تركيب Express

يمكنك تركيب handler هكذا:

```ts
import express from "express";
import { createTryOnHandler } from "./server/tryOnHandler";
import { createManusForgeGenerator } from "./server/manusForgeAdapter";

const app = express();
app.use(express.json({ limit: "10mb" }));

const generateImage = createManusForgeGenerator({
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL!,
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY!,
  uploadGeneratedImage: async ({ bytes, mimeType, key }) => {
    // Replace with your S3/R2/storage helper. Never store the input photo here.
    const url = await uploadToObjectStorage(key, bytes, mimeType);
    return { url };
  },
});

app.post("/api/virtual-try-on", createTryOnHandler({
  resolveProduct: async (productId) => {
    const product = await db.products.findPublishedByIdOrSlug(productId);
    return product ? { id: String(product.id), name: product.name, color: product.color, description: product.description } : null;
  },
  generateImage,
}));
```

`uploadToObjectStorage` في المثال placeholder متعمد؛ اربطه بـS3/R2/Cloud Storage الخاص بالمشروع. لا تضع provider key في React أو أي code يصل إلى browser. لا تسجل `photoDataUrl` أو provider response في console أو request logs.

## تركيب Manus Forge بدون Express wrapper

إذا كان مشروعك يملك router مختلفًا، أعد استخدام `createManusForgeGenerator` داخل procedure أو controller خاص بك. المطلوب من resolver هو إعادة منتج منشور فقط، والمطلوب من generator هو إعادة URL عام أو signed URL صالح لعرض النتيجة. لا تعتمد على static fallback product في production إذا كان catalog database هو مصدر الحقيقة.

## Contract

يقبل endpoint:

```json
{
  "productId": "signal-red-hoodie",
  "photoDataUrl": "data:image/jpeg;base64,...",
  "consent": true
}
```

ويعيد عند النجاح:

```json
{
  "url": "https://storage.example.com/virtual-try-on/result.png",
  "productId": "signal-red-hoodie",
  "productName": "Signal Red"
}
```

حالات HTTP المقترحة هي `400` للمدخلات غير الصالحة، `404` إذا لم يكن المنتج منشورًا أو موجودًا، و`502` عند فشل provider. رسالة `502` يجب أن تكون user-safe ولا تكشف API key أو stack trace أو provider payload.

## Privacy وSecurity checklist

يجب أن يكون consent صريحًا قبل الإرسال، ويجب رفض `consent !== true` في الخادم وليس في الواجهة فقط. اسمح فقط بأنواع الصور المطلوبة، وضع حدًا للحجم، واستخدم rate limiting أو authentication حسب طبيعة المشروع. امنع data URL غير المدعوم ولا تقبل URL خارجيًا لصورة العميل إذا لم تكن تحتاجه.

لا تحفظ صورة العميل الأصلية في database أو localStorage أو analytics. لا تضعها في error message أو logs. احذف temporary buffers بعد انتهاء الطلب حسب runtime. راجع provider retention وDPA قبل الاستخدام التجاري، لأن عدم حفظها في تطبيقك لا يعني أن provider لا يحتفظ بها.

تحقق من أن `productId` يطابق product منشورًا من database، ولا تسمح للعميل بإرسال prompt كامل أو product description غير محدود. الـprompt يبنى في الخادم لتقليل prompt injection وتغيير هوية المنتج.

## ما لا توفره الحزمة

هذه الحزمة لا توفر image provider account، ولا storage bucket، ولا database product resolver، ولا authentication، ولا billing، ولا moderation، ولا guaranteed identity preservation. جودة النتيجة تعتمد على provider والصورة والمدخلات. الميزة ليست قياسًا دقيقًا للمقاس وليست ضمانًا لملاءمة المنتج.

لا توجد automatic WhatsApp messages أو payment integration أو customer review logic ضمن هذه الحزمة. هي Try-On فقط.

## الدمج مع صفحة المنتج

من الأفضل فتح المكوّن بمنتج محدد من Product Details، مثل:

```tsx
<VirtualTryOn
  product={{ id: product.slug, name: product.name, imageUrl: product.images[0] }}
  generate={generate}
/>
```

لا تستخدم dropdown لاختيار المنتج إذا كان CTA صادرًا من صفحة منتج محددة؛ مرر المنتج تلقائيًا. إذا كان هناك Try-On studio عام، أنشئ product picker منفصلًا ومرر product ID بعد التحقق من الخادم.

## الاختبار قبل الإنتاج

اختبر صورة صحيحة لكل من JPEG وPNG وWebP، وصورة أكبر من الحد، type غير صورة، data URL ناقص، consent false، product غير موجود، product draft، provider timeout، provider response بلا image، storage upload failure، double-click، retry بعد الفشل، refresh، mobile 390px، keyboard focus، screen reader labels، وفتح النتيجة في tab جديد.

يجب أن تتأكد من عدم ظهور الصورة الأصلية في database أو analytics أو logs، وأن الـAPI key غير موجود في browser bundle، وأن الـendpoint لا يسمح بإرسال prompt أو product facts من العميل. لا تستخدم صور أشخاص حقيقيين في automated tests إلا بموافقة واضحة؛ استخدم fixture آمنة لا تكشف هوية.

## نقل الحزمة إلى مشروع آخر

1. انسخ ملفات `src/` إلى مجلد feature في مشروع React.
2. انسخ ملفات `server/` إلى backend أو حوّل handler إلى framework route مناسب.
3. اربط `resolveProduct` بجدول المنتجات المنشورة في مشروعك.
4. اربط `uploadGeneratedImage` بـS3/R2 أو storage آخر، واحفظ الناتج فقط وفق retention policy.
5. ضع environment variables في secret manager، وليس في Git.
6. أضف route `/api/virtual-try-on` ومرر endpoint للـcomponent.
7. أضف tests وحماية rate limit وmonitoring قبل فتح الميزة للجمهور.
8. راجع privacy copy وprovider terms قبل الإنتاج.
