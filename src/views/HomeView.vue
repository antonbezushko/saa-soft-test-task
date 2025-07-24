<script setup lang="ts">
import { onMounted } from 'vue'

import MarkLabel from '@/components/accounts/MarkLabel.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AccountType, isAccountType, type Account } from '@/types/account.type'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'
import { useAccountStore } from '@/stores/account.store'
import { accountConfig } from '@/config/account.config'
import { storeToRefs } from 'pinia'
import type { AcceptableValue } from 'reka-ui'

const store = useAccountStore()
import { toast } from 'vue-sonner'
import { Skeleton } from '@/components/ui/skeleton'
import Spinner from '@/components/ui/spinner/Spinner.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'

const {
  addTempAccount,
  loadAccounts,
  accountValidationErrors,
  deleteAccount,
  saveAccount,
  saveAccountWhenTypeChanged,
} = store

const { accounts, isAccountsEmpty } = storeToRefs(store)

onMounted(() => {
  loadAccounts()
})

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

async function handleAccountTypeChange(accountType: AcceptableValue, accountId: Account['id']) {
  if (isAccountType(accountType)) {
    try {
      await saveAccountWhenTypeChanged(accountId, accountType)
      showToast(true, 'Успешно сохранено')
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(false, 'Ошибка', error)
      }
    }
  }
}

async function handleDeleteClick(id: Account['id']) {
  try {
    await deleteAccount(id)
    showToast(true, 'Успешно удалено')
  } catch (error: unknown) {
    if (error instanceof Error) {
      showToast(false, 'Ошибка', error)
    }
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto mt-20 border border-gray-200 p-10 rounded-2xl">
    <!-- <pre>{{ accounts }}</pre> -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="mr-4 text-lg font-semibold">Учетные записи</h2>
        <p class="text-sm mt-2 text-gray-600">
          Для указания нескольких меток для одной пары логин/пароль используйте разделитель ";"
        </p>
      </div>
      <Button class="font-bold" variant="default" @click="addTempAccount">Добавить </Button>
    </div>
    <div class="mt-8 grid grid-cols-[2fr_160px_2fr_2fr_40px] gap-y-4 gap-x-2 items-center">
      <!-- Label row -->
      <Label>Метки</Label>
      <Label>Тип записи</Label>
      <Label>Логин</Label>
      <Label>Пароль</Label>
      <div class="col-span-full border-t border-gray-200"></div>
      <div class="col-span-full text-gray-400 text-center text-sm py-4" v-if="isAccountsEmpty">
        Список пуст
      </div>
      <!-- Input rows   -->
      <template v-for="acc in accounts" :key="acc.id">
        <Input
          :invalid="!!accountValidationErrors[acc.id]?.label"
          v-model="acc.label"
          :placeholder="`Метка1${accountConfig.labelDevider} Метка2`"
          @blur="handleAccountInputChange(acc)"
        />
        <Select
          v-model="acc.type"
          @update:model-value="(value: AcceptableValue) => handleAccountTypeChange(value, acc.id)"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Тип записи" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="AccountType.LDAP"> LDAP </SelectItem>
              <SelectItem :value="AccountType.LOCAL"> Локальная </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          :invalid="!!accountValidationErrors[acc.id]?.login"
          :class="{ 'col-span-2': acc.type !== AccountType.LOCAL }"
          v-model="acc.login"
          type="text"
          placeholder="Логин"
          @blur="handleAccountInputChange(acc)"
        />
        <Input
          v-show="acc.type === AccountType.LOCAL"
          :invalid="!!accountValidationErrors[acc.id]?.password"
          v-model="acc.password"
          type="password"
          placeholder="Пароль"
          @blur="handleAccountInputChange(acc)"
        />
        <Button size="icon" variant="ghost" @click="handleDeleteClick(acc.id)">
          <DeleteIcon />
        </Button>
      </template>
    </div>
  </div>
</template>
