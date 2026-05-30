<script></script>

<template>
    <footer class="border-t border-gray-200 dark:border-gray-800 mt-20">
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">

      <!-- Brand -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
          <UIcon name="i-lucide-activity" class="w-5 h-5" />
        </div>

        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            Momentum
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Build consistency, one day at a time.
          </p>
        </div>
      </div>

      <!-- Links -->
      <div class="flex items-center gap-5">
        <a
          href="https://github.com/RifkyA911"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-gray-500 hover:text-primary-500 transition-colors"
        >
          <UIcon name="i-lucide-user-round" class="w-4 h-4" />
          <span>RifkyA911</span>
        </a>

        <a
          href="https://github.com/RifkyA911/Momentum-Habit-Tracker-Plan"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-gray-500 hover:text-primary-500 transition-colors"
        >
          <UIcon name="i-lucide-github" class="w-4 h-4" />
          <span>Repository</span>
        </a>
      </div>
    </div>

    <!-- Bottom -->
    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <UIcon name="i-lucide-heart" class="w-4 h-4 text-red-500" />
        <span>
          © {{ new Date().getFullYear() }} Momentum AI
        </span>
      </div>
    </div>
  </div>
</footer>
</template>