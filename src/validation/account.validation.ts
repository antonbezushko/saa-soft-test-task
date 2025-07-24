import { AccountType } from '@/types/account.type'
import { z } from 'zod'

const ACCOUNT_TYPES = AccountType

export const accountBaseSchema = z.object({
  id: z.string(),
  label: z
    .string()
    .max(50, { message: 'Метки максимум 50 символов' })
    .optional()
    .refine((val) => !val || val.split(';').every((label) => label.trim().length > 0), {
      message: 'Метки не должны быть пустыми после разделения',
    }),
  type: z.enum(ACCOUNT_TYPES),
  login: z
    .string()
    .min(1, { message: 'Логин обязательное поле' })
    .max(100, { message: 'Логин максимум 100 символов' }),
})

const localAccountSchema = accountBaseSchema.extend({
  type: z.literal(ACCOUNT_TYPES.LOCAL),
  password: z
    .string()
    .min(1, { message: 'Пароль обязателен' })
    .max(100, { message: 'Пароль максимум 100 символов' }),
})

const ldapAccountSchema = accountBaseSchema.extend({
  type: z.literal(ACCOUNT_TYPES.LDAP),
  password: z.string().length(0),
})

export const accountSchema = z.discriminatedUnion('type', [localAccountSchema, ldapAccountSchema])
