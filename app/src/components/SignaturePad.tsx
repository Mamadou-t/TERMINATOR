import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';

interface SignaturePadProps {
  /** Signature existante (data URL base64) à afficher en lecture seule. */
  value?: string;
  /** Appelée avec le data URL PNG quand l'utilisateur valide, ou '' quand il efface. */
  onChange: (dataUrl: string) => void;
  height?: number;
}

/**
 * Zone de signature manuscrite : l'utilisateur trace à la souris ou au doigt,
 * la signature est enregistrée comme image PNG (data URL base64). Composant
 * maison, sans librairie externe.
 */
export function SignaturePad({ value, onChange, height = 160 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const [isEditing, setIsEditing] = useState(!value);

  const getContext = () => canvasRef.current?.getContext('2d') ?? null;

  useEffect(() => {
    if (!isEditing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Ajuste la résolution interne à la taille rendue pour un trait net.
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = getContext();
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e3a5f';
    }
    hasStroke.current = false;
  }, [isEditing]);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getContext();
    if (!ctx) return;
    drawing.current = true;
    hasStroke.current = true;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    drawing.current = false;
  };

  const handleClear = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
    onChange('');
  };

  const handleValidate = () => {
    if (!hasStroke.current) return;
    const dataUrl = canvasRef.current?.toDataURL('image/png') ?? '';
    onChange(dataUrl);
    setIsEditing(false);
  };

  if (!isEditing && value) {
    return (
      <div className="space-y-2">
        <div className="rounded-md border border-slate-300 bg-white p-2" style={{ height }}>
          <img src={value} alt="Signature" className="h-full w-auto object-contain" />
        </div>
        <Button variant="secondary" size="sm" onClick={() => { setIsEditing(true); onChange(''); }}>
          Refaire la signature
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className="w-full rounded-md border border-dashed border-slate-400 bg-slate-50 touch-none cursor-crosshair"
        style={{ height }}
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
      />
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleClear}>Effacer</Button>
        <Button variant="primary" size="sm" onClick={handleValidate}>Valider la signature</Button>
      </div>
    </div>
  );
}
