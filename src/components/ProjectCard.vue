<template>

<div class="p-3 md:max-w-full w-full max-w-full lg:flex md:mt-10 mt-20 rounded-lg border shadow-3xl border-green-300 dark:border-neutral-200 dark:bg-neutral-700 bg-alternator">
  <div class="sm:h-64 h-48 lg:h-auto lg:w-48 flex-none object-cover overflow-hidden bg-no-repeat bg-center rounded-t lg:rounded-t-none lg:rounded-l lg:rounded-b rounded-b-none rounded-r "
      :style="'background-image: url(\''+ item.img +'\'); background-size: 100%; '">
  </div>

  <div class="p-4 flex flex-col justify-between leading-normal">
      <div class="mb-8">
        <div class="text-neutral-500 flex items-center text-xs">
          <font-awesome-icon :icon="['fas', typeIcon ]" class="text-green-500"></font-awesome-icon>
          <p class="text-sm p-2">{{ $t('general.project.type_'+ item.type) }}</p>
        </div>
        <h3 class="text-center pb-5">
          <a
            :href="item.href"
            target="_blank"
            class="font-normal text-xl mb-2 text-green-400 underline decoration-3 underline-offset-8 dark:hover:bg-transparent break-words"
          >{{item.company }}</a>
        </h3>

        <p class="text-neutral-500 text-base text-left tracking-wide lg:ml-5 ">{{ item.summary }}</p>
      </div>
      
      <div class="flex w-full">

        <div class="w-4/5 flex flex-wrap justify-start pl-5">
          <!-- <a v-if="item.business.img"
             :href="item.business.href"
             target="_blank">
            <img
              v-if="item.business.img"
              class="hover:transition hover:ease-in-out hover:delay-50 hover:-translate-y-1 hover:duration-300 hover:shadow-xl hover:shadow w-10 h-10 shadow-md rounded-full mr-4 my-3"
              :src="item.business.img"
              alt="business"
              />
        </a> -->
        </div>
      </div>

      <div class="flex w-full">
        <div class="w-4/5 flex pt-3 flex-wrap justify-start">
          <!-- <img
            class="shadow w-9 h-9 rounded-full mr-4 mt-2"
            :src="brand"
            alt="brand"
            v-for="brand in item.techs"
            :key="brand"
          /> -->
        </div>

        <div class="flex items-end w-1/5">
          <p class="text-neutral-500 text-sm font-medium">{{item.date}}</p>
        </div>
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
    background-color:#ffedd5;
    @apply dark:bg-neutral-800
  }

  .popout:hover img{
  @apply transition ease-in-out delay-100 -translate-y-1 duration-300 shadow-xl
}
</style>
