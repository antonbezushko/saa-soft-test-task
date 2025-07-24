<script setup lang="ts">
import { onMounted } from 'vue'
import AccountFormHeader from '@/components/accounts/AccountFormHeader.vue'
import { useAccountStore } from '@/stores/account.store'
import AccountTable from '@/components/accounts/AccountTable.vue'

const { loadAccounts, addTempAccount } = useAccountStore()

onMounted(() => {
  loadAccounts()
})
</script>

<template>
  <div class="max-w-5xl mx-auto mt-20 border border-gray-200 md:p-8 md:pb-4 p-4 rounded-2xl">
    <AccountFormHeader @add="addTempAccount" />
    <AccountTable />
  </div>
</template>
