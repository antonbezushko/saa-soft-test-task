import { accountConfig } from '@/config/account.config'
import { AccountType, type Account, type AccountStorage } from '@/types/account.type'

export class AccountMapper {
  static forTypeChange(account: Account, newType: AccountType): Account {
    const base = { ...account, type: newType }

    return newType === AccountType.LOCAL
      ? { ...base, type: AccountType.LOCAL }
      : { ...base, type: AccountType.LDAP, password: '' }
  }

  static toStorage(account: Account): AccountStorage {
    const processedLabel = account.label
      ? account.label
          .split(accountConfig.labelDevider)
          .map((label) => ({ text: label.trim() }))
          .filter((label) => label.text.length > 0)
      : undefined

    const base = {
      ...account,
      label: processedLabel,
    }

    return account.type === AccountType.LOCAL
      ? {
          ...base,
          type: AccountType.LOCAL,
          password: account.password || '',
        }
      : {
          ...base,
          type: AccountType.LDAP,
          password: null,
        }
  }

  static arrayToStorage(accounts: Account[]): AccountStorage[] {
    return accounts.map(this.toStorage)
  }

  static fromStorage(storage: AccountStorage): Account {
    const base = {
      ...storage,
      label: storage.label ? storage.label.map((l) => l.text).join(accountConfig.labelDevider) : '',
    }

    return storage.type === AccountType.LOCAL
      ? {
          ...base,
          type: AccountType.LOCAL,
          password: storage.password,
        }
      : {
          ...base,
          type: AccountType.LDAP,
          password: '',
        }
  }

  static arrayFromStorage(storageAccounts: AccountStorage[]): Account[] {
    return storageAccounts.map(this.fromStorage)
  }
}
