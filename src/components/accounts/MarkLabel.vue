<script setup lang="ts">
import QuestionIcon from '@/components/icons/QuestionIcon.vue'
</script>

<template>
  <div class="flex items-center space-x-4 py-4 px-2 bg-secondary rounded-2xl">
    <div class="rounded-full border-2 border-primary flex items-center justify-center w-6 h-6">
      <QuestionIcon class="shrink-0 w-3 fill-primary" />
    </div>
    <p class="flex-1">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ";"
    </p>
  </div>
</template>
