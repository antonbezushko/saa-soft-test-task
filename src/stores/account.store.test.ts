import { setActivePinia, createPinia } from 'pinia'
import { describe, beforeEach, test, expect, vi } from 'vitest'
import { useAccountStore } from '@/stores/account.store'
import { AccountType, type Account } from '@/types/account.type'
import { accountRepository } from '@/repository/instance'
import { AccountFactory } from '@/factory/account.factory'
import { accountConfig } from '@/config/account.config'
import * as accountFactoryModule from '@/factory/account.factory'
import * as accountValidationModule from '@/validation/account.validation.ts'

describe('useAccountStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  async function addAccounts(accounts: Account[]) {
    const mockAccounts: Account[] = [
      AccountFactory.create({ type: AccountType.LOCAL, login: 'user1', password: 'pass1' }),
      AccountFactory.create({ type: AccountType.LDAP, login: 'user2', password: '' }),
    ]

    vi.spyOn(accountRepository, 'getAll').mockResolvedValue(mockAccounts)

    const store = useAccountStore()
    await store.loadAccounts()

    expect(accountRepository.getAll).toHaveBeenCalled()
    expect(store.accounts).toEqual(mockAccounts)
  }

  describe('loadAccounts', () => {
    test('should load accounts', async () => {
      const mockAccounts: Account[] = [
        AccountFactory.create({ type: AccountType.LOCAL, login: 'user1', password: 'pass1' }),
        AccountFactory.create({ type: AccountType.LDAP, login: 'user2', password: '' }),
      ]

      vi.spyOn(accountRepository, 'getAll').mockResolvedValue(mockAccounts)

      const store = useAccountStore()
      await store.loadAccounts()

      expect(accountRepository.getAll).toHaveBeenCalled()
      expect(store.accounts).toEqual(mockAccounts)
    })

    test('isLoading should be false after loading accounts', async () => {
      const mockAccounts: Account[] = [
        AccountFactory.create({ type: AccountType.LOCAL, login: 'user1', password: 'pass1' }),
        AccountFactory.create({ type: AccountType.LDAP, login: 'user2', password: '' }),
      ]

      vi.spyOn(accountRepository, 'getAll').mockResolvedValue(mockAccounts)

      const store = useAccountStore()

      await store.loadAccounts()

      expect(accountRepository.getAll).toHaveBeenCalled()
      expect(store.isLoading).toBe(false)
    })

    test('isDataLoaded should be false after loading accounts', async () => {
      const mockAccounts: Account[] = [
        AccountFactory.create({ type: AccountType.LOCAL, login: 'user1', password: 'pass1' }),
        AccountFactory.create({ type: AccountType.LDAP, login: 'user2', password: '' }),
      ]

      vi.spyOn(accountRepository, 'getAll').mockResolvedValue(mockAccounts)

      const store = useAccountStore()

      await store.loadAccounts()

      expect(accountRepository.getAll).toHaveBeenCalled()
      expect(store.isDataLoaded).toBe(true)
    })

    test('isAccountsEmpty should be false before loading accounts', async () => {
      const store = useAccountStore()
      expect(store.isAccountsEmpty).toBe(false)
    })

    test('isAccountsEmpty should be false after loading accounts, and data is empty', async () => {
      const mockAccounts: Account[] = []

      vi.spyOn(accountRepository, 'getAll').mockResolvedValue(mockAccounts)

      const store = useAccountStore()

      await store.loadAccounts()

      expect(accountRepository.getAll).toHaveBeenCalled()

      expect(store.isAccountsEmpty).toBe(true)
    })

    test('isAccountsEmpty should be true after loading accounts, and data is NOT empty', async () => {
      const mockAccounts: Account[] = [
        AccountFactory.create({ type: AccountType.LOCAL, login: 'user1', password: 'pass1' }),
        AccountFactory.create({ type: AccountType.LDAP, login: 'user2', password: '' }),
      ]

      vi.spyOn(accountRepository, 'getAll').mockResolvedValue(mockAccounts)

      const store = useAccountStore()

      await store.loadAccounts()

      expect(accountRepository.getAll).toHaveBeenCalled()

      expect(store.isAccountsEmpty).toBe(false)
    })
  })

  describe('addTempAccount', () => {
    test('should create temporary account', async () => {
      const createTemporaryMock = vi.spyOn(AccountFactory, 'createTemporary')

      const store = useAccountStore()
      store.addTempAccount()

      expect(createTemporaryMock).toHaveBeenCalledOnce()
    })

    test('should create temporary account with default account type', async () => {
      const createTemporaryMock = vi.spyOn(AccountFactory, 'createTemporary')

      const store = useAccountStore()
      store.addTempAccount()

      expect(createTemporaryMock).toHaveBeenCalledWith(accountConfig.defaultAccountType)
    })
  })

  describe('deleteAccount', () => {
    test('should delete account from repository if has NOT temp id', async () => {
      const deleteId = 'delete_id'

      const store = useAccountStore()

      vi.spyOn(accountFactoryModule, 'isIdAccountTemp').mockReturnValue(false)
      const accountRepositoryDeleteMock = vi.spyOn(accountRepository, 'delete')

      await store.deleteAccount(deleteId)

      expect(accountRepositoryDeleteMock).toHaveBeenCalledOnce()
      expect(accountRepositoryDeleteMock).toBeCalledWith(deleteId)
    })

    test('should NOT delete account from repository if has temp id', async () => {
      const deleteId = 'delete_id'

      const store = useAccountStore()

      vi.spyOn(accountFactoryModule, 'isIdAccountTemp').mockReturnValue(true)
      const accountRepositoryDeleteMock = vi.spyOn(accountRepository, 'delete')

      await store.deleteAccount(deleteId)

      expect(accountRepositoryDeleteMock).not.toHaveBeenCalled()
    })

    test('should delete account', async () => {
      const mockAccounts: Account[] = [
        AccountFactory.create({ type: AccountType.LOCAL, login: 'user1', password: 'pass1' }),
        AccountFactory.create({ type: AccountType.LDAP, login: 'user2', password: '' }),
        AccountFactory.create({ type: AccountType.LOCAL, login: 'user3', password: 'pass3' }),
      ]

      vi.spyOn(accountRepository, 'getAll').mockResolvedValue(mockAccounts)

      const store = useAccountStore()
      await store.loadAccounts()

      expect(accountRepository.getAll).toHaveBeenCalled()
      expect(store.accounts).toEqual(mockAccounts)

      const ids = store.accounts.map((a) => a.id)
      const deleteId = ids[0]

      await store.deleteAccount(deleteId)

      expect(store.accounts.map((a) => a.id)).not.toContain(deleteId)
    })

    test('should not delete if repo throw error while deleting', async () => {
      const realAccountId = 'real-account-id'

      const store = useAccountStore()
      store.accounts = [
        { id: realAccountId, login: 'log1', password: 'pas1', type: AccountType.LOCAL },
      ]

      vi.spyOn(accountRepository, 'delete').mockRejectedValue(new Error())
      vi.spyOn(accountFactoryModule, 'isIdAccountTemp').mockReturnValue(false)
      await expect(store.deleteAccount(realAccountId)).rejects.toBeDefined()

      expect(accountRepository.delete).toHaveBeenCalledWith(realAccountId)
      expect(store.accounts).toHaveLength(1)
    })
  })

  describe('validateAccountData', () => {
    test('should return safeParse response', async () => {
      const account = AccountFactory.create({
        login: '',
        password: '',
        type: AccountType.LOCAL,
      })

      const safeParseRes = {
        success: true as const,
        data: account,
      }

      vi.spyOn(accountValidationModule.accountSchema, 'safeParse').mockReturnValueOnce(safeParseRes)

      const store = useAccountStore()

      expect(store.validateAccountData(account)).toBe(safeParseRes)
    })

    test('accountValidationErrors should be empty if validation success', async () => {
      const account = AccountFactory.create({
        login: '',
        password: '',
        type: AccountType.LOCAL,
      })

      const safeParseRes = {
        success: true as const,
        data: account,
      }

      vi.spyOn(accountValidationModule.accountSchema, 'safeParse').mockReturnValueOnce(safeParseRes)

      const store = useAccountStore()

      store.validateAccountData(account)

      expect(Object.keys(store.accountValidationErrors).length === 0).toBe(true)
    })

    test('accountValidationErrors should contain key with message if validation fails', async () => {
      const emptyLoginAndPasswordAccount = AccountFactory.create({
        login: '',
        password: '',
        type: AccountType.LOCAL,
      })

      vi.spyOn(accountValidationModule.accountSchema, 'safeParse')

      const store = useAccountStore()

      store.validateAccountData(emptyLoginAndPasswordAccount)

      expect(
        Object.keys(store.accountValidationErrors[emptyLoginAndPasswordAccount.id]).sort(),
      ).toEqual(['password', 'login'].sort())
    })
  })

  describe('saveAccount', () => {
    test('should save new account if is valid (temporal)', async () => {
      const store = useAccountStore()
      store.addTempAccount()
      expect(store.accounts).toHaveLength(1)

      const tempAcc = store.accounts[0]

      vi.spyOn(accountValidationModule.accountSchema, 'safeParse').mockReturnValueOnce({
        success: true as const,
        data: tempAcc,
      })

      vi.spyOn(accountFactoryModule, 'isIdAccountTemp').mockReturnValue(true)
      const mock = vi.spyOn(accountRepository, 'create')

      const { id, ...accountData } = tempAcc

      await store.saveAccount(tempAcc)
      expect(mock).toHaveBeenCalledWith(accountData)
    })

    test('should update if is valid (existed)', async () => {
      const store = useAccountStore()

      const account = AccountFactory.create({
        login: 'log1',
        password: 'pas1',
        type: AccountType.LOCAL,
      })

      store.accounts.push(account)

      expect(store.accounts).toHaveLength(1)

      vi.spyOn(accountValidationModule.accountSchema, 'safeParse').mockReturnValueOnce({
        success: true as const,
        data: account,
      })

      vi.spyOn(accountFactoryModule, 'isIdAccountTemp').mockReturnValue(false)

      const mock = vi.spyOn(accountRepository, 'update').mockResolvedValueOnce(account)

      await store.saveAccount(account)

      expect(mock).toHaveBeenCalledWith(account['id'], account)
    })
  })

  describe('saveAccountWhenTypeChanged', () => {
    test('should call validation', async () => {
      const store = useAccountStore()

      store.accounts.push({
        id: 'id1',
        login: 'login1',
        password: 'password1',
        type: AccountType.LOCAL,
      })

      expect(store.accounts).toHaveLength(1)

      const account = store.accounts[0]

      vi.spyOn(accountRepository, 'update').mockResolvedValue(account)
      const mock = vi.spyOn(accountValidationModule.accountSchema, 'safeParse')

      await store.saveAccountWhenTypeChanged(account.id, AccountType.LDAP)

      expect(mock).toHaveBeenCalled()
    })

    test('should set password as empty string when type changed to ldap', async () => {
      const store = useAccountStore()

      store.accounts.push({
        id: 'id1',
        login: 'login1',
        password: 'password1',
        type: AccountType.LOCAL,
      })

      expect(store.accounts).toHaveLength(1)

      const account = store.accounts[0]

      vi.spyOn(accountRepository, 'update').mockResolvedValue(account)

      await store.saveAccountWhenTypeChanged(account.id, AccountType.LDAP)

      expect(store.accounts[0].password).toEqual('')
    })
  })
})
