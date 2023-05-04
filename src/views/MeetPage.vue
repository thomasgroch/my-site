<template>
  <div class="bg-white dark:bg-neutral-500 p-3 my-3 rounded-md drop-shadow-xl">
  <main class="mt-5 flex flex-col items-center justify-center">
    
    <div v-if="props.nome">
      <div class="flex flex-col items-center justify-center">
        <Logo />
        <p class="text-base font-bold pt-5">{{ $t('meet.' + meetType) }} Confirmed</p>
        <p class="text-base pb-3 pt-2">You are scheduled with Thomas Groch.</p>
      </div>

      <hr class="py-3" />

      <div class="w-2/3 mx-auto">
        <span class="flex font-bold pb-1" v-if="props.date">
          <ChatBubbleLeftIcon class="h-7 w-7 mr-2 text-blue-500"/>
          {{ nomeParsed }}
        </span>

        <span class="flex text-neutral-500 pb-1" v-if="props.date">
          <CalendarIcon class="h-7 w-7 mr-2 text-blue-500"/>
          {{ meetDate }} às {{ meetTime }}
          <a :href="icsLink" download="evento.ics" v-if="props.date">Arquivo ICS</a>
        </span>

        <span class="flex text-neutral-500 pb-1" v-if="props.date">
          <GlobeAltIcon class="h-7 w-7 mr-2 text-blue-500"/>
          {{ $route.path }}
        </span>
        <span class="flex text-neutral-500 pb-1" v-if="props.date">
          <VideoCameraIcon class="h-7 w-7 mr-2 text-blue-500"/>
          Web conferencing details to follow.
        </span>
      </div>

      <div class="py-3">
        <p>A confirmation has been sent to your email address.</p>

        <div v-if="props.date && ! itIsTime" class="w-full">
          Faltam {{ days }} dias, {{ hours }} horas, {{ minutes }} minutos e {{ seconds }} segundos.
        </div>
      </div>

      <hr class="py-3" />

      <JitsiMeeting
      v-if="props.date && itIsTime || ! props.date"
      class="mb-20 w-52 justify-center dark:bg-neutral-800 py-5 rounded-md"
      domain="meet.jit.si"
      :room-name="props.nome"
      height="700px"
      />
    </div>

    <MeetForm v-else />
</main>
</div>
</template>

<script setup>
  import Logo from '@/components/Logo.vue'
  import { reactive, ref, defineProps, computed, onMounted, onUnmounted } from "vue"
  import { JitsiMeeting } from "@jitsi/vue-sdk"
  import nprogress from 'nprogress'
  import { useRouter } from 'vue-router'
  import { parse, formatISO, addHours, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInYears, setDefaultOptions, format, differenceInMonths, differenceInDays, addDays, addMonths } from 'date-fns'
  import MeetForm from '@/components/MeetForm.vue'
  import { CalendarIcon, ChatBubbleLeftIcon, GlobeAltIcon, VideoCameraIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const currentPath = computed(() => router.path)

  const props = defineProps({
    nome: {
      type: String
    },
    date: {
      type: String
    }
  })
  const meetType = computed(() => {
    return router.currentRoute.value.path.substring(1).split('/')[0]
  })
  const nomeParsed = computed(() => props.nome.replace(/-/g, " "))
  const meetDate = computed(() => props.date && props.date.split('-').length >= 3 ? `${props.date.split('-')[2]}/${props.date.split('-')[1]}/${props.date.split('-')[0]}` : '')
  const meetTime = computed(() => props.date && props.date.split('-').length >= 5 ? `${props.date.split('-')[3]}:${props.date.split('-')[4]}` : '')
  
  const eventTime = ref(parse(`${meetDate.value} ${meetTime.value}`, 'dd/MM/yyyy HH:mm', new Date()))
  const event = ref({
    title: props.nome,
    start: "2023-04-22T09:00:00Z",
    end: "2023-04-22T10:00:00Z",
    location: "Local do Evento",
    description: "Descrição do Evento"
  });

  const icsLink = computed(() => {

    const icsStartDateString = formatISO(new Date(eventTime.value), { representation: "complete" });
    const oneHourLaterString = formatISO(addHours(new Date(eventTime.value), 1), { representation: "complete" });
    const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.value.title}
DTSTART:${icsStartDateString}
DTEND:${oneHourLaterString}
LOCATION:${event.value.location}
DESCRIPTION:${event.value.description}
END:VEVENT
END:VCALENDAR`;
console.log(calendarData)

    const encodedData = encodeURIComponent(calendarData);
    const link = `data:text/calendar;charset=utf-8,${encodedData}`;
    return link
  })
  
  const days = ref(0);
  const hours = ref(0);
  const minutes = ref(0);
  const seconds = ref(0);
  let timer;

  const itIsTime = computed(() => {
    const now = new Date();
    const timeToCheck = eventTime.value
    if (timeToCheck < now) {
      console.log('The time has passed.');
      return true
    } else {
      console.log('The time has not passed yet.');
      return false
    }
  })

  onMounted(() => {
    if ( !props.date ) {
      return ''
    }
    const futureDate = new Date(parse(`${meetDate.value} ${meetTime.value}`, 'dd/MM/yyyy HH:mm', new Date()));
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
</script>