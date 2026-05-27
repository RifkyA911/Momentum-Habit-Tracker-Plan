<template>
  <div>
    <!-- Minimal Header for Landing Page -->
    <header class="absolute top-0 inset-x-0 z-50 bg-transparent">
      <div class="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <UIcon name="i-lucide-activity" class="w-7 h-7 text-primary-500 shrink-0" />
          <span class="hidden sm:inline text-2xl font-bold tracking-tight">Momentum</span>
        </NuxtLink>
        
        <NavbarAuth />
      </div>
    </header>

    <main>
      <slot />
    </main>
    
    <!-- Minimal Footer -->
    <footer class="py-10 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 mt-20">
      <p>© {{ new Date().getFullYear() }} Momentum. Build consistency.</p>
    </footer>
  </div>
</template>
