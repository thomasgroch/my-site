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
  // ⚡ Bolt: Removed date-fns to reduce bundle size. Using native Date API instead.
  // import { parse, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
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
  
  // ⚡ Bolt: Native Date parsing from YYYY-MM-DD-HH-mm format
  const eventTime = computed(() => {
    if (!props.date) return new Date();
    const parts = props.date.split('-').map(Number);
    if (parts.length < 5) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
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
      return true
    } else {
      return false
    }
  })

  onMounted(() => {
    if ( !props.date ) {
      return
    }

    const futureDate = eventTime.value;
    timer = setInterval(() => {
      const now = new Date();
      // ⚡ Bolt: Native time difference calculation
      const diffMs = futureDate - now;

      if (diffMs <= 0) {
        days.value = 0;
        hours.value = 0;
        minutes.value = 0;
        seconds.value = 0;
        return;
      }

      const diffSec = Math.floor(diffMs / 1000);
      days.value = Math.floor(diffSec / (24 * 3600));
      hours.value = Math.floor((diffSec % (24 * 3600)) / 3600);
      minutes.value = Math.floor((diffSec % 3600) / 60);
      seconds.value = Math.floor(diffSec % 60);
    }, 1000);
  });
  onUnmounted(() => {
    clearInterval(timer);
  });
</script>