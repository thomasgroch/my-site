<template>
  <div>
    <div class="flex flex-col">
      <a :href="googleUrl" target="_blank">Add to Google Calendar</a>
      <!-- <a :href="outlookUrl" target="_blank">Add to Outlook Calendar</a>
      <a :href="appleUrl" target="_blank">Add to Apple Calendar</a>
      <a :href="yahooUrl" target="_blank">Add to Yahoo Calendar</a>
      <a :href="emailUrl" target="_blank">Email Event</a> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['event'])

const googleUrl = computed(() => {
  return 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(props.event.title) +
    '&dates=' + encodeURIComponent(props.event.start) + '/' + encodeURIComponent(props.event.end) +
    '&details=' + encodeURIComponent(props.event.description) +
    '&location=' + encodeURIComponent(props.event.location);
});

// Removed calendar URL variables that were not being used
// To re-add support for other calendar providers, uncomment the corresponding
// template elements and re-implement these computed properties
</script>