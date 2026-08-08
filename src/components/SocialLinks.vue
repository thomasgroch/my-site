<script setup>
defineProps({
  profiles: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="py-5 flex space-x-3 justify-center text-sm text-center px-5">
    <a
      v-for="profile in profiles"
      :key="profile.network"
      class="dark:hover:bg-transparent px-2"
      :href="profile.url"
      target="_blank"
    >
      <font-awesome-icon
        :icon="['fab', profile.network]"
        class="fa-2x text-neutral-500 hover:text-green-300 dark:bg-transparent px"
      />
    </a>
  </div>
</template>
