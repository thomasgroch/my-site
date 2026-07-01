<template>
  <div class="bg-white dark:bg-neutral-700 p-3 my-3 rounded-md drop-shadow-xl">
  <main class="mt-5 flex flex-col items-center justify-center">

    <div v-if="props.nome" class="w-full px-5 pb-5">
      <div class="flex flex-col items-center justify-center">
        <Logo class="!h-20" />
        <p class="text-base font-bold pt-5">{{ $t('meet.' + meetType) }} {{ $t('meet.confirmed') }}</p>
        <p class="text-base pb-3 pt-2">{{ $t('meet.you-are-scheduled-with') }} Thomas Groch.</p>
      </div>

      <div class="px-2 pt-5 w-96 mx-auto">
        <div>
          <span class="flex font-bold pb-1" v-if="props.date">
            <ChatBubbleLeftIcon class="h-7 w-7 mr-2 text-blue-500"/>
            {{ nomeCapitalized }}
          </span>

          <span class="flex text-neutral-500 pb-1" v-if="props.date">
            <CalendarIcon class="h-7 w-7 mr-2 text-blue-500"/>
            {{ meetDate }} às {{ meetTime }}
            <!-- <Ics :event="event" /> -->
            <!-- <a :href="googleCalendarLink" target="_blank">Add to Google Calendar</a> -->
          </span>

          <span class="flex text-neutral-500 pb-1" v-if="props.date">
            <GlobeAltIcon class="h-7 w-7 mr-2 text-blue-500"/>
            <a :href="$route.path" target="_blank">{{ $t('meet.conference-link') }}</a>
          </span>
          <span class="flex text-neutral-500 pb-1" v-if="props.date">
            <VideoCameraIcon class="h-7 w-7 mr-2 text-blue-500"/>
            {{ $t('meet.web-conferencing-details-to-follow') }}
          </span>
        </div>

        <div class="py-3">
          <!-- <p>A confirmation has been sent to your email address.</p> -->

          <span v-if="props.date && ! itIsTime" class="w-full">
            Faltam <span v-if="0 !== days">{{ days }} dias, </span>{{ hours }} horas, {{ minutes }} minutos e {{ seconds }} segundos.
          </span>
        </div>
      </div>

      <hr class="py-3" />

      <JitsiMeeting
      v-if="props.date && itIsTime || ! props.date"
      domain="8x8.vc"
      :room-name="props.nome"
      height="700px"
      width="100%"
      />
    </div>

    <MeetForm v-else />
</main>
</div>
</template>

<script setup>
  import Logo from '@/components/Logo.vue'
  import { ref, defineProps, computed, onMounted, onUnmounted } from "vue"
  import { JitsiMeeting } from "@jitsi/vue-sdk"
  import { useRouter } from 'vue-router'
  import MeetForm from '@/components/MeetForm.vue'
  import { CalendarIcon, ChatBubbleLeftIcon, GlobeAltIcon, VideoCameraIcon } from '@heroicons/vue/24/solid'
  
  const router = useRouter()

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
  const nomeCapitalized = computed(() => nomeParsed.value.charAt(0).toUpperCase()   + nomeParsed.value.slice(1))
  const meetDate = computed(() => props.date && props.date.split('-').length >= 3 ? `${props.date.split('-')[2]}/${props.date.split('-')[1]}/${props.date.split('-')[0]}` : '')
  const meetTime = computed(() => props.date && props.date.split('-').length >= 5 ? `${props.date.split('-')[3]}:${props.date.split('-')[4]}` : '')
  
  const eventTime = computed(() => {
    if (!props.date) return new Date();
    const p = props.date.split('-').map(Number);
    if (p.length < 5) return new Date();
    // Native Date: year, month (0-indexed), day, hour, minute
    return new Date(p[0], p[1] - 1, p[2], p[3], p[4]);
  })
  // const icsStartDateString = ref(formatISO(new Date(eventTime.value), { representation: "complete" }))
  // const oneHourLaterString = ref(formatISO(addHours(new Date(eventTime.value), 1), { representation: "complete" }))

  // const event = ref({
  //   title: nomeCapitalized,
  //   start: icsStartDateString.value,
  //   end: oneHourLaterString.value,
  //   location: 'Localasd do Evento',
  //   description: 'Descriçãoasd do Evento',
  // })

  // const googleCalendarLink = computed(() => {

  //   const icsStartDateString = formatISO(new Date(eventTime.value), { representation: "complete" });
  //   const oneHourLaterString = formatISO(addHours(new Date(eventTime.value), 1), { representation: "complete" });

  //   const action = `TEMPLATE` // TEMPLATE (required)
  //   const text = `${event.value.title}` // Title of the event (URL encoded format).
  //   const details = `${event.value.description}` // Event details or description (URL encoded format).
  //   const dates = `${encodeURIComponent(icsStartDateString)}/${encodeURIComponent(oneHourLaterString)}` // ISO date format (start_datetime/end_datetime)
  //   const location = `${event.value.location}` // Location of the event (URL encoded format).

  //   return `https://calendar.google.com/calendar/render?action=${action}&text=${text}&details=${details}&dates=${dates}&location=${location}`
  //   // return https://calendar.google.com/calendar/render?action=TEMPLATE&text=My Event&details=Event description text&dates=20220305T103000/20220305T184500&location=New York City
  //   // return link
  // })

//   const icsLink = computed(() => {

//     const icsStartDateString = formatISO(new Date(eventTime.value), { representation: "complete" });
//     const oneHourLaterString = formatISO(addHours(new Date(eventTime.value), 1), { representation: "complete" });
//     const calendarData = `BEGIN:VCALENDAR
// VERSION:2.0
// BEGIN:VEVENT
// SUMMARY:${event.value.title}
// DTSTART:${icsStartDateString}
// DTEND:${oneHourLaterString}
// LOCATION:${event.value.location}
// DESCRIPTION:${event.value.description}
// END:VEVENT
// END:VCALENDAR`;
// console.log(calendarData)

//     const encodedData = encodeURIComponent(calendarData);
//     const link = `data:text/calendar;charset=utf-8,${encodedData}`;
//     return link
//   })
  
  const now = ref(new Date());
  let timer;

  // Bolt: Using native Date arithmetic and computed properties to replace date-fns
  // and consolidate reactivity into a single 'now' ref.
  const days = computed(() => {
    const diff = eventTime.value - now.value;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  });
  const hours = computed(() => {
    const diff = eventTime.value - now.value;
    return Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  });
  const minutes = computed(() => {
    const diff = eventTime.value - now.value;
    return Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  });
  const seconds = computed(() => {
    const diff = eventTime.value - now.value;
    return Math.max(0, Math.floor((diff / 1000) % 60));
  });

  const itIsTime = computed(() => {
    return now.value >= eventTime.value;
  })

  onMounted(() => {
    if (!props.date) {
      return;
    }
    timer = setInterval(() => {
      now.value = new Date();
    }, 1000);
  });
  onUnmounted(() => {
    clearInterval(timer);
  });
</script>