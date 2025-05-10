export const fileDetailsLoader = async ({ params, request }: any) => {
  const { fileId, fileType } = params;

  return { fileId, fileType };
};
