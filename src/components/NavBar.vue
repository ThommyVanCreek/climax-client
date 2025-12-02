<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/', icon: '🏠' },
  { name: 'Sensors', path: '/sensors', icon: '📡' },
  { name: 'Climate', path: '/climate', icon: '🌡️' },
  { name: 'History', path: '/history', icon: '📊' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
]
</script>

<template>
  <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔐</span>
          <span class="font-bold text-xl text-climax-600 dark:text-climax-400">ClimaX</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="route.path === item.path 
              ? 'bg-climax-100 dark:bg-climax-900/30 text-climax-700 dark:text-climax-300' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <span class="mr-2">{{ item.icon }}</span>
            {{ item.name }}
          </RouterLink>
        </div>

        <!-- Mobile menu button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span class="text-xl">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="mobileMenuOpen = false"
          class="block px-4 py-3 rounded-lg text-sm font-medium mb-1"
          :class="route.path === item.path 
            ? 'bg-climax-100 dark:bg-climax-900/30 text-climax-700 dark:text-climax-300' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          <span class="mr-2">{{ item.icon }}</span>
          {{ item.name }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
