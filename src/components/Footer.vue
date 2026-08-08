<template>
  <div class="py-16">
    <SocialLinks
      v-if="currentPath != '/'"
      :profiles="resume.basics.profiles"
    />

    <p class="text-sm text-neutral-500 text-center">© 2002 - {{ new Date().getFullYear() }} Thomas Groch.</p>
    <p class="text-sm text-neutral-500 text-center" v-if="commit_ref">
      <span v-if="node_version">{{ $t('general.footer_build_with_node') }} {{ node_version }}<br /></span>
      <a :href="repository_url+'/commit/' + commit_ref" target="_blank">#{{ commit_ref.substring(0,7) }}</a>
      <span v-if="branch">
        on <a :href="repository_url+'/tree/' + branch" target="_blank">{{ branch }}</a>.
      </span>
    </p>
    <div class="flex justify-center gap-5 py-5 px-1">
      <button
        v-for="locale in locales"
        :key="locale.code"
        @click="setLocale(locale.code)"
        class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded"
      >
        <img
          class="w-10 cursor-pointer rounded"
          :class="$i18n.locale == locale.code ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
          :src="locale.flagUrl"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import SocialLinks from '@/components/SocialLinks.vue'
import resume from "~/resume.json";
const route = useRoute();
const currentPath = computed(() =>route.path)
import { useI18n } from "vue3-i18n";
const i18n = useI18n();
const setLocale = (lang) => {
  i18n.setLocale(lang);
};

const locales = [
  { code: 'en', flagUrl: 'https://flagicons.lipis.dev/flags/4x3/us.svg' },
  { code: 'pt', flagUrl: 'https://flagicons.lipis.dev/flags/4x3/br.svg' },
  { code: 'jp', flagUrl: 'https://flagicons.lipis.dev/flags/4x3/jp.svg' },
]

// Active environment variables
const node_version = ref(import.meta.env.NODE_VERSION)
const repository_url = ref(import.meta.env.REPOSITORY_URL) // URL for the linked Git repository.
const commit_ref = ref(import.meta.env.COMMIT_REF) // Reference of the commit we're building.
const branch = ref(import.meta.env.BRANCH) // Reference to check out after fetching changes from the Git repository. useful in split testing https://www.netlify.com/docs/split-testing/#exposing-split-test-information-in-your-site
</script>
