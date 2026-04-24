"use client";

import { useRef, useState } from "react";

export interface CapturedPhoto {
  dataUrl: string;
  capturedAt: string;
}

interface Props {
  label: string;
  required?: boolean;
  value: CapturedPhoto | null;
  onChange: (p: CapturedPhoto | null) => void;
  hint?: string;
}

async function downsizeToJpeg(file: File, maxEdge = 2048, quality = 0.85): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function PhotoCapture({
  label,
  required,
  value,
  onChange,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const capturedAt = new Date().toISOString();
      const dataUrl = await downsizeToJpeg(file);
      onChange({ dataUrl, capturedAt });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {label}
          {required ? <span className="ml-1 text-accent">*</span> : null}
        </p>
        {value ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-accent"
          >
            Retake
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />

      {value ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-border">
          <img
            src={value.dataUrl}
            alt={label}
            className="block w-full object-cover"
            style={{ aspectRatio: "4 / 3" }}
          />
          <div className="flex items-center justify-between border-t border-border bg-surface-2 px-3 py-2 text-[11px] text-muted">
            <span>Captured {new Date(value.capturedAt).toLocaleString()}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-danger"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface py-8 text-sm font-semibold text-muted hover:text-foreground"
        >
          <span className="text-2xl">📷</span>
          {busy ? "Processing…" : "Take photo"}
          <span className="text-[11px] text-muted-strong">
            Camera opens; file fallback available
          </span>
        </button>
      )}
    </div>
  );
}
