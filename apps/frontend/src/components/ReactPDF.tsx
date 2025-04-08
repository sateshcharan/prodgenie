import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url
// ).toString();

interface ReactPDFProps {
  file: { url: string };
  width?: number;
}

const ReactPDF = ({ file, width = 300 }: ReactPDFProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Document
      file={file.url}
      onLoadSuccess={onLoadSuccess}
      loading="Loading PDF..."
    >
      <Page pageNumber={1} width={width} />
    </Document>
  );
};

export default ReactPDF;
