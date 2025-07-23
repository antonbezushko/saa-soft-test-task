import { accountConfig } from '@/config/account.config'
import {
  AccountType,
  type Account,
  type AccountStorage,
  type IAccountRepository,
} from '@/types/account.type'
import { v4 as uuidv4 } from 'uuid'

export class LocalAccountRepository implements IAccountRepository {
  private readonly storageKey = accountConfig.storageKey

  private prepareForStorage(accounts: Account[]): AccountStorage[] {
    return accounts.map((account) => {
      if (account.type === AccountType.LOCAL) {
        return {
          ...account,
          label: account.label
            ? account.label
                .split(accountConfig.labelDevider)
                .map((label) => ({ text: label.trim() }))
                .filter((label) => label.text.length > 0)
            : undefined,
        }
      } else {
        return {
          ...account,
          password: null,
          label: account.label
            ? account.label
                .split(accountConfig.labelDevider)
                .map((label) => ({ text: label.trim() }))
                .filter((label) => label.text.length > 0)
            : undefined,
        }
      }
    })
  }

  private parseFromStorage(accounts: AccountStorage[]): Account[] {
    return accounts.map((account) => {
      if (account.type === AccountType.LOCAL) {
        return {
          ...account,
          label: account.label
            ? account.label.map((l) => l.text).join(accountConfig.labelDevider)
            : undefined,
        }
      } else
        return {
          ...account,
          password: '',
          label: account.label
            ? account.label.map((l) => l.text).join(accountConfig.labelDevider)
            : undefined,
        }
    })
  }

  private getAccounts(): Account[] {
    const data = localStorage.getItem(this.storageKey)
    if (!data) return []

    try {
      const parsed: AccountStorage[] = JSON.parse(data)
      return this.parseFromStorage(parsed)
    } catch {
      return []
    }
  }

  private saveAccounts(accounts: Account[]): void {
    const data = this.prepareForStorage(accounts)
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  async getAll(): Promise<Account[]> {
    return this.getAccounts()
  }

  async getById(id: string): Promise<Account | null> {
    return this.getAccounts().find((a) => a.id === id) || null
  }

  async create(account: Omit<Account, 'id'>): Promise<Account> {
    const accounts = this.getAccounts()

    const newAccount: Account =
      account.type === AccountType.LOCAL
        ? {
            ...account,
            type: AccountType.LOCAL,
            password: account.password,
            id: uuidv4(),
          }
        : {
            ...account,
            password: '',
            id: uuidv4(),
          }

    this.saveAccounts([...accounts, newAccount])

    return newAccount
  }

  async update(id: string, updates: Partial<Account>): Promise<Account> {
    const accounts = this.getAccounts()
    const index = accounts.findIndex((a) => a.id === id)

    if (index === -1) throw new Error('Account not found')

    const updated = {
      ...accounts[index],
      ...updates,
    } as Account

    accounts[index] = updated
    this.saveAccounts(accounts)
    return updated
  }

  async delete(id: string): Promise<void> {
    this.saveAccounts(this.getAccounts().filter((a) => a.id !== id))
  }
}
