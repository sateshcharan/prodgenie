export const FileType = {
  drawing: 'drawing',
  template: 'template',
  sequence: 'sequence',
  jobCard: 'jobCard',
  config: 'config',
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];
