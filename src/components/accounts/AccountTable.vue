<script setup lang="ts">
import AccountEmptyState from '@/components/accounts/AccountEmptyState.vue'
import AccountLabelRow from '@/components/accounts/AccountLabelRow.vue'
import AccountRow from '@/components/accounts/AccountRow.vue'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import ScrollBar from '@/components/ui/scroll-area/ScrollBar.vue'
import { useAccountStore } from '@/stores/account.store'
import type { Account, AccountType } from '@/types/account.type'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'

const store = useAccountStore()
const { accountValidationErrors, deleteAccount, saveAccount, saveAccountWhenTypeChanged } = store
const { accounts, isAccountsEmpty } = storeToRefs(store)

function showToast(success: boolean, message: string, error?: Error) {
  if (!success) {
    toast.error(message, {
      description: error?.message || 'Проверьте введенные данные',
    })
  } else {
    toast.success(message)
  }
}

async function handleAccountInputChange(account: Account) {
  try {
    await saveAccount(account)
    showToast(true, 'Успешно сохранено')
  } catch (error: unknown) {
    if (error instanceof Error) {
      showToast(false, 'Ошибка', error)
    }
  }
}

async function handleAccountTypeChange(accountType: AccountType, accountId: Account['id']) {
  try {
    await saveAccountWhenTypeChanged(accountId, accountType)
    showToast(true, 'Успешно сохранено')
  } catch (error: unknown) {
    if (error instanceof Error) {
      showToast(false, 'Ошибка', error)
    }
  }
}

async function handleDeleteClick(account: Account) {
  try {
    await deleteAccount(account.id)
    showToast(true, 'Успешно удалено')
  } catch (error: unknown) {
    if (error instanceof Error) {
      showToast(false, 'Ошибка', error)
    }
  }
}
</script>

<template>
  <ScrollArea class="relative">
    <div
      class="mt-8 grid grid-cols-[2fr_160px_2fr_2fr_40px] gap-y-4 gap-x-2 items-center min-w-xl pb-1 px-2"
      :class="{ 'max-md:pb-16': isAccountsEmpty }"
    >
      <!-- Label row -->
      <AccountLabelRow />
      <!-- Empty state row -->
      <AccountEmptyState v-if="isAccountsEmpty" />
      <!-- Account rows   -->
      <AccountRow
        v-for="(acc, index) in accounts"
        :key="acc.id"
        :account="acc"
        :invalidFields="accountValidationErrors[acc.id]"
        @update:account="accounts[index] = $event"
        @save="handleAccountInputChange"
        @save-type-change="handleAccountTypeChange"
        @delete="handleDeleteClick"
      />
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
</template>
