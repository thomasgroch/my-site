<template>
  <main class="mt-5 flex flex-col items-center justify-center">
    <h3 class="py-5">Entrevista</h3>
    <div v-if="nome">
      <p>{{ nome }}</p>
      <p v-if="props.date"> em {{ meetDate }} às {{ meetTime }}</p>
      <JitsiMeeting
        class="flex mb-20 flex-wrap justify-center dark:bg-neutral-800 py-5 px-8 rounded-md"
        domain="meet.jit.si"
        :room-name="nome"
      />
    </div>

    <div v-else class="flex flex-wrap justify-center dark:bg-neutral-800 py-5 px-8 rounded-md">
      <div class="flex flex-wrap -mx-3 mb-2">
        <div class="w-full md:w-full px-3 mb-3 md:mb-0">

          <label class="block tracking-wide text-green-400 text-lg mb-2"
                 for="grid-nome">{{ $t('meet.name') }}</label>
          <input
            class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight  focus:bg-white dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
            :class="{'input': true, 'border-red': errors.has('nome') }"
            name="nome"
            v-model="form.nome"
            id="grid-nome"
            type="text">
          <p class="text-red-500 text-lg italic"
             v-if="errors.has('nome')">{{ errors.first('nome') }}</p>

        </div>
        <div class="w-full md:w-full px-3 mb-3 md:mb-0 pt-5">

          <label class="block tracking-wide text-green-400 text-lg mb-2 capitalize"
                 for="grid-date">{{ $t('meet.date') }}</label>
          <input
            class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight  focus:bg-white dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
            :class="{'input': true, 'border-red': errors.has('date') }"
            name="date"
            v-model="form.date"
            id="grid-date"
            type="date">
          <p class="text-red-500 text-lg italic"
             v-if="errors.has('date')">{{ errors.first('date') }}</p>
          <input
            class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight  focus:bg-white dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
            :class="{'input': true, 'border-red': errors.has('date') }"
            name="time"
            v-model="form.time"
            id="grid-time"
            type="time" />
          <p class="text-red-500 text-lg italic"
           v-if="errors.has('time')">{{ errors.first('time') }}</p>
        </div>
      </div>

    </div>
    <div class="flex items-center justify-center px-3 my-6 md:mb-0 items-center p-5">
      <button
        class="rounded border-2 font-medium px-8 py-2.5 text-base bg-transparent text-neutral-500 border-green-300 shadow-xs dark:hover:text-green-400 dark:shadow-white dark:text-neutral-200 dark:border-neutral-200 dark:hover:bg-neutral-700 dark:hover:border-neutral-700 hover:drop-shadow-lg hover:bg-green-100 hover:text-green-400 hover:border-green-100"
        type="submit">{{ $t('meet.submit') }}
      </button>
    </div>

  </main>
</template>

<script setup>
import { reactive, ref, defineProps, computed } from "vue"
import { JitsiMeeting } from "@jitsi/vue-sdk"

const props = defineProps({
  nome: {
    type: String
  },
  date: {
    type: String
  }
})
const form = ref({
  nome: '',
  date: '',
  time: ''
})
const hasFilled = (field) => {
  return (!errors.value.has(field) && form.value[field])
}

const errors = ref({
  has: () => {
    return false
  }
})

const meetDate = computed(() => props.date.split('-').length >= 3 ? `${props.date.split('-')[2]}/${props.date.split('-')[1]}/${props.date.split('-')[0]}` : '')
const meetTime = computed(() => props.date.split('-').length >= 5 ? `${props.date.split('-')[3]}:${props.date.split('-')[4]}` : '')
</script>