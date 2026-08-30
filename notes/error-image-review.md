# Error image review

The supplied screenshot is 814×160 px with a 5.0875:1 landscape ratio, so it was reviewed as two ordered horizontal tiles. The visible UI confirms the consent checkbox is checked, the primary action says "جرّب مرة أخرى", and the error copy reads: "حصلت مشكلة مؤقتة أثناء التوليد. جرّب مرة ثانية بعد لحظات." The screenshot does not expose the server-side root cause, so implementation should add clearer error logging/normalization and retain a useful retry state.

## Product detail visual review

Mobile preview verified the independent `/product/signal-red-hoodie` route, Arabic RTL details, real product photo, availability badge, and two gallery thumbnails. The home preview verified the editorial hero now uses a real product image instead of the CSS-only garment illustration.

## Follow-up diagnosis

The repeated request reached `/api/trpc/tryOn.generate`, but the gateway returned an HTML 403 response. The browser then reported `Unexpected token '<'` because tRPC expected JSON. The request body contained the full browser Data URL, so the client now decodes and recompresses every accepted image to JPEG at a maximum dimension of 1600px before sending it. The server also normalizes the Data URL and logs the underlying image-service failure without exposing raw infrastructure details to the visitor.

## Verification result

After the fix, TypeScript passed and all six Vitest suites passed (12 tests). The integration-style caller test confirms the normalized JPEG payload reaches the mocked image-generation contract and returns a result URL. A real browser run with a user photo is still recommended because the original 403 came from the gateway and cannot be reproduced from the supplied error screenshot alone.
