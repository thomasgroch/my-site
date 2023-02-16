<template>
  <div class="py-16">
    <div class="py-5 flex space-x-3 justify-center text-sm text-center px-5"
        v-if="currentPath != '/'">
      <a class="dark:hover:bg-transparent px-2" v-for="n in resume.basics.profiles" :href="n.url" target="_blank">
        <font-awesome-icon :icon="['fab', n.network]"
                           class="fa-2x text-neutral-500 hover:text-green-300 dark:bg-transparent px" />
      </a>
    </div>

    <p class="text-sm text-neutral-500 text-center">© 2002 - {{ new Date().getFullYear() }} Thomas Groch.</p>
    <p class="text-sm text-neutral-500 text-center" v-if="commit_ref">
      <span v-if="node_version">Build with node {{ node_version }}<br /></span>
      <a :href="repository_url+'/-/commit/' + commit_ref" target="_blank">#{{ commit_ref.substring(0,7) }}</a>
      <span v-if="branch">
        on <a :href="repository_url+'/-/tree/' + branch" target="_blank">{{ branch }}</a>.
      </span>
    </p>
     <div class="flex justify-center gap-5 py-5 px-1">
      <button
              @click="setLocale('en')"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
       <img class="w-10 cursor-pointer rounded"
            :class="$i18n.locale == 'en' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/us.svg" />
      </button>
      <button
              @click="setLocale('pt')"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
        <img class="w-10 cursor-pointer rounded"
            :class="$i18n.locale == 'pt' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/br.svg" />
      </button>
      <button
              @click="setLocale('jp')"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
        <img class="w-10 cursor-pointer rounded"
            :class="$i18n.locale == 'jp' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/jp.svg" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import resume from "~/resume.json";
const route = useRoute();
const currentPath = computed(() =>route.path)
import { useI18n } from "vue3-i18n";
const i18n = useI18n();
const setLocale = (lang) => {
  i18n.setLocale(lang);
};

const site_name = ref(import.meta.env.SITE_NAME)
const url = ref(import.meta.env.URL)
const node_version = ref(import.meta.env.NODE_VERSION)
const repository_url = ref(import.meta.env.REPOSITORY_URL) // URL for the linked Git repository.
const commit_ref = ref(import.meta.env.COMMIT_REF) // Reference of the commit we’re building.
const branch = ref(import.meta.env.BRANCH) // Reference to check out after fetching changes from the Git repository. useful in split testing https://www.netlify.com/docs/split-testing/#exposing-split-test-information-in-your-site
const netlify_images_cdn_domain = ref(import.meta.env.NETLIFY_IMAGES_CDN_DOMAIN)
const context = ref(import.meta.env.CONTEXT) // Name of the context a deploy is built around, it can be `production`, `deploy-preview` or `branch-deploy`.

const network = computed(() => resume.basics.profiles.filter(n => n.network == 'linkedin'))
</script>
