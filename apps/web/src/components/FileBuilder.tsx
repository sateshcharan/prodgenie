import { useLoaderData } from 'react-router-dom';
import SequenceBuilder from './sequence/SequenceBuilder';
import TemplateBuilder from './template/TemplateBuilder';
import TableBuilder from './table/TableBuilder';

const FileBuilder = () => {
  const { fileType } = useLoaderData() as {
    fileType: string;
  };

  return (
    <div>
      {fileType === 'sequence' ? (
        <SequenceBuilder />
      ) : fileType === 'template' ? (
        <TemplateBuilder />
      ) : fileType === 'table' ? (
        <TableBuilder />
      ) : null}
    </div>
  );
};

export default FileBuilder;
