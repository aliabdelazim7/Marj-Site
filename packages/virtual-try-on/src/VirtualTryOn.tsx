import { useRef, useState } from "react";
import type { TryOnEndpoint, TryOnProduct, TryOnResponse, TryOnStatus } from "./types";
import "./virtual-try-on.css";

type Props = {
  product: TryOnProduct;
  generate: TryOnEndpoint;
  maxFileBytes?: number;
  className?: string;
};

const ACCEPTED = "image/jpeg,image/png,image/webp";
const DEFAULT_MAX_BYTES = 6 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image"));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid image"));
    reader.readAsDataURL(file);
  });
}

export default function VirtualTryOn({ product, generate, maxFileBytes = DEFAULT_MAX_BYTES, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<TryOnResponse | null>(null);
  const [status, setStatus] = useState<TryOnStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const chooseFile = async (file?: File) => {
    setError(null);
    setResult(null);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Choose a JPEG, PNG, or WebP image.");
    if (file.size > maxFileBytes) return setError(`Choose an image smaller than ${Math.round(maxFileBytes / 1024 / 1024)}MB.`);
    setStatus("reading");
    try {
      setPhotoDataUrl(await readAsDataUrl(file));
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("The image could not be read. Please choose another file.");
    }
  };

  const run = async () => {
    if (!photoDataUrl || !consent) return;
    setStatus("generating");
    setError(null);
    try {
      const generated = await generate({ productId: product.id, photoDataUrl, consent: true });
      setResult(generated);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Virtual Try-On is temporarily unavailable. Please try again.");
    }
  };

  const busy = status === "reading" || status === "generating";
  return (
    <section className={`vto-card ${className}`} aria-labelledby="vto-title">
      <div className="vto-heading">
        <div><p className="vto-eyebrow">VIRTUAL TRY-ON</p><h2 id="vto-title">See {product.name} on you</h2><p>Upload one photo and preview this selected hoodie. The original photo is used for this request and is not stored by this component.</p></div>
        {product.imageUrl && <img className="vto-product-image" src={product.imageUrl} alt={product.name} />}
      </div>
      <input ref={inputRef} className="vto-visually-hidden" type="file" accept={ACCEPTED} onChange={(event) => void chooseFile(event.target.files?.[0])} />
      <button type="button" className="vto-upload" onClick={() => inputRef.current?.click()} disabled={busy}>
        {photoDataUrl ? "Choose a different photo" : "Upload your photo"}
      </button>
      {photoDataUrl && <img className="vto-input-preview" src={photoDataUrl} alt="Selected preview" />}
      <label className="vto-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} /> <span>I agree to send this photo to the image-generation service for this preview.</span></label>
      <button type="button" className="vto-primary" onClick={() => void run()} disabled={!photoDataUrl || !consent || busy}>{status === "generating" ? "Creating preview…" : "Try it on"}</button>
      {status === "reading" && <p className="vto-status" role="status">Reading image…</p>}
      {status === "generating" && <p className="vto-status" role="status">Creating your preview. This may take a moment.</p>}
      {error && <p className="vto-error" role="alert">{error}</p>}
      {result && <div className="vto-result" role="status"><a href={result.url} target="_blank" rel="noreferrer"><img src={result.url} alt={`${product.name} virtual try-on result`} /></a><p>Tap the image to open it in a larger view.</p><a className="vto-download" href={result.url} target="_blank" rel="noreferrer">Open result</a><button type="button" className="vto-reset" onClick={() => { setResult(null); setPhotoDataUrl(null); setConsent(false); setStatus("idle"); }}>Try another photo</button></div>}
    </section>
  );
}
