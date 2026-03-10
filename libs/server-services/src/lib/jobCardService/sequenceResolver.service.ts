import { prisma } from '@prodgenie/libs/db';
import { StringService } from '@prodgenie/libs/shared-utils';

export class SequenceResolver {

  async resolve(description: string) {
    const keyword = StringService.camelCase(description);
    const baseKeyword = keyword.replace(
      /(Len|Wid|Ht|Size|Dim|Length|Width|Height)$/i,
      ''
    );
    const fallbackKeyword = baseKeyword.toLowerCase();

    const match =
      (await prisma.file.findFirst({
        where: {
          type: 'sequence',
          name: { equals: `${keyword}.json`, mode: 'insensitive' },
        },
      })) ||
      (await prisma.file.findFirst({
        where: {
          type: 'sequence',
          name: { contains: fallbackKeyword, mode: 'insensitive' },
        },
      }));

    if (!match) return null;
    return { id: match.id, path: match.path, data: match.data };
  }
}
