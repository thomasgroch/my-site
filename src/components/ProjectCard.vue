<template>
  <div class="max-w-sm flex flex-col justify-between bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
    <div class="max-h-80 justify-center flex">
      <a :href="item.website">
        <img class="max-h-80 rounded-t-lg" :src="item.img" alt="" />
      </a>
    </div>
    <div class="p-5  flex flex-col">
      <a :href="item.website" target="_blank">
        <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">{{ item.company }}</h5>
      </a>
      <p class="mb-3 text-gray-700 dark:text-gray-400">{{ item.summary }}</p>

      <div class="flex justify-between py-3">
        <div class="flex flex-wrap">
          <img
            class="shadow w-9 h-9 rounded-full mr-4 mt-2"
            :src="tech"
            alt="tech"
            v-for="(tech, key) in item.techs"
            :key="key"
          />
        </div>
        <p class="shrink-0 flex items-end text-neutral-500 text-sm font-medium">{{ item.startDate }}</p>
      </div>

<!--      <div class="flex">-->
<!--        <a :href="item.website" target="_blank" class="w-1/2 mr-2 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-500 rounded-lg hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-800 dark:hover:bg-green-600 dark:focus:ring-green-800">-->
<!--          Site-->
<!--          <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>-->
<!--        </a>-->
<!--        <a href="#" target="_blank" class="w-1/2 ml-2 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-500 rounded-lg hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-800 dark:hover:bg-green-600 dark:focus:ring-green-800">-->
<!--          Repo-->
<!--          <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>-->
<!--        </a>-->
<!--      </div>-->
    </div>
  </div>


  <!-- <div class="p-3 md:max-w-full w-full max-w-full lg:flex md:mt-10 mt-20 rounded-lg border shadow-3xl border-green-300 dark:border-neutral-200 dark:bg-neutral-700 bg-alternator"> -->
  <!-- <div class="rounded-lg border shadow-3xl border-green-300 dark:border-neutral-200 dark:bg-neutral-700 bg-alternator">
    <div>
      <a :href="item.website"
          target="_blank" class="sm:h-64 h-48 lg:h-auto lg:w-48 flex-none object-cover overflow-hidden bg-no-repeat bg-center rounded-t lg:rounded-t-none lg:rounded-l lg:rounded-b rounded-b-none rounded-r "
          :style="'background-image: url(\''+ item.img +'\'); background-size: 100%; '"></a>
    </div>
    <div class="p-4 flex flex-col justify-between leading-normal">
      <div class="mb-8">
        <div class="text-neutral-500 flex items-center text-xs">
          <font-awesome-icon :icon="['fas', typeIcon ]" class="text-green-500"></font-awesome-icon>
          <p class="text-sm p-2">{{ $t('general.project.type_'+ item.type) }}</p>
        </div>
        <h3 class="text-center pb-5">
          <a
            :href="item.website"
            target="_blank"
            class="font-normal text-xl mb-2 text-green-400 underline decoration-3 underline-offset-8 dark:hover:bg-transparent break-words"
          >{{item.company }}</a>
        </h3>

        <p class="text-neutral-500 text-base text-left tracking-wide lg:ml-5 ">{{ item.summary }}</p>
      </div>


    </div>
  </div> -->
</template>

<script setup lang="ts">
// Import types and data
import info from "@/info.json";
import { computed } from 'vue';

// Define TypeScript interfaces
interface Tech {
  [key: string]: string;
}

interface ProjectType {
  icon: string;
  [key: string]: string;
}

interface ProjectItem {
  type: number;
  img?: string;
  techs?: Tech;
  company: string;
  position: string;
  website: string;
  startDate: string;
  summary: string;
  highlights: string[];
  endDate: string;
}

// Props definition
interface Props {
  item: ProjectItem;
}

const props = withDefaults(defineProps<Props>(), {
  item: () => ({
    type: 1,
    company: "",
    position: "",
    website: "",
    startDate: "",
    summary: "",
    highlights: [],
    endDate: ""
  })
});

// Data
const types = info.meta.projectTypes as Record<number, ProjectType>;

// Computed properties
const typeObject = computed<ProjectType>(() => {
  return types[props.item.type];
});

const typeIcon = computed<string>(() => {
  return typeObject.value.icon || "";
});
</script>

<style type="text/css">
  .bg-alternator:nth-child(even){
    background-color:#DEF7DC;
    @apply dark:bg-neutral-800
  }

  .popout:hover img{
  @apply transition ease-in-out delay-100 -translate-y-1 duration-300 shadow-xl
}
</style>
