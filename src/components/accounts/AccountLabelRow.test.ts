import AccountLabelRow from '@/components/accounts/AccountLabelRow.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import Label from '@/components/ui/label/AppLabel.vue'

describe('AccountsLabelsHeader.vue', () => {
  test('renders all labels correctly', () => {
    const wrapper = mount(AccountLabelRow)

    const labels = wrapper.findAllComponents(Label)
    expect(labels).toHaveLength(4)

    expect(labels[0].text()).toBe('Метки')
    expect(labels[1].text()).toBe('Тип записи')
    expect(labels[2].text()).toBe('Логин')
    expect(labels[3].text()).toBe('Пароль')
  })

  test('renders divider line', () => {
    const wrapper = mount(AccountLabelRow)

    const divider = wrapper.find('.col-span-full.border-t')
    expect(divider.exists()).toBe(true)
    expect(divider.classes()).toContain('border-gray-200')
  })
})
