<script setup lang="ts">
import { ref } from 'vue'

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
import { RecordType } from '@/types'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'

const recordType = ref<RecordType>(RecordType.LDAP)
</script>

<template>
  <div class="max-w-5xl mx-auto pt-20">
    <div class="flex items-baseline">
      <h2 class="mr-4 text-2xl font-semibold leading-none">Учетные записи</h2>
      <Button class="font-bold" variant="outline">+</Button>
    </div>
    <MarkLabel class="mt-4" />
    <div class="mt-8 grid grid-cols-[3fr_2fr_3fr_3fr_40px] gap-y-4 gap-x-2 items-center">
      <!-- Label row -->
      <Label>Метки</Label>
      <Label>Тип записи</Label>
      <Label>Логин</Label>
      <Label>Пароль</Label>
      <div></div>
      <!-- Input rows   -->
      <Input type="email" placeholder="Метки" />
      <Select v-model="recordType">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Тип записи" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem :value="RecordType.LDAP"> LDAP </SelectItem>
            <SelectItem :value="RecordType.LOCAL"> Локальная </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input type="email" placeholder="Логин" />
      <Input type="password" placeholder="Пароль" />
      <div>
        <Button size="icon" variant="ghost"><DeleteIcon /></Button>
      </div>
    </div>
  </div>
</template>
