<script setup>
import CardProfile from '@/components/CardProfile.vue'
</script>

<template>
   <div class="m-auto text-center items-center">
     <CardProfile />
  </div>
</template>

<script>
export default {
  name: "HomePage",
  metaInfo: {
    title: 'Sobre',
  },
}
</script>
