<script setup>
import {useRoute} from 'vue-router'
import {computed} from 'vue'

const route = useRoute();
const currentPath = computed(() => route.path)
</script>
<template>
  <div class="p-6 flex justify-between items-center visible sm:hidden" :class="{'hidden': !isMobile()}">
    <div>
      <span class="text-lg font-semibold text-orange-400 rounded p-1">
        <transition name="fade">
          <router-link v-if="currentPath != '/'"
                       to="/">Thomas Groch</router-link>
        </transition>
      </span>
    </div>
    <button class="text-orange-400 w-10 h-10 relative focus:outline-none" @click="open = !open">
      <span class="sr-only">Abrir menu</span>
      <div class="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span aria-hidden="true"
              class="block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"
              :class="{'rotate-45': open,' -translate-y-1.5': !open }"></span>
        <span aria-hidden="true"
              class="block absolute  h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"
              :class="{'opacity-0': open } "></span>
        <span aria-hidden="true"
              class="block absolute  h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"
              :class="{'-rotate-45': open, ' translate-y-1.5': !open}"></span>
      </div>
    </button>
  </div>
<!-- {{isMobile()}}
{{open}} -->
  <nav v-if="isMobile() && open || !isMobile()" class="text-lg pt-4 pb-5 flex flex-col justify-around sm:flex-row text-center">
    <router-link to="/"
                 class="text-neutral-500 dark:text-neutral-200 py-5 sm:py-2 px-5 mx-3 hover:text-orange-400 rounded-md border-2 border-transparent hover:border-orange-200 dark:hover:bg-transparent dark:hover:border-neutral-200 focus:outline-none">
      {{ $t('general.nav_about') }}
    </router-link>
    <router-link to="/stack"
                 class="text-neutral-500 dark:text-neutral-200 py-5 sm:py-2 px-5 mx-3 hover:text-orange-400 rounded-md border-2 border-transparent hover:border-orange-200 dark:hover:bg-transparent dark:hover:border-neutral-200 focus:outline-none">
      {{ $t('general.nav_stack') }}
    </router-link>
    <router-link to="/projetos"
                 class="text-neutral-500 dark:text-neutral-200 py-5 sm:py-2 px-5 mx-3 hover:text-orange-400 rounded-md border-2 border-transparent hover:border-orange-200 dark:hover:bg-transparent dark:hover:border-neutral-200 focus:outline-none">
      {{ $t('general.nav_projects') }}
    </router-link>
    <router-link to="/contato"
                 class="text-neutral-500 dark:text-neutral-200 py-5 sm:py-2 px-5 mx-3 hover:text-orange-400 rounded-md border-2 border-transparent hover:border-orange-200 dark:hover:bg-transparent dark:hover:border-neutral-200 focus:outline-none">
      {{ $t('general.nav_contact') }}
    </router-link>
  </nav>
</template>

<script>
export default {
  name: "TopMenu",
  data() {
    return {
      open: false
    }
  },
  methods: {
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|Tablet|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    }
  }

}
</script>


<style scoped>
nav .router-link-exact-active.router-link-active {
  border-color: #ffedd5;
  border-radius: 0.5rem;
  background-color: #ffedd5;
  color: #ed8936;
  @apply dark:bg-neutral-700 dark:border-transparent text-lg
}

a {
  @apply no-underline
}
</style>
