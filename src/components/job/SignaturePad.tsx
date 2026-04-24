"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string | null;
  onChange: (v: string | null) => void;
  label?: string;
}

export function SignaturePad({ value, onChange, label = "Sign here" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(!!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#f9fafb";

    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
  }, [value]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    setDrawing(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing) return;
    setDrawing(false);
    setHasInk(true);
    const canvas = canvasRef.current!;
    onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{label}</p>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-muted hover:text-foreground"
        >
          Clear
        </button>
      </div>
      <div className="relative mt-2 aspect-[4/1.5] w-full overflow-hidden rounded-xl border border-border-strong bg-surface-2">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="absolute inset-0 h-full w-full touch-none"
          aria-label="Signature pad"
        />
        {!hasInk ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-strong">
            Sign with your finger
          </div>
        ) : null}
      </div>
    </div>
  );
}
