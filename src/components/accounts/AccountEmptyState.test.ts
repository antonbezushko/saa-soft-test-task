import AccountEmptyState from '@/components/accounts/AccountEmptyState.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

describe('AccountEmptyState', () => {
  test('render correct text', async () => {
    const wrapper = mount(AccountEmptyState)
    expect(wrapper.text()).toBe('Список пуст')
  })
})
