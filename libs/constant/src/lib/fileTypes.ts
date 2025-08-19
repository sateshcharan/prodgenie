export const FileType = {
  drawing: 'drawing',
  template: 'template',
  sequence: 'sequence',
  jobCard: 'jobCard',
  config: 'config',
  table: 'table',
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];
