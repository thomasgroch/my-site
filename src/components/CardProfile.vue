<template>

  <div class="md:py-36 py-10 px-auto">
    <img
      class="border border-green-200 mx-auto my-auto w-50 h-40 rounded-full shadow-md dark:shadow-lg dark:shadow-black dark:border-neutral-700 shadow-green-200 border border-green-200 border-l-1 border-t-1 border-b-3 border-r-3"
      src="avatar.png">
    <div class="py-2">
      <h1 class="text-3xl font-semibold text-green-400 rounded p-1">Thomas Groch</h1>
    </div>
    <p class="py-1 text-neutral-500">{{ $t('general.role_profile') }}, <span
      class="dark:bg-neutral-700 bg-green-100 text-green-400 rounded px-1 font-normal">Full Stack</span></p>

    <div class="py-5 flex space-x-3 justify-center text-sm text-center px-5"
        v-if="currentPath != '/'">
      <a class="dark:hover:bg-transparent px-2" href="https://linkedin.com/in/thomasgroch" target="_blank">
        <font-awesome-icon :icon="['fab', 'linkedin']"
                           class="fa-2x text-neutral-500 hover:text-green-400 dark:bg-transparent px" />
      </a>
      <a class="dark:hover:bg-transparent px-2" href="https://gitlab.com/thomas.groch" target="_blank">
        <font-awesome-icon :icon="['fab', 'gitlab']"
                           class="fa-2x text-neutral-500 hover:text-green-400 dark:bg-transparent" />
      </a>
      <a class="dark:hover:bg-transparent px-2" href="https://github.com/thomasgroch" target="_blank">
        <font-awesome-icon :icon="['fab', 'github-alt']"
                           class="fa-2x text-neutral-500 hover:text-green-400 " />
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
                           class="fa-3x text-neutral-500 hover:text-green-400 cursor-pointer hover:shadow-green-400 "/>
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

