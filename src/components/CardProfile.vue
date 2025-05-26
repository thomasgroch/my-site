<script setup>
import Logo from '@/components/Logo.vue'
import {ref} from 'vue'
import resume from "~/resume.json"

const open = ref(false)

// Define component name for debugging purposes
defineOptions({
  name: "CardProfile"
})
</script>

<template>
  <div class="md:py-36 py-10 px-auto">
    <Logo />
    <div class="py-2">
      <h1 class="text-3xl font-semibold text-green-400 rounded p-1">Thomas Groch</h1>
    </div>
    <p class="py-1 text-neutral-500">{{ $t('general.role_profile') }}, <span
      class="dark:bg-neutral-700 bg-green-100 text-green-400 rounded px-1 font-normal">Web Developer</span></p>

    <div class="py-5 flex space-x-3 justify-center text-sm text-center px-5">
      <a class="dark:hover:bg-transparent px-2" v-for="n in resume.basics.profiles" :href="n.url" target="_blank">
        <font-awesome-icon :icon="['fab', n.network]"
                           class="fa-2x text-neutral-500 hover:text-green-300 dark:bg-transparent px" />
      </a>
    </div>

    <div class="p-5">
      <transition name="fade" mode="out-in">
        <div v-if="open">
          <p class="break-words indent-2 text-center tracking-wide text-neutral-500 ">
            {{ $t('general.profile_description') }}
          </p>
        </div>
      </transition>
      <div class="my-10">
      <button @click="open = !open">
        <font-awesome-icon :icon="['fa', !open ? 'angle-down': 'angle-up']"
                           :class="open ? 'animate-none': 'animate-bounce'"
                           class="fa-3x text-neutral-500 hover:animate-none hover:text-green-400 cursor-pointer hover:shadow-green-400 "/>
      </button>
        </div>
    </div>
  </div>
</template>

