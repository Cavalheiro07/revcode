import { Category, ChallengeFormat, ChallengeOrigin, ChallengeStatus } from '@prisma/client';
import { z } from 'zod';

export const CategorySchema = z.nativeEnum(Category);
export const FormatSchema = z.nativeEnum(ChallengeFormat);
export const StatusSchema = z.nativeEnum(ChallengeStatus);
export const OriginSchema = z.nativeEnum(ChallengeOrigin);

export const IdParams = z.object({ id: z.string().min(1) });

/** Paginação das listagens de admin: `?page=1&pageSize=20`. */
export const PageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const EmailSchema = z.string().trim().toLowerCase().email('E-mail inválido.').max(254);

export const PasswordSchema = z
  .string()
  .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
  .max(72, 'A senha pode ter no máximo 72 caracteres.');

export const NameSchema = z.string().trim().min(1, 'Informe o nome.').max(80);

export function lineCount(code: string): number {
  return code.split('\n').length;
}
