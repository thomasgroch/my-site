<template>
  <div class="py-16">
    <div class="py-5 flex space-x-3 justify-center text-sm text-center px-5"
        v-if="currentPath != '/'">
      <a class="dark:hover:bg-transparent px-2" v-for="n in resume.basics.profiles" :href="n.url" target="_blank">
        <font-awesome-icon :icon="['fab', network(n.network)]"
                           class="fa-2x text-neutral-500 hover:text-green-300 dark:bg-transparent px" />
      </a>
    </div>

    <p class="text-sm text-neutral-500 text-center">© 2002 - {{ new Date().getFullYear() }} Thomas Groch.</p>
    <p class="text-sm text-neutral-500 text-center" v-if="commit_ref">
      <span v-if="node_version">Build with node {{ node_version }}<br /></span>
      <a :href="repository_url+'/commit/' + commit_ref" target="_blank">#{{ commit_ref.substring(0,7) }}</a>
      <span v-if="branch">
        on <a :href="repository_url+'/tree/' + branch" target="_blank">{{ branch }}</a>.
      </span>
    </p>
     <div class="flex justify-center gap-5 py-5 px-1">
      <button
              @click="setLocale('en')"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
       <img class="w-10 cursor-pointer rounded"
            :class="locale == 'en' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/us.svg" />
      </button>
      <button
              @click="setLocale('pt')"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
        <img class="w-10 cursor-pointer rounded"
            :class="locale == 'pt' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/br.svg" />
      </button>
      <button
              @click="setLocale('jp')"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
        <img class="w-10 cursor-pointer rounded"
            :class="locale == 'jp' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/jp.svg" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import resume from "~/resume.json";
import { useI18n } from "vue-i18n";

const route = useRoute();
const currentPath = computed(() => route.path)
const { t, locale } = useI18n();
const setLocale = (lang) => {
  locale.value = lang;
};

const node_version = import.meta.env.PUBLIC_NODE_VERSION || 'development'
const repository_url = import.meta.env.PUBLIC_REPOSITORY_URL || 'https://github.com/thomasgroch/my-site'
const commit_ref = import.meta.env.PUBLIC_COMMIT_REF || 'main'
const branch = import.meta.env.PUBLIC_BRANCH || 'main'

// Network mapping functionality
const network = computed(() => {
  return (networkName) => {
    const networkMap = {
      'github': 'github',
      'linkedin': 'linkedin',
      'twitter': 'twitter',
      // Add more mappings as needed
    };
    return networkMap[networkName.toLowerCase()] || networkName.toLowerCase();
  };
});
</script>
