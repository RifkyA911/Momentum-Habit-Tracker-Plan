<script setup lang="ts">
import Footer from './footer.vue';

</script>

<template>
  <div>
    <!-- Minimal Header for Landing Page -->
    <header class="absolute top-0 inset-x-0 z-50 bg-transparent">
      <div class="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <UIcon name="i-lucide-activity" class="w-7 h-7 text-primary-500" />
          <span class="text-2xl font-bold tracking-tight">Momentum</span>
        </NuxtLink>
        
        <NavbarAuth />
      </div>
    </header>

    <main>
      <slot />
    </main>
    
    <!-- Minimal Footer -->
    <Footer />
  </div>
</template>
