<template>

  <div class="md:py-36 py-10 px-auto">
    <img
      class="border border-orange-200 mx-auto my-auto w-50 h-40 rounded-full shadow-md dark:shadow-lg dark:shadow-black dark:border-neutral-700 shadow-orange-200 border border-orange-200 border-l-1 border-t-1 border-b-3 border-r-3"
      src="https://avatars.githubusercontent.com/u/20309393?s=400&u=59a9f6b491245880469d127175c0a1d47370fb6b&v=4">
    <div class="py-2">
      <h1 class="text-3xl font-semibold text-orange-400 rounded p-1">Thomas Groch</h1>
    </div>
    <p class="py-1 text-neutral-500">{{ $t('general.role_profile') }}, <span
      class="dark:bg-neutral-700 bg-orange-100 text-orange-400 rounded px-1 font-normal">Front-end</span></p>

    <div class="py-5 flex space-x-3 justify-center text-sm text-center px-5"
        v-if="currentPath != '/'">
      <a class="dark:hover:bg-transparent px-2" href="https://linkedin.com/in/camilarody" target="_blank">
        <font-awesome-icon :icon="['fab', 'linkedin']"
                           class="fa-2x text-neutral-500 hover:text-orange-400 dark:bg-transparent px" />
      </a>
      <a class="dark:hover:bg-transparent px-2" href="https://gitlab.com/camilasrody" target="_blank">
        <font-awesome-icon :icon="['fab', 'gitlab']"
                           class="fa-2x text-neutral-500 hover:text-orange-400 dark:bg-transparent" />
      </a>
      <a class="dark:hover:bg-transparent px-2" href="https://github.com/camilasrody" target="_blank">
        <font-awesome-icon :icon="['fab', 'github-alt']"
                           class="fa-2x text-neutral-500 hover:text-orange-400 " />
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
                           class="fa-3x text-neutral-500 hover:text-orange-400 cursor-pointer hover:shadow-orange-400 "/>
      </button>
        </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "CardProfile",
  data() {
    return {
      open: false
    }
  }
}

</script>

