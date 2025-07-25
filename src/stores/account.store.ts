import { defineStore } from 'pinia'
import { AccountType, type Account, type AccountValidationErrors } from '@/types/account.type'
import { accountSchema } from '@/validation/account.validation'
import { computed, ref } from 'vue'
import { accountRepository } from '@/repository/instance'
import { omit } from '@/lib/utils'
import { AccountMapper } from '@/mapper/account.mapper'
import { AccountFactory, isIdAccountTemp } from '@/factory/account.factory'
import { accountConfig } from '@/config/account.config'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Array<Account>>([])
  const accountValidationErrors = ref<AccountValidationErrors>({})
  const isLoading = ref(false)
  const isDataLoaded = ref(false)
  const isAccountsEmpty = computed(() => isDataLoaded.value && accounts.value.length == 0)

  async function loadAccounts() {
    isLoading.value = true
    try {
      accounts.value = await accountRepository.getAll()
    } finally {
      isLoading.value = false
      isDataLoaded.value = true
    }
  }

  function addTempAccount() {
    accounts.value.push(AccountFactory.createTemporary(accountConfig.defaultAccountType))
  }

  async function deleteAccount(id: string) {
    if (!isIdAccountTemp(id)) {
      try {
        await accountRepository.delete(id)
      } catch {
        throw new Error('Failed while delete account')
      }
    }
    accounts.value = accounts.value.filter((acc) => acc.id !== id)
  }

  function validateAccountData(account: Account) {
    const res = accountSchema.safeParse(account)

    if (accountValidationErrors.value[account.id]) {
      delete accountValidationErrors.value[account.id]
    }

    if (!res.success) {
      if (!accountValidationErrors.value[account.id]) {
        accountValidationErrors.value[account.id] = {}
      }
      res.error.issues.forEach((issue) => {
        accountValidationErrors.value[account.id][issue.path.join('') as keyof Account] =
          issue.message
      })
    }

    return res
  }

  const saveAccount = async (account: Account) => {
    const validationData = validateAccountData(account)

    if (!validationData.success) {
      throw new Error(validationData.error.issues[0].message)
    }

    let savedAccount: Account

    if (isIdAccountTemp(account.id)) {
      try {
        const accountData = omit(account, ['id'])
        savedAccount = await accountRepository.create(accountData)
        // Replace temp id with new
        const index = accounts.value.findIndex((acc) => acc.id === account.id)
        if (index !== -1) {
          accounts.value.splice(index, 1, savedAccount)
        }
      } catch {
        throw new Error('Failed to save new account')
      }
    } else {
      try {
        await accountRepository.update(account.id, account)
      } catch {
        throw new Error('Failed to update existed account')
      }
    }
  }

  const saveAccountWhenTypeChanged = async (accountId: Account['id'], newType: AccountType) => {
    const accountIndex = accounts.value.findIndex((acc) => acc.id === accountId)
    if (accountIndex === -1) return

    const updatedAccount: Account = AccountMapper.forTypeChange(
      accounts.value[accountIndex],
      newType,
    )

    accounts.value.splice(accountIndex, 1, updatedAccount)

    return await saveAccount(updatedAccount)
  }

  return {
    deleteAccount,
    isLoading,
    loadAccounts,
    validateAccountData,
    saveAccount,
    addTempAccount,
    isDataLoaded,
    accounts,
    accountValidationErrors,
    saveAccountWhenTypeChanged,
    isAccountsEmpty,
  }
})
