<template>

<div class="p-3 md:max-w-full w-full max-w-full lg:flex md:mt-10 mt-20 rounded-lg border shadow-3xl border-green-300 dark:border-neutral-200 dark:bg-neutral-700 bg-alternator">
  <a :href="item.website"
      target="_blank" class="sm:h-64 h-48 lg:h-auto lg:w-48 flex-none object-cover overflow-hidden bg-no-repeat bg-center rounded-t lg:rounded-t-none lg:rounded-l lg:rounded-b rounded-b-none rounded-r "
      :style="'background-image: url(\''+ item.img +'\'); background-size: 100%; '">
</a>

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
      
      <div class="flex justify-between pt-3">
        <div class="flex flex-wrap">
          <img
            class="shadow w-9 h-9 rounded-full mr-4 mt-2"
            :src="tech"
            alt="tech"
            v-for="(tech, key) in item.techs"
            :key="key"
          />
        </div>
        <p class="shrink-0 flex items-end text-neutral-500 text-sm font-medium">{{item.startDate}}</p>
      </div>
    </div>
  </div>
</template>

<script>
// import * from 'moment'
import info from "@/info.json";

export default {
  name: "ProjectCard",
    data() {
      return {
        types: info.meta.projectTypes
      }
  },
  props: {
    key: Number,
    item: {
      type: Object,
      default: function() {
        return {
          type: 1,
          // photo: "",
          // techs: "",

          company: "",
          position: "",
          website: "",
          startDate: "",
          summary: "",
          highlights: [],
          endDate: ""
        };
      }
    }
  },
  computed:{
    typeObject(){
      return this.types[this.item.type]
    },
    typeIcon(){
      return this.typeObject.icon || ""
    }
  }
};
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
