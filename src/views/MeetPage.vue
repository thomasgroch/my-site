<template>
  <main class="mt-5 flex flex-col items-center justify-center">
    <h3 class="py-5">Entrevista</h3>
    <p>{{ nome }}</p>
    <p v-if="props.date"> em {{ meetDate }} às {{ meetTime }}</p>
    <JitsiMeeting
      class="flex mb-20 flex-wrap justify-center dark:bg-neutral-800 py-5 px-8 rounded-md"
      domain="meet.jit.si"
      :room-name="nome"
    />

    <div v-if="!isEmail" class="flex mb-20 flex-wrap justify-center dark:bg-neutral-800 py-5 px-8 rounded-md">
      <div class="flex flex-wrap -mx-3 mb-2">
        <div class="w-full md:w-full px-3 mb-3 md:mb-0">

          <label class="block tracking-wide text-green-400 text-lg mb-2 capitalize"
                 for="grid-nome">{{ $t('contact.name') }}</label>
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
      </div>

      <div class="flex flex-wrap -mx-3 mb-2"
             v-show="hasFilled('nome')">
        <div class="w-full md:w-full px-3 mb-3 md:mb-0">

          <label class="block tracking-wide text-green-400 text-lg mb-2 capitalize"
                 for="grid-date">{{ $t('contact.date') }}</label>
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
            name="date"
            v-model="form.date"
            id="grid-date"
            type="time" />
        </div>
      </div>


    </div>

  </main>
</template>

<script setup>
import { reactive, ref, defineProps, computed } from "vue"
import { JitsiMeeting } from "@jitsi/vue-sdk"

const props = defineProps({
  nome: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: false
  }
})
const form = ref({
  nome: '',
  date: ''
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