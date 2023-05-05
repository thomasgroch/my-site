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
import { ref, computed } from 'vue';
const props = defineProps(['event'])

const googleUrl = computed(() => {
  return 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(props.event.title) +
    '&dates=' + encodeURIComponent(props.event.start) + '/' + encodeURIComponent(props.event.end) +
    '&details=' + encodeURIComponent(props.event.description) +
    '&location=' + encodeURIComponent(props.event.location);
});

const outlookUrl = computed(() => {
  return 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent' +
    '&subject=' + encodeURIComponent(props.event.title) +
    '&startdt=' + encodeURIComponent(props.event.start) +
    '&enddt=' + encodeURIComponent(props.event.end) +
    '&body=' + encodeURIComponent(props.event.description) +
    '&location=' + encodeURIComponent(props.event.location);
});

const appleUrl = computed(() => {
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(
    'BEGIN:VCALENDAR\n' +
    'VERSION:2.0\n' +
    'BEGIN:VEVENT\n' +
    'URL:' + document.URL + '\n' +
    'DTSTART:' + props.event.start.replace(/-/g, '') + 'T' + props.event.start.replace(/:/g, '').substring(11, 15) + '00\n' +
    'DTEND:' + props.event.end.replace(/-/g, '') + 'T' + props.event.end.replace(/:/g, '').substring(11, 15) + '00\n' +
    'SUMMARY:' + props.event.title + '\n' +
    'DESCRIPTION:' + props.event.description + '\n' +
    'LOCATION:' + props.event.location + '\n' +
    'END:VEVENT\n' +
    'END:VCALENDAR\n'
  );
});

const yahooUrl = computed(() => {
  return 'http://calendar.yahoo.com/?v=60&view=d&type=20' +
    '&title=' + encodeURIComponent(props.event.title) +
    '&st=' + encodeURIComponent(props.event.start) +
    '&dur=' + encodeURIComponent('0100') +
    '&desc=' + encodeURIComponent(props.event.description) +
    '&in_loc=' + encodeURIComponent(props.event.location);
});

const emailUrl = computed(() => {
  return 'Title: ' + props.event.title + '%0D%0A' +
    'Description: ' + props.event.description + '%0D%0A' +
    'Location: ' + props.event.location + '%'
})
</script>