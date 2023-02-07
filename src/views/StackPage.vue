<script setup xmlns="http://www.w3.org/1999/html" xmlns:p="http://www.w3.org/1999/html">
import StackList from '@/components/StackList.vue'
</script>

<template>
  <div class="my-5">
    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Back</h3>
    <p class="text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200"> {{ $t('general.stack_description_1') }}</p>
    <StackList :stack="stacks.back" />

    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Front</h3>
    <p class="text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200"> {{ $t('general.stack_description_2') }}</p>
    <StackList :stack="stacks.front" />
    
    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">DB</h3>
    <p class="text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200">{{ $t('general.stack_description_3') }}</p>
    <StackList :stack="stacks.database" />

    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Infra</h3>
    <p class="text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200">{{ $t('general.stack_description_4') }}</p>
    <StackList :stack="stacks.infra" />

    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Misc</h3>
    <p class="text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200">{{ $t('general.stack_description_5') }}</p>
    <StackList :stack="stacks.misc" />
  </div>
</template>

<script>
import resume from "~/resume.json";

export default {
  name: "StackPage",
  metaInfo: {
    title: 'Stack',
  },
  data() {
    return {
      stacks: resume.stack
    }
  }
}
</script>
