<template>
  <div class="rounded p-6 text-center mx-auto">
    <a :href="item.href" class="flex flex-col dark:bg-transparent mx-auto text-center hover:underline no-underline underline-offset-8 text-green-400"
    target="_blank"
    rel="noopener noreferrer">

      <div class="mx-auto flex justify-center w-20">
        <img class="object-contain object-center p-2 h-20 rounded-full bg-neutral-100 dark:bg-neutral-700"
            :src="item.photo"
            :alt="item.name"/>
      </div>
      <span class="mt-2 mb-6 py-2 px-4 text-neutral-500 dark:text-neutral-200 tracking-wide">{{ item.name }}</span>

    </a>
  </div>
</template>

<script setup lang="ts">
// Define interface for technology stack item
interface TechnologyItem {
  name: string;
  photo: string;
  href: string;
}

// Define props with TypeScript interface
withDefaults(defineProps<{
  item: TechnologyItem;
}>(), {
  item: () => ({
    name: '',
    photo: '',
    href: ''
  })
});
</script>

