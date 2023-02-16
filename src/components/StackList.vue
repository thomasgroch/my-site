<script setup>
import StackCard from '@/components/StackCard.vue'
</script>

<template>
  <div class="flex flex-wrap w-full self-center justify-center">
      <StackCard v-for="s in stack" :item="s"></StackCard>
  </div>
</template>

<script>
export default {
  name: "StackList",
  props: {
    stack: {
      type: Array,
      default: function () {
        return []
      }
    },
  },
  data() {
    return {}
  }
}
</script>
<style lang="stylus">
h3:hover span {
  @apply underline;
}
</style>
