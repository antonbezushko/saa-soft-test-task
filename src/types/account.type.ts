import type z from 'zod'
import type { accountBaseSchema } from '../validation/account.validation'

export enum AccountType {
  LOCAL = 'local',
  LDAP = 'ldap',
}

export function isAccountType(value: unknown): value is AccountType {
  return typeof value === 'string' && (value === AccountType.LOCAL || value === AccountType.LDAP)
}

export type AccountBase = z.infer<typeof accountBaseSchema>

export interface LocalAccount extends AccountBase {
  type: AccountType.LOCAL
  password: string
}

export interface LdapAccount extends AccountBase {
  type: AccountType.LDAP
  password: ''
}

export type LabelItem = { text: string }

export type AccountStorageBase = Omit<AccountBase, 'label'> & {
  label?: LabelItem[]
}

export interface LocalAccountStorage extends AccountStorageBase {
  type: AccountType.LOCAL
  password: string
}

export interface LdapAccountStorage extends AccountStorageBase {
  type: AccountType.LDAP
  password: null
}

export type Account = LocalAccount | LdapAccount
export type AccountStorage = LocalAccountStorage | LdapAccountStorage

export type AccountValidationErrors = Record<string, Partial<Record<keyof Account, string>>>

export interface IAccountRepository {
  getAll(): Promise<Account[]>
  getById(id: string): Promise<Account | null>
  create(account: Omit<Account, 'id'>): Promise<Account>
  update(id: string, account: Partial<Account>): Promise<Account>
  delete(id: string): Promise<void>
}
