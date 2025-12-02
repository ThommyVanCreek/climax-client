<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Sensors', path: '/sensors', icon: '📡' },
  { name: 'Climate', path: '/climate', icon: '🌡️' },
  { name: 'History', path: '/history', icon: '📊' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
]
</script>

<template>
  <!-- Desktop Header -->
  <header class="hidden md:block sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-dark-700/50">
    <div class="container mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-climax-400 to-climax-600 flex items-center justify-center">
            <span class="text-xl">🔐</span>
          </div>
          <span class="font-bold text-xl text-gray-900 dark:text-white">ClimaX</span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="flex items-center gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            :class="route.path === item.path 
              ? 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800'"
          >
            {{ item.name }}
          </RouterLink>
        </nav>
      </div>
    </div>
  </header>

  <!-- Mobile Header (logo only) -->
  <header class="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-dark-700/50">
    <div class="flex items-center justify-center h-14">
      <RouterLink to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-climax-400 to-climax-600 flex items-center justify-center">
          <span class="text-base">🔐</span>
        </div>
        <span class="font-bold text-lg text-gray-900 dark:text-white">ClimaX</span>
      </RouterLink>
    </div>
  </header>

  <!-- Mobile Bottom Navigation -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-dark-700/50 safe-area-inset-bottom">
    <div class="flex items-center justify-around h-16 px-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]"
        :class="route.path === item.path 
          ? 'text-climax-500' 
          : 'text-gray-400 dark:text-gray-500'"
      >
        <span class="text-xl mb-0.5">{{ item.icon }}</span>
        <span class="text-[10px] font-medium">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
