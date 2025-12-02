<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NavBar />
    <main class="container mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
