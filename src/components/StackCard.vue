<template>
  <div class="rounded p-6 text-center mx-auto popout">
    <a :href="item.href" class="flex flex-col dark:bg-transparent mx-auto text-center hover:underline no-underline underline-offset-8 text-orange-400"
    target="_blank"
    rel="noopener noreferrer">
    <img class="h-20 w-20 shadow rounded-full object-cover mx-auto"
        :src="item.photo"
        :alt="item.name"/>
    <span class="mt-2 mb-6 py-2 px-4 text-neutral-500 dark:text-neutral-200 tracking-wide" v-text="item.name">
    </span>
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

<style lang="stylus" scoped>
.popout:hover img{
  @apply transition ease-in-out delay-100 -translate-y-1 duration-300 shadow-xl
}
//img{
//  content: ' ';
//  background-image: url(http://www.icons101.com/icons/71/Simplynotblack_Addition_by_ibaaan/128/terminal.png);
//}
</style>
