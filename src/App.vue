<script setup>
import TopMenu from "@/components/TopMenu.vue"
import Footer from "@/components/Footer.vue"
</script>
<template>
  <div class="container w-full md:max-w-4xl mx-auto font-sans">
    <h1 class="hidden">Thomas Groch</h1>
    <TopMenu></TopMenu>
    <metainfo>
      <template v-slot:title="{ content }">{{ content ? `${content} |  Thomas Groch` : ` Thomas Groch` }}</template>
    </metainfo>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component"/>
      </transition>
    </router-view>

  </div>
    <div class="p-5 bottom-0 fixed">
      <button id="theme-toggle" type="button"
              class="text-blue-900 text-center bg-blue-200 dark:bg-yellow-100 dark:text-yellow-300  shadow shadow-blue-300 dark:shadow-yellow-300 rounded-full border-blue-800 dark:border-yellow-300 focus:outline-none text-sm p-2">
        <svg id="theme-toggle-dark-icon" class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
             xmlns="http://www.w3.org/2000/svg">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
        <svg id="theme-toggle-light-icon" class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
             xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            fill-rule="evenodd" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
    <Footer class="select-none"/>
</template>

<script>
export default {
  name: "App",
  components: {
    TopMenu,
    Footer
  },
  async mounted() {
    var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Change the icons inside the button based on previous settings
    if (localStorage.getItem('color-theme')) {
      // Se uma configuração específica foi definida pelo usuário
      if (localStorage.getItem('color-theme') === 'dark') {
        themeToggleLightIcon.classList.remove('hidden');
      } else {
        themeToggleDarkIcon.classList.remove('hidden');
      }
    } else {
      // Sem configuração, mostrar ícone baseado no horário
      const horaAtual = new Date().getHours();
      const ehNoite = horaAtual >= 18 || horaAtual < 6;
      
      if (ehNoite) {
        themeToggleLightIcon.classList.remove('hidden');
      } else {
        themeToggleDarkIcon.classList.remove('hidden');
      }
    }

    var themeToggleBtn = document.getElementById('theme-toggle');

    themeToggleBtn.addEventListener('click', function () {

      // toggle icons inside button
      themeToggleDarkIcon.classList.toggle('hidden');
      themeToggleLightIcon.classList.toggle('hidden');

      // if set via local storage previously
      if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('color-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('color-theme', 'light');
        }

        // if NOT set via local storage previously
      } else {
        if (document.documentElement.classList.contains('dark')) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('color-theme', 'light');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('color-theme', 'dark');
        }
      }

    });
  }
};
</script>

<style lang="stylus">
.fade-enter-active,
.fade-leave-active {
  transition: opacity .375s ease;
}


.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

h3::before {
  content: "#"
  @apply pr-2 text-green-400 invisible
}

h3:hover:before {
  @apply pr-2 text-green-400 visible
}
</style>
