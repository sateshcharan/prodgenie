import { useEffect, useState } from 'react';

const jsonViewer = ({ url }: { url: string }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((html) => setHtml(html));
  }, [url]);

  return (
    <div className="p-4 bg-white overflow-auto border rounded shadow">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export { jsonViewer };
