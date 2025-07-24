<script setup lang="ts">
import Button from '@/components/ui/button/AppButton.vue'

defineEmits({
  add: () => {
    return true
  },
})
</script>

<template>
  <div class="flex justify-between items-center flex-wrap gap-4 px-2">
    <div>
      <h2 class="text-lg font-semibold">Учетные записи</h2>
      <p class="text-sm mt-2 text-gray-600">
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель ";"
      </p>
    </div>
    <Button class="font-bold" variant="default" @click="$emit('add')">Добавить </Button>
  </div>
</template>
