import AccountFormHeader from '@/components/accounts/AccountFormHeader.vue'
import Button from '@/components/ui/button/AppButton.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

describe('AccountsHeader', () => {
  test('renders title and description correctly', () => {
    const wrapper = mount(AccountFormHeader)

    expect(wrapper.find('h2').text()).toBe('Учетные записи')
    expect(wrapper.find('p').text()).toContain('используйте разделитель ";"')
  })

  test('emits "add" event when button clicked', async () => {
    const wrapper = mount(AccountFormHeader)

    await wrapper.findComponent(Button).trigger('click')

    expect(wrapper.emitted()).toHaveProperty('add')
  })
})
