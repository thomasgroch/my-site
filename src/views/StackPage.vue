<script setup>
import StackList from '@/components/StackList.vue'
import resume from "~/resume.json";

const stacks = resume.stack

const sections = [
  { title: 'Back', key: 'back', descriptionKey: 'general.stack_description_1' },
  { title: 'Front', key: 'front', descriptionKey: 'general.stack_description_2' },
  { title: 'DB', key: 'database', descriptionKey: 'general.stack_description_3' },
  { title: 'Infra', key: 'infra', descriptionKey: 'general.stack_description_4' },
  { title: 'Misc', key: 'misc', descriptionKey: 'general.stack_description_5' },
]
</script>

<script>
export default {
  name: "StackPage",
  metaInfo: {
    title: 'Stack',
  }
}
</script>

<template>
  <div class="my-5">
    <div v-for="section in sections" :key="section.key">
      <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">{{ section.title }}</h3>
      <p class="text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200">{{ $t(section.descriptionKey) }}</p>
      <StackList :stack="stacks[section.key]" />
    </div>
  </div>
</template>
