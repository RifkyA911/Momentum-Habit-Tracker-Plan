<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { data: session } = await useFetch('/api/auth/get-session', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
})

const username = ref(session.value?.user?.name || '')
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleSave = async () => {
  if (!username.value.trim()) {
    errorMessage.value = 'Username cannot be empty'
    return
  }
  
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const { error } = await authClient.updateUser({
      name: username.value
    })
    
    if (error) {
      errorMessage.value = error.message || 'Failed to update username'
    } else {
      successMessage.value = 'Username updated successfully'
      setTimeout(() => { successMessage.value = '' }, 3000)
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Account Settings</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account details and preferences.</p>
    </div>

    <div class="space-y-6">
      <!-- Profile Section -->
      <UCard class="shadow-sm">
        <template #header>
          <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">Profile Information</h2>
          <p class="text-sm leading-6 text-gray-500 dark:text-gray-400">Update your account's profile information.</p>
        </template>

        <div class="space-y-6">
          <!-- Alert Messages -->
          <UAlert v-if="successMessage" icon="i-lucide-check-circle" color="green" variant="subtle" :title="successMessage" class="mb-4" />
          <UAlert v-if="errorMessage" icon="i-lucide-alert-circle" color="red" variant="subtle" :title="errorMessage" class="mb-4" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <!-- Profile Picture -->
            <div class="flex items-start gap-x-4">
              <UAvatar :src="session?.user?.image || undefined" :alt="session?.user?.name || 'User'" size="xl" />
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <UButton color="neutral" variant="soft" disabled size="sm">
                    Change Avatar
                  </UButton>
                  <UBadge size="sm" color="primary" variant="subtle">Coming Soon</UBadge>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max 2MB.</p>
              </div>
            </div>            
              <div class="flex flex-col gap-4">
                <!-- Username (Editable) -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Full Name / Username</label>
                  <UInput
                    v-model="username"
                    type="text"
                    placeholder="Enter your name"
                    icon="i-lucide-user"
                    class="w-full"
                  />
                </div>
                <!-- Email Address (Readonly) -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</label>
                  <UInput
                    :model-value="session?.user?.email"
                    type="email"
                    disabled
                    icon="i-lucide-mail"
                    class="w-full"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400">Your email address is used for login and cannot be changed here.</p>
                </div>

    
              </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton type="submit" color="primary" :loading="isSaving" @click="handleSave">
              Save Changes
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- Security Section -->
      <UCard class="shadow-sm">
        <template #header>
          <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">Security</h2>
          <p class="text-sm leading-6 text-gray-500 dark:text-gray-400">Manage your password and security preferences.</p>
        </template>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Update your password associated with this account.</p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge size="sm" color="primary" variant="subtle">Coming Soon</UBadge>
              <UButton color="neutral" variant="soft" disabled>
                Update
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
