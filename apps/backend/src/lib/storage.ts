import { supabase } from '@prodgenie/libs/supabase';

export const createOrganizationFolders = async (orgName: string) => {
  const bucket = 'prodgenie';
  const paths = [
    `${orgName}/drawings/.init`,
    `${orgName}/templates/.init`,
    `${orgName}/job_cards/.init`,
  ];

  for (const path of paths) {
    const { error } = await supabase.storage.from(bucket).upload(path, '', {
      upsert: false,
      contentType: 'application/octet-stream',
    });

    if (error && error.message !== 'The resource already exists') {
      throw new Error(`Failed to create folder ${path}: ${error.message}`);
    }
  }
};
