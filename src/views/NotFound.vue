<template>
  <div class="">
    <div class="text-center">
      <div class='_404'>404</div>
      <div class='_1'>Ops!</div>
      <div class='_2'>{{ $t('general.nothing_here') }}</div>
      <div class="mt-12">
        <router-link to="/" class="before:content-['\21E0'] before:pr-2  rounded border-2 font-medium px-8 p-3 text-base bg-transparent text-neutral-500 border-orange-300
shadow-xs dark:hover:text-orange-400 dark:shadow-white dark:text-neutral-200 dark:border-neutral-200 dark:hover:bg-neutral-700
dark:hover:border-neutral-700 hover:drop-shadow-lg hover:bg-orange-100 hover:text-orange-400 hover:border-orange-100 no-underline">
          {{ $t('general.goto_site') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="css">

/*.c {*/
/*  text-align: center;*/
/*  display: block;*/
/*  position: relative;*/
/*  width: 80%;*/
/*  margin: 100px auto;*/
/*}*/

body {
  @apply text-neutral-600 dark:text-orange-400 overflow-x-hidden md:overflow-auto
}

._404 {
  font-size: 180px;
  position: relative;
  display: inline-block;
  z-index: 2;
  height: 150px;
  letter-spacing: 15px;
}

._1 {
  text-align: center;
  letter-spacing: 1px;
  font-size: 4em;
}

._2 {
  text-align: center;
  letter-spacing: 1px;
  font-size: 3em;
}

</style>
