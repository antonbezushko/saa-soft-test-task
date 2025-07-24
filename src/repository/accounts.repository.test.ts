import { describe, beforeEach, test, expect, vi } from 'vitest'
import { AccountType, type AccountStorage } from '@/types/account.type'
import { LocalAccountRepository } from '@/repository/accounts.repository'
import { accountConfig } from '@/config/account.config'

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

describe('LocalAccountRepository', () => {
  let repository: LocalAccountRepository

  beforeEach(() => {
    localStorageMock.clear()
    repository = new LocalAccountRepository()
  })

  describe('getAll', () => {
    test('should return empty array when no accounts', async () => {
      const result = await repository.getAll()
      expect(result).toEqual([])
      expect(localStorage.getItem).toHaveBeenCalled()
    })

    test('should return parsed accounts', async () => {
      const testAccount1 = {
        label: 'XXX1;YYY1',
        login: 'login1',
        password: ' password1',
        type: AccountType.LOCAL,
      }

      const testAccount2 = {
        label: 'XXX2;YYY2',
        login: 'login2',
        password: '',
        type: AccountType.LDAP,
      }

      await repository.create(testAccount1)
      await repository.create(testAccount2)

      const result = await repository.getAll()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(expect.objectContaining(testAccount1))
      expect(result[1]).toEqual(expect.objectContaining(testAccount2))
    })
  })

  describe('create', () => {
    test('should create new account with id', async () => {
      const newAccountData = {
        type: AccountType.LOCAL,
        login: 'test',
        password: 'pass',
      }

      const result = await repository.create(newAccountData)

      expect(result.id).toBeDefined()
      expect(result.login).toBe(newAccountData.login)
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    test('should add account to existing ones', async () => {
      const existingAccount = {
        login: 'login',
        password: ' password',
        type: AccountType.LOCAL,
      }

      await repository.create(existingAccount)

      const newAccount = await repository.create({
        type: AccountType.LOCAL,
        login: 'new',
        password: 'pass',
      })

      const allAccounts = await repository.getAll()

      expect(allAccounts).toHaveLength(2)
      expect(allAccounts[0]).toEqual(expect.objectContaining(existingAccount))
      expect(allAccounts[1]).toEqual(expect.objectContaining(newAccount))
    })

    test('should save to localStorage with accountConfig.storageKey', async () => {
      const newAccountData = {
        type: AccountType.LOCAL,
        login: 'test',
        password: 'pass',
      }

      await repository.create(newAccountData)

      expect(localStorage.getItem).toHaveBeenCalled()
      expect(localStorage.getItem(accountConfig.storageKey)).not.toBe(null)
    })

    test('should save with correct structure', async () => {
      const newAccountData = {
        type: AccountType.LOCAL,
        label: 'XXX1;XXX2',
        login: 'test',
        password: 'pass',
      }

      await repository.create(newAccountData)
      const storage = localStorage.getItem(accountConfig.storageKey)

      const strageAccount = (JSON.parse(storage as string) as AccountStorage[])[0]

      expect(storage).not.toBe(null)
      expect(strageAccount).toBeDefined()
      expect(typeof strageAccount.id).toBe('string')
      expect(strageAccount.type).toBe(AccountType.LOCAL)
      expect(strageAccount.login).toBe('test')
      expect(strageAccount.password).toBe('pass')
      expect(strageAccount.label?.map((l) => l.text).sort()).toEqual(['XXX1', 'XXX2'].sort())
    })
  })

  describe('update', () => {
    test('should update existing account include localStorage', async () => {
      const originalAccount = {
        login: 'login',
        password: ' password',
        type: AccountType.LOCAL,
      }

      const updates = { login: 'updated-login' }

      const createdAccount = await repository.create(originalAccount)

      const result = await repository.update(createdAccount.id, updates)
      const storage = localStorage.getItem(accountConfig.storageKey)
      const strageAccount = (JSON.parse(storage as string) as AccountStorage[])[0]

      expect(result.login).toBe('updated-login')
      expect(strageAccount.id).toBe(createdAccount.id)
      expect(result.id).toBe(createdAccount.id)
    })

    test('should throw when account not found', async () => {
      await expect(repository.update('non-existent-id', {})).rejects.toThrow()
    })
  })

  describe('delete', () => {
    test('should remove account', async () => {
      const account1 = {
        login: 'login1',
        password: ' password1',
        type: AccountType.LOCAL,
      }
      const account2 = {
        login: 'login2',
        password: ' password2',
        type: AccountType.LOCAL,
      }

      const createdAccount1 = await repository.create(account1)
      const createdAccount2 = await repository.create(account2)

      await repository.delete(createdAccount1.id)
      const remaining = await repository.getAll()

      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(createdAccount2.id)
    })

    test('should do nothing when account not exists', async () => {
      const account = {
        login: 'login',
        password: ' password',
        type: AccountType.LOCAL,
      }

      await repository.create(account)

      await repository.delete('non-existent-id')
      const remaining = await repository.getAll()

      expect(remaining).toHaveLength(1)
    })
  })

  describe('storage handling', () => {
    test('should handle malformed storage data', async () => {
      localStorageMock.setItem(accountConfig.storageKey, 'invalid-json')

      const result = await repository.getAll()
      expect(result).toEqual([])
    })

    test('should handle empty storage', async () => {
      const result = await repository.getAll()
      expect(result).toEqual([])
    })
  })
})
