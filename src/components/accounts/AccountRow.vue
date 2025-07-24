<script setup lang="ts">
import DeleteIcon from '@/components/icons/DeleteIcon.vue'
import Button from '@/components/ui/button/AppButton.vue'
import Input from '@/components/ui/input/AppInput.vue'
import Select from '@/components/ui/select/AppSelect.vue'
import SelectContent from '@/components/ui/select/AppSelectContent.vue'
import SelectGroup from '@/components/ui/select/AppSelectGroup.vue'
import SelectItem from '@/components/ui/select/AppSelectItem.vue'
import SelectTrigger from '@/components/ui/select/AppSelectTrigger.vue'
import SelectValue from '@/components/ui/select/AppSelectValue.vue'
import { accountConfig } from '@/config/account.config'
import {
  AccountType,
  isAccountType,
  type Account,
  type AccountValidationValue,
} from '@/types/account.type'
import type { AcceptableValue } from 'reka-ui'
import { computed } from 'vue'

interface Props {
  account: Account
  invalidFields?: AccountValidationValue
}

const props = defineProps<Props>()
const { account, invalidFields } = props

const emits = defineEmits({
  save: (account: Account) => account,
  saveTypeChange: (accountType: AccountType, id: Account['id']) => {
    return [accountType, id]
  },
  ['update:account']: (account: Account) => {
    return account
  },
  delete: (account: Account) => account,
})

const localAccount = computed({
  get: () => props.account,
  set: (value) => emits('update:account', value),
})

function handleAccountTypeChange(v: AcceptableValue) {
  if (isAccountType(v)) {
    emits('saveTypeChange', v, account.id)
  }
}
</script>

<template>
  <Input
    :invalid="!!invalidFields?.label"
    v-model="localAccount.label"
    :placeholder="`Метка1${accountConfig.labelDevider} Метка2`"
    @blur="$emit('save', props.account)"
  />
  <Select v-model="localAccount.type" @update:model-value="handleAccountTypeChange">
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
    :invalid="!!props.invalidFields?.login"
    :class="{ 'col-span-2': localAccount.type !== AccountType.LOCAL }"
    v-model="localAccount.login"
    type="text"
    placeholder="Логин"
    @blur="$emit('save', localAccount)"
  />
  <Input
    v-show="localAccount.type === AccountType.LOCAL"
    :invalid="!!props.invalidFields?.password"
    v-model="localAccount.password"
    type="password"
    placeholder="Пароль"
    @blur="$emit('save', localAccount)"
  />
  <Button size="icon" variant="ghost" @click="$emit('delete', props.account)">
    <DeleteIcon />
  </Button>
</template>
