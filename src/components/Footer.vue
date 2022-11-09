<script setup>
import {useRoute} from 'vue-router'
import {computed} from 'vue'
const route=useRoute();
const currentPath = computed(() =>route.path)
</script>
<template>
  <div class="py-16">
    <div class="py-5 flex space-x-3 justify-center text-sm text-center px-5"
        v-if="currentPath != '/'">
      <a class="dark:hover:bg-transparent px-2" href="https://linkedin.com/in/camilarody" target="_blank">
        <font-awesome-icon :icon="['fab', 'linkedin']"
                           class="fa-2x text-neutral-500 hover:text-green-400 dark:bg-transparent px" />
      </a>
      <a class="dark:hover:bg-transparent px-2" href="https://gitlab.com/camilasrody" target="_blank">
        <font-awesome-icon :icon="['fab', 'gitlab']"
                           class="fa-2x text-neutral-500 hover:text-green-400 dark:bg-transparent" />
      </a>
      <a class="dark:hover:bg-transparent px-2" href="https://github.com/camilasrody" target="_blank">
        <font-awesome-icon :icon="['fab', 'github-alt']"
                           class="fa-2x text-neutral-500 hover:text-green-400 " />
      </a>
    </div>
    
    <p class="text-sm text-neutral-500 text-center">© 2002 - {{ new Date().getFullYear() }} Thomas Groch.</p>
    <p class="text-sm text-neutral-500 text-center" v-if="commit_ref">
      <span v-if="node_version">Build with node {{ node_version }}<br /></span>
      <a :href="repo_url+'/-/commit/' + commit_ref" target="_blank">#{{ commit_ref.substring(0,7) }}</a>
      <span v-if="branch">
        on <a :href="repo_url+'/-/tree/' + branch" target="_blank">{{ branch }}</a>.
      </span>
    </p>
     <div class="flex justify-center gap-5 py-5 px-1">
      <Button
              @click="$i18n.locale = 'en'"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
       <img class="w-10 cursor-pointer rounded"
            :class="$i18n.locale == 'en' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/us.svg" />
      </Button>
      <Button 
              @click="$i18n.locale = 'pt'"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
        <img class="w-10 cursor-pointer rounded"
            :class="$i18n.locale == 'pt' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/br.svg" />
      </Button>
      <Button 
              @click="$i18n.locale = 'jp'"
              class="inline-flex hover:border-trasparent border-neutral-400 shadow-lg border rounded">
        <img class="w-10 cursor-pointer rounded"
            :class="$i18n.locale == 'jp' ? 'grayscale-0' : 'grayscale hover:grayscale-0'"
             src="https://flagicons.lipis.dev/flags/4x3/jp.svg" />
      </Button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer",
  data(){
    return {
      repo_url: 'https://gitlab.com/camilasrody/vite-vue3-tailwind-starter',
      site_name: import.meta.env.SITE_NAME,
      url: import.meta.env.URL,
      node_version: import.meta.env.NODE_VERSION,
      repository_url: import.meta.env.REPOSITORY_URL, // URL for the linked Git repository.
      commit_ref: import.meta.env.COMMIT_REF, // Reference of the commit we’re building.
      branch: import.meta.env.BRANCH, // Reference to check out after fetching changes from the Git repository. useful in split testing https://www.netlify.com/docs/split-testing/#exposing-split-test-information-in-your-site
      // netlify_images_cdn_domain: import.meta.env.NETLIFY_IMAGES_CDN_DOMAIN,
      // context: import.meta.env.CONTEXT, // Name of the context a deploy is built around, it can be `production`, `deploy-preview` or `branch-deploy`.
    }
  }
}

methods:{

}
</script>
