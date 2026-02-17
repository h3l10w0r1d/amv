"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// pdfjs-dist is ESM; we import dynamically inside useEffect.
type PDFDocumentProxy = any;

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.6);

  const containerRef = useRef<HTMLDivElement>(null);

  // Make scale responsive: render sharp but not insane memory usage
  const computeScale = () => {
    const w = containerRef.current?.clientWidth ?? 1000;
    // PDF page is typically ~595pt wide for A4 portrait; adjust by width
    // We'll choose a scale that fills container nicely.
    const target = Math.min(Math.max(w / 700, 1.1), 2.0);
    setScale(target);
  };

  useEffect(() => {
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      // Worker (required for performance)
      // This points to a CDN worker. Works on Vercel.
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js";

      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const loadedDoc = await loadingTask.promise;

      if (cancelled) return;
      setDoc(loadedDoc);
      setNumPages(loadedDoc.numPages);
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return (
    <div ref={containerRef} className="viewer-wrap">
      {!doc && <div className="badge">Loading PDF…</div>}

      {doc &&
        Array.from({ length: numPages }, (_, i) => (
          <PdfPage key={i + 1} doc={doc} pageNumber={i + 1} scale={scale} />
        ))}
    </div>
  );
}

function PdfPage({
  doc,
  pageNumber,
  scale
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;

      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d", { alpha: false })!;

      // HiDPI rendering
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      await page.render({
        canvasContext: context,
        viewport
      }).promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, scale]);

  return (
    <div className="page">
      <canvas ref={canvasRef} />
    </div>
  );
}
