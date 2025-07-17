import { useLoaderData } from 'react-router-dom';
import { SequenceBuilder, TemplateBuilder, MaterialBuilder } from './index';

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
      ) : fileType === 'material' ? (
        <MaterialBuilder />
      ) : null}
    </div>
  );
};

export default FileBuilder;
