import { v4 as uuidv4 } from 'uuid'
import {
  AccountType,
  type Account,
  type LdapAccount,
  type LocalAccount,
} from '@/types/account.type'
import { accountConfig } from '@/config/account.config'

type OmitIdAccount = Omit<Account, 'id'>

export const generateAccountTempId = (): string => {
  return accountConfig.tempIdPrefix + uuidv4()
}

export const isIdAccountTemp = (id: string): boolean => {
  return id.startsWith(accountConfig.tempIdPrefix)
}

export class AccountFactory {
  static create(accountData: OmitIdAccount): Account {
    const baseAccount = {
      ...accountData,
      id: uuidv4(),
    }

    return accountData.type === AccountType.LOCAL
      ? this.createLocal({ ...baseAccount, type: AccountType.LOCAL })
      : this.createLdap({ ...baseAccount, type: AccountType.LDAP })
  }

  static createLocal(
    accountData: Omit<Account, 'type'> & { type?: AccountType.LOCAL },
  ): LocalAccount {
    return {
      ...accountData,
      type: AccountType.LOCAL,
      password: accountData.password || '',
      id: accountData.id || uuidv4(),
    }
  }

  static createLdap(accountData: Omit<Account, 'type'> & { type?: AccountType.LDAP }): LdapAccount {
    return {
      ...accountData,
      type: AccountType.LDAP,
      password: '',
      id: accountData.id || uuidv4(),
    }
  }

  static createTemporary(type: AccountType): Account {
    return {
      id: generateAccountTempId(),
      type,
      label: '',
      login: '',
      password: '',
    }
  }
}
