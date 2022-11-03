<script setup xmlns="http://www.w3.org/1999/html" xmlns:p="http://www.w3.org/1999/html">
import StackList from '@/components/StackList.vue'
</script>

<template>
  <div class="my-5">
    <p class="text-base indent-2 pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200"> {{ $t('general.stack_description_1') }}</p>
    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Front</h3>
    <StackList :stack="stacks.front" />
    <p class="indent-2  text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200"> {{ $t('general.stack_description_2') }}
    </p>
    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Back</h3>
    <StackList :stack="stacks.back" />
    <p class="indent-2  text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200">{{ $t('general.stack_description_3') }}</p>

    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">DB</h3>
    <StackList :stack="stacks.database" />
    <p class="text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200 indent-2">{{ $t('general.stack_description_4') }}</p>


    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Infra</h3>
    <StackList :stack="stacks.infra" />
    <p class="indent-2 text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200">{{ $t('general.stack_description_5') }}</p>


    <h3 class="mb-5 p-0 font-semibold text-neutral-500 dark:text-neutral-200 md:w-1/4">Misc</h3>
    <StackList :stack="stacks.misc" />
    <p class="indent-2  text-base pb-5 leading-normal tracking-wide text-neutral-500 dark:text-neutral-200">{{ $t('general.stack_description_6') }}
    </p>
  </div>
</template>

<script>
import info from "@/info.json";

export default {
  name: "StackPage",
  metaInfo: {
    title: 'Stack',
  },
  data() {
    return {
      stacks: info.techs.stacks
    }
  }
}
</script>
