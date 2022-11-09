<template>
  <div class="rounded text-center mx-auto">
    <a :href="item.href" class="flex flex-col dark:bg-transparent mx-auto text-center hover:underline no-underline underline-offset-8 text-green-400"
    target="_blank"
    rel="noopener noreferrer">
      <div class="h-20 w-20 rounded-md mx-auto flex justify-center">
        <img class="object-contain object-center p-2 h-20"
            :src="item.photo"
            :alt="item.name"/>
      </div>
      <span class="mt-2 mb-6 py-2 px-4 text-neutral-500 dark:text-neutral-200 tracking-wide">{{ item.name }}</span>
    </a>
  </div>
</template>

<script>
export default {
  name: "StackCard",

  props: {
    item: {
      type: Object,
      default: function () {
        return {
          name: '',
          photo: '',
          href: ''
        }
      }
    },
  }
};
</script>
