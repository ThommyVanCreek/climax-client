<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
    <NavBar />
    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      <RouterView />
    </main>
  </div>
</template>
