import { AccountType, type Account } from '@/types/account.type'
import { accountSchema } from '@/validation/account.validation'
import { describe, expect, test } from 'vitest'

describe('Account validation', () => {
  test('Should return failed validation if empty login', async () => {
    const account: Account = {
      id: 'id',
      login: '',
      password: 'password',
      type: AccountType.LOCAL,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('login')
  })

  test('Should return failed validation if empty password', async () => {
    const account: Account = {
      id: 'id',
      login: 'login',
      password: '',
      type: AccountType.LOCAL,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('password')
  })

  test('Should return failed validation if empty password and login', async () => {
    const account: Account = {
      id: 'id',
      login: '',
      password: '',
      type: AccountType.LOCAL,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues.map((i) => i.path[0]).sort()).toEqual(['password', 'login'].sort())
  })

  test('Should return failed validation if label length > 50', async () => {
    const account: Account = {
      id: 'id',
      login: 'login',
      label: '111111111111111111111111111111111111111111111111111',
      password: 'password',
      type: AccountType.LOCAL,
    }

    expect(account.label!.length > 50).toBe(true)

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('label')
  })

  test('Should return failed validation if password length > 100', async () => {
    const account: Account = {
      id: 'id',
      login: 'login',
      password:
        '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      type: AccountType.LOCAL,
    }

    expect(account.password!.length > 100).toBe(true)

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('password')
  })

  test('Should return failed validation if id empty', async () => {
    const account = {
      login: 'login',
      password: 'password',
      type: AccountType.LOCAL,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('id')
  })

  test('Should return failed validation if label contain empty string after devider', async () => {
    const account: Account = {
      id: 'id',
      login: 'login',
      label: 'XXX;',
      password: 'password',
      type: AccountType.LOCAL,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('label')
  })

  test('Should return false if LDAP account have not empty password', async () => {
    const account = {
      id: 'id',
      login: 'login',
      password: 'password',
      type: AccountType.LDAP,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('password')
  })

  test('Should return true when label is optional', async () => {
    const account: Account = {
      id: 'id',
      login: 'login',
      password: 'password',
      type: AccountType.LOCAL,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(true)
  })

  test('Should return true if account correct (LDAP)', async () => {
    const account: Account = {
      id: 'id',
      login: 'login',
      password: '',
      type: AccountType.LDAP,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(true)
  })

  test('Should return false if account type not AccountType enum', async () => {
    const account = {
      id: 'id',
      login: 'login',
      password: '',
      type: '__NEW_TYPE',
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(false)
    expect(res.error?.issues[0].path[0]).toBe('type')
  })

  test('Should return true if account coorect (LOCAL)', async () => {
    const account: Account = {
      id: 'id',
      login: 'login',
      password: 'password',
      type: AccountType.LOCAL,
    }

    const res = accountSchema.safeParse(account)

    expect(res.success).toBe(true)
  })
})
