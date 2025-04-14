const JSONViewer = ({ data }: { data: any }) => {
  return (
    <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

export { JSONViewer };
