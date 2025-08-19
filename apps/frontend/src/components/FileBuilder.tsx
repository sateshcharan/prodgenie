import { useLoaderData } from 'react-router-dom';
import { SequenceBuilder, TemplateBuilder, MaterialBuilder } from './index';
import { TableBuilder } from './TableBuilder';

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
