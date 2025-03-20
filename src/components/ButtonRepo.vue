<template>
  <div class="ml-3 inline-flex rounded-md shadow">
    <a
      target="_blank"
      :href="repoUrl"
      class="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium leading-6 text-indigo-600 transition duration-150 ease-in-out hover:text-indigo-500 focus:outline-none"
      >{{ buttonText }}</a
    >
  </div>
</template>

<script setup lang="ts">
interface ButtonRepoProps {
  /**
   * Repository URL to link to
   */
  repoUrl: string;
  
  /**
   * Text to display on the button
   */
  buttonText?: string;
}

// Define props with TypeScript interface and default values
const props = withDefaults(defineProps<ButtonRepoProps>(), {
  buttonText: 'Learn more'
});
</script>
