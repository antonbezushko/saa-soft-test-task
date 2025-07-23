import type { Account } from '@/types'
import { v4 as uuidv4 } from 'uuid'

class AccountApi {
  create(account: Account): Promise<Account> {
    return new Promise((res) => {
      setTimeout(() => res({ ...account, id: uuidv4() }), Math.random() * 1000)
    })
  }

  update(account: Account): Promise<Account> {
    return new Promise((res) => {
      setTimeout(() => res(account), Math.random() * 1000)
    })
  }
}

export const accountApi = new AccountApi()
