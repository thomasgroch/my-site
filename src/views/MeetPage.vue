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
    if (!props.date) return new Date()
    const parts = props.date.split('-').map(p => parseInt(p, 10))
    // parts: [year, month, day, hour, minute]
    // Note: month is 0-indexed in Date constructor
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0)
  })

  const now = ref(new Date())
  let timer;

  const itIsTime = computed(() => {
    return eventTime.value <= now.value
  })

  const timeDiff = computed(() => {
    const diff = eventTime.value - now.value
    return diff > 0 ? diff : 0
  })

  const days = computed(() => Math.floor(timeDiff.value / (1000 * 60 * 60 * 24)))
  const hours = computed(() => Math.floor((timeDiff.value / (1000 * 60 * 60)) % 24))
  const minutes = computed(() => Math.floor((timeDiff.value / (1000 * 60)) % 60))
  const seconds = computed(() => Math.floor((timeDiff.value / 1000) % 60))

  onMounted(() => {
    if ( !props.date ) {
      return
    }
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000);
  });
  onUnmounted(() => {
    clearInterval(timer);
  });
</script>