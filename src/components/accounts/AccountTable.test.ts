import { mount } from '@vue/test-utils'
import { useAccountStore } from '@/stores/account.store'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { AccountType, type Account } from '@/types/account.type'
import AccountTable from '@/components/accounts/AccountTable.vue'
import AccountEmptyState from '@/components/accounts/AccountEmptyState.vue'

vi.mock('vue-sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

let store: ReturnType<typeof useAccountStore>

beforeEach(() => {
  setActivePinia(createPinia())
  store = useAccountStore()

  store.saveAccount = vi.fn().mockResolvedValue(undefined)
  store.saveAccountWhenTypeChanged = vi.fn().mockResolvedValue(undefined)
  store.deleteAccount = vi.fn().mockResolvedValue(undefined)
})

it('should renders empty state component', async () => {
  store.isDataLoaded = true
  const wrapper = mount(AccountTable)
  expect(wrapper.findComponent(AccountEmptyState).exists()).toBe(true)
})

it('renders account rows when accounts exist', async () => {
  store.accounts = [
    { id: '1', type: AccountType.LOCAL, login: 'user1', password: 'pass1', label: '' },
    { id: '2', type: AccountType.LDAP, login: 'user2', password: '', label: '' },
  ]

  const wrapper = mount(AccountTable)
  await nextTick()

  const rows = wrapper.findAllComponents({ name: 'AccountRow' })
  expect(rows.length).toBe(2)
  expect(rows[0].props('account').login).toBe('user1')
  expect(rows[1].props('account').login).toBe('user2')
})

it('handles account input change', async () => {
  const testAccount: Account = {
    id: '1',
    type: AccountType.LOCAL,
    login: 'user',
    password: 'pass',
    label: 'XXX1;XXX2',
  }
  store.accounts = [testAccount]

  const wrapper = mount(AccountTable)
  await wrapper.findComponent({ name: 'AccountRow' }).vm.$emit('save', testAccount)

  expect(store.saveAccount).toHaveBeenCalledWith(testAccount)
})

it('handles account type change', async () => {
  const testAccount: Account = {
    id: '1',
    type: AccountType.LOCAL,
    login: 'user',
    password: 'pass',
  }
  store.accounts = [testAccount]

  const wrapper = mount(AccountTable)
  await wrapper
    .findComponent({ name: 'AccountRow' })
    .vm.$emit('save-type-change', AccountType.LDAP, '1')

  expect(store.saveAccountWhenTypeChanged).toHaveBeenCalledWith('1', AccountType.LDAP)
})

it('handles account deletion', async () => {
  const testAccount: Account = {
    id: '1',
    type: AccountType.LOCAL,
    login: 'user',
    password: 'pass',
  }
  store.accounts = [testAccount]

  const wrapper = mount(AccountTable)
  await wrapper.findComponent({ name: 'AccountRow' }).vm.$emit('delete', testAccount)

  expect(store.deleteAccount).toHaveBeenCalledWith(testAccount.id)
})

it('shows error toast when save fails', async () => {
  const error = new Error('Save failed')
  store.saveAccount = vi.fn().mockRejectedValue(error)
  store.accounts = [
    { id: '1', type: AccountType.LOCAL, login: 'user', password: 'pass', label: '' },
  ]

  const wrapper = mount(AccountTable)
  await wrapper.findComponent({ name: 'AccountRow' }).vm.$emit('save', store.accounts[0])

  const { toast } = await import('vue-sonner')
  expect(toast.error).toHaveBeenCalledWith('Ошибка', {
    description: 'Save failed',
  })
})

it('shows success toast when save succeeds', async () => {
  store.accounts = [
    { id: '1', type: AccountType.LOCAL, login: 'user', password: 'pass', label: '' },
  ]

  const wrapper = mount(AccountTable)
  await wrapper.findComponent({ name: 'AccountRow' }).vm.$emit('save', store.accounts[0])

  const { toast } = await import('vue-sonner')
  expect(toast.success).toHaveBeenCalledWith('Успешно сохранено')
})

it('passes validation errors to AccountRow', async () => {
  const testAccount: Account = {
    id: '1',
    type: AccountType.LOCAL,
    login: 'user',
    password: 'pass',
  }
  store.accounts = [testAccount]
  store.accountValidationErrors = {
    '1': { login: 'Invalid login' },
  }

  const wrapper = mount(AccountTable)
  const row = wrapper.findComponent({ name: 'AccountRow' })

  expect(row.props('invalidFields')).toEqual({ login: 'Invalid login' })
})

it('updates account when AccountRow emits update', async () => {
  const originalAccount: Account = {
    id: '1',
    type: AccountType.LOCAL,
    login: 'user',
    password: 'pass',
    label: '',
  }
  const updatedAccount = { ...originalAccount, login: 'new-user' }
  store.accounts = [originalAccount]

  const wrapper = mount(AccountTable)
  await wrapper.findComponent({ name: 'AccountRow' }).vm.$emit('update:account', updatedAccount)

  expect(store.accounts[0].login).toBe('new-user')
})
