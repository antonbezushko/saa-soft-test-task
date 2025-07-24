import { defineStore } from 'pinia'
import { AccountType, type Account, type AccountValidationErrors } from '@/types/account.type'
import { accountConfig } from '@/config/account.config'
import { accountSchema } from '@/validation/account.validation'
import { computed, ref } from 'vue'
import { accountRepository } from '@/repository/instance'
import { v4 as uuidv4 } from 'uuid'
import { omit } from '@/lib/utils'

export const generateAccountTempId = (): string => {
  return accountConfig.tempIdPrefix + uuidv4()
}

export const isIdAccountTemp = (id: string): boolean => {
  return id.startsWith(accountConfig.tempIdPrefix)
}

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
    accounts.value.push({
      id: generateAccountTempId(),
      login: '',
      password: '',
      type: accountConfig.defaultAccountType,
    })
  }

  async function deleteAccount(id: string) {
    if (!isIdAccountTemp(id)) {
      await accountRepository.delete(id)
    }
    accounts.value = accounts.value.filter((acc) => acc.id !== id)
  }

  function validateAccountData(account: Account) {
    const res = accountSchema.safeParse(account)
    accountValidationErrors.value[account.id] = {}

    if (!res.success) {
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
        // Create new account without temp id
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
      // Update existed
      try {
        savedAccount = await accountRepository.update(account.id, account)
      } catch {
        throw new Error('Failed to update existed account')
      }
    }
  }

  const saveAccountWhenTypeChanged = async (accountId: Account['id'], newType: AccountType) => {
    const accountIndex = accounts.value.findIndex((acc) => acc.id === accountId)
    if (accountIndex === -1) return

    const updatedAccount: Account =
      newType === AccountType.LOCAL
        ? {
            ...accounts.value[accountIndex],
            type: newType,
            password: accounts.value[accountIndex].password,
          }
        : {
            ...accounts.value[accountIndex],
            type: newType,
            password: '',
          }

    accounts.value.splice(accountIndex, 1, updatedAccount)

    return await saveAccount(updatedAccount)
  }

  return {
    deleteAccount,
    isLoading,
    loadAccounts,
    saveAccount,
    addTempAccount,
    accounts,
    accountValidationErrors,
    saveAccountWhenTypeChanged,
    isAccountsEmpty,
  }
})
