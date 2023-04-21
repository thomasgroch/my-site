<template>
  <main class="mt-5 flex flex-col items-center justify-center">
    <h3 class="py-5">{{ $t('meet.' + $route.path.substring(1).split('/')[0]) }}</h3>
    <div v-if="nome" class="w-full">
      
      <h2 class="text-lg pb-5 px-3">{{ nomeParsed }}. <span class="text-xs italic text-gray-100">({{ meetDate }} às {{ meetTime }})</span></h2>

      <div v-if="props.date && ! itIsTime" class="w-full">
        Faltam {{ days }} dias, {{ hours }} horas, {{ minutes }} minutos e {{ seconds }} segundos.
      </div>
  
      <JitsiMeeting
        v-if="itIsTime"
        class="mb-20 justify-center dark:bg-neutral-800 py-5 rounded-md"
        domain="meet.jit.si"
        :room-name="nome"
        width="100%"
        height="700px"
      />
    </div>

    <form class="w-full max-w-md"
          v-else 
          :action="formAction"
          @submit.prevent="submit"
          name="meet"
          method="post"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          netlify>
      <input type="hidden" name="form-name" value="meet" />
      <div class="flex flex-wrap justify-center dark:bg-neutral-800 py-5 px-8 rounded-md">
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

          <div class="w-full flex items-center justify-center px-3 my-6 md:mb-0 p-5">
            <button
              class="rounded border-2 font-medium px-8 py-2.5 text-base bg-transparent text-neutral-500 border-green-300 shadow-xs dark:hover:text-green-400 dark:shadow-white dark:text-neutral-200 dark:border-neutral-200 dark:hover:bg-neutral-700 dark:hover:border-neutral-700 hover:drop-shadow-lg hover:bg-green-100 hover:text-green-400 hover:border-green-100"
              type="submit">{{ $t('meet.submit') }}
            </button>
        </div>
      </div>
    </div>
  </form>
</main>
</template>

<script setup>
import { reactive, ref, defineProps, computed, onMounted, onUnmounted } from "vue"
import { JitsiMeeting } from "@jitsi/vue-sdk"
import nprogress from 'nprogress'
import { useRouter } from 'vue-router'
import { parse, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInYears, setDefaultOptions, format, differenceInMonths, differenceInDays, addDays, addMonths } from 'date-fns'

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
const nomeParsed = computed(() => props.nome.replace(/-/g, " "))
const meetDate = computed(() => props.date.split('-').length >= 3 ? `${props.date.split('-')[2]}/${props.date.split('-')[1]}/${props.date.split('-')[0]}` : '')
const meetTime = computed(() => props.date.split('-').length >= 5 ? `${props.date.split('-')[3]}:${props.date.split('-')[4]}` : '')


const futureDate = new Date(parse(`${meetDate.value} ${meetTime.value}`, 'dd/MM/yyyy HH:mm', new Date()));
const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
let timer;

const itIsTime = computed(() => {
  const now = new Date();
  const timeToCheck = parse(`${meetDate.value} ${meetTime.value}`, 'dd/MM/yyyy HH:mm', new Date())
  if (timeToCheck < now) {
    console.log('The time has passed.');
    return true
  } else {
    console.log('The time has not passed yet.');
    return false
  }
})

onMounted(() => {
  timer = setInterval(() => {
    const now = new Date();
    const timeDifferenceInSeconds = differenceInSeconds(futureDate, now);
    const timeDifferenceInMinutes = differenceInMinutes(futureDate, now);
    const timeDifferenceInHours = differenceInHours(futureDate, now);
    const timeDifferenceInDays = differenceInDays(futureDate, now);

    days.value = Math.floor(timeDifferenceInDays);
    hours.value = Math.floor(timeDifferenceInHours % 24);
    minutes.value = Math.floor(timeDifferenceInMinutes % 60);
    seconds.value = Math.floor(timeDifferenceInSeconds % 60);
  }, 1000);
});
onUnmounted(() => {
  clearInterval(timer);
});

const errors = ref({
  has: () => {
    return false
  }
})

const router = useRouter()
const currentPath = computed(() => router.path)

const submit = () => {
  let result = false
  let response
  try {
    nprogress.start()
    const url = router.currentRoute.value.path.substring(1) + `/${form.value.nome}/${form.value.date}-${form.value.time.replace(/:/g, '-')}` 
    
    console.log(url)
    router.push(url)
    // response = await fetch(this.formAction, {
    //   method: 'POST',
    //   body: JSON.stringify(this.$data.form)
    // })
    //   return
    // }
  } catch (error) {
    console.log(error)
    nprogress.done()
    return
  }
  nprogress.done()
  return true
}

const formAction = computed(() => (process.env.NODE_ENV === 'production') ? '/.netlify/functions/meet' : 'http://localhost:8888/.netlify/functions/meet')
</script>

<style type="text/css" scoped>
</style>