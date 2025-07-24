import { mount } from '@vue/test-utils'
import { AccountType, type Account } from '@/types/account.type'
import { nextTick } from 'vue'
import { expect, it } from 'vitest'
import AccountRow from '@/components/accounts/AccountRow.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'

const mockAccount: Account = {
  id: '1',
  type: AccountType.LOCAL,
  label: 'Test Label',
  login: 'test',
  password: 'password',
}

it('renders all form fields correctly', () => {
  const wrapper = mount(AccountRow, {
    props: {
      account: mockAccount,
    },
  })

  expect(wrapper.find('input[placeholder*="Метка1"]').exists()).toBe(true)
  expect(wrapper.find('input[placeholder="Логин"]').exists()).toBe(true)
  expect(wrapper.find('input[placeholder="Пароль"]').exists()).toBe(true)
  expect(wrapper.findComponent(AppSelect).exists()).toBe(true)
  expect(wrapper.findComponent(DeleteIcon).exists()).toBe(true)
})

it('emits save event on blur', async () => {
  const wrapper = mount(AccountRow, {
    props: {
      account: mockAccount,
    },
  })

  await wrapper.find('input[placeholder="Логин"]').trigger('blur')
  expect(wrapper.emitted('save')).toBeTruthy()
  expect(wrapper.emitted('save')?.[0]).toEqual([mockAccount])
})

it('emits delete event on button click', async () => {
  const wrapper = mount(AccountRow, {
    props: {
      account: mockAccount,
    },
  })

  await wrapper.findComponent({ name: 'AppButton' }).trigger('click')
  expect(wrapper.emitted('delete')).toBeTruthy()
  expect(wrapper.emitted('delete')?.[0]).toEqual([mockAccount])
})

it('shows password field only for LOCAL type', async () => {
  const wrapper = mount(AccountRow, {
    props: {
      account: mockAccount,
    },
  })

  expect(wrapper.find('input[placeholder="Пароль"]').isVisible()).toBe(true)

  await wrapper.setProps({
    account: { ...mockAccount, type: AccountType.LDAP } as Account,
  })
  await nextTick()

  expect(wrapper.find('input[placeholder="Пароль"]').isVisible()).toBe(false)
})

it('applies col-span-2 class for non-LOCAL types', async () => {
  const wrapper = mount(AccountRow, {
    props: {
      account: { ...mockAccount, type: AccountType.LDAP } as Account,
    },
  })

  const loginInput = wrapper.find('input[placeholder="Логин"]')
  expect(loginInput.classes()).toContain('col-span-2')
})

it('emits saveTypeChange when account type changes', async () => {
  const wrapper = mount(AccountRow, {
    props: {
      account: mockAccount,
    },
  })

  await wrapper
    .findComponent({ name: 'AppSelect' })
    .vm.$emit('update:model-value', AccountType.LDAP)

  expect(wrapper.emitted('saveTypeChange')).toBeTruthy()
  expect(wrapper.emitted('saveTypeChange')?.[0]).toEqual([AccountType.LDAP, mockAccount.id])
})

it('shows invalid state for fields', async () => {
  const wrapper = mount(AccountRow, {
    props: {
      account: mockAccount,
      invalidFields: {
        login: 'Invalid login',
        password: 'Invalid password',
      },
    },
  })

  const allInputs = wrapper.findAllComponents(AppInput)

  expect(allInputs[1].props().invalid).toBe(true)
  expect(allInputs[2].props().invalid).toBe(true)
})
