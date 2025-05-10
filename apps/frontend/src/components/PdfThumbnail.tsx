import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker?worker';

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

type Props = {
  url: string;
  width?: number;
};

export default function PdfThumbnail({ url, width = 150 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null;
    let cancelled = false;

    const renderThumbnail = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const scale = width / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        renderTask = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        });

        await renderTask.promise;
      } catch (error) {
        if (!cancelled) {
          console.error('Error rendering PDF thumbnail:', error);
        }
      }
    };

    renderThumbnail();

    return () => {
      cancelled = true;
      if (renderTask) {
        renderTask.cancel(); // safely cancel ongoing render
      }
    };
  }, [url, width]);

  return <canvas ref={canvasRef} />;
}
