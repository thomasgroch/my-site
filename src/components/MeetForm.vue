<template>
<h2 class="pb-5 pt-2 text-neutral-100">{{ $t('meet.schedule-a-web-conference') }}</h2>
<form class="flex w-full px-5 md:px-0 md:w-1/2 flex-col justify-center"
	:action="formAction"
	@submit.prevent="submit"
	name="meet"
	method="post"
	data-netlify="true"
	data-netlify-honeypot="bot-field"
	netlify>
<input type="hidden" name="form-name" value="meet" />

<div class="w-full mb-3 md:mb-0">

	<label class="block tracking-wide text-green-400 text-lg mb-2"
	for="grid-nome">{{ $t('meet.name') }}</label>
	<input
	class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-800 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight  focus:bg-white dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
	:class="{'input': true, 'border-red': errors.has('nome') }"
	name="nome"
	v-model="form.nome"
	id="grid-nome"
	type="text">
	<p class="text-red-500 text-lg italic"
	v-if="errors.has('nome')">{{ errors.first('nome') }}</p>

</div>

<label class="pt-3 pb-2 block tracking-wide text-green-400 text-lg capitalize"
for="grid-date">{{ $t('meet.date') }}</label>

<div class="flex mb-3 md:mb-0">

	<input
	class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-800 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight  focus:bg-white dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
	:class="{'input': true, 'border-red': errors.has('date') }"
	name="date"
	v-model="form.date"
	id="grid-date"
	type="date">
	<p class="text-red-500 text-lg italic"
	v-if="errors.has('date')">{{ errors.first('date') }}</p>
	<input class="ml-5 caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-800 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight  focus:bg-white dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
			:class="{'input': true, 'border-red': errors.has('date') }"
			name="time"
			v-model="form.time"
			id="grid-time"
			type="time" />
		<p class="text-red-500 text-lg italic"
			v-if="errors.has('time')">{{ errors.first('time') }}</p>
</div>

<div class="w-full flex items-center justify-center my-6 md:mb-0 p-5">
	<button class="rounded border-2 font-medium px-8 py-2.5 text-base bg-transparent text-neutral-500 border-green-300 shadow-xs dark:hover:text-green-400 dark:shadow-white dark:text-neutral-200 dark:border-neutral-200 dark:hover:bg-neutral-800 dark:hover:border-neutral-700 hover:drop-shadow-lg hover:bg-green-100 hover:text-green-400 hover:border-green-100"
		type="submit">{{ $t('meet.submit') }}
	</button>
</div>
</form>
</template>

<script setup>
	import { ref, computed } from "vue"
	import nprogress from 'nprogress'
	import { useRouter } from 'vue-router'

	const form = ref({
		nome: '',
		date: '',
		time: ''
	})

	// Function used in the template
	// const hasFilled = (field) => {
	// 	return (!errors.value.has(field) && form.value[field])
	// }

	const errors = ref({
		has: () => {
			return false
		}
	})

	const router = useRouter()

	const submit = () => {
		try {
			nprogress.start()
			const url = '/' + router.currentRoute.value.path.split('/')[1] + `/${form.value.nome}/${form.value.date}-${form.value.time.replace(/:/g, '-')}` 
			router.push(url)
	    	// Commented out as it seems to be a placeholder for future API call
			// const response = await axios.post(this.formAction, this.$data.form)
		} catch (error) {
			console.log(error)
			nprogress.done()
			return
		}
		nprogress.done()
		return true
	}

	const formAction = computed(() => (process.env.NODE_ENV === 'production') ? '/.netlify/functions/meet' : 'http://localhost:8888/.netlify/functions/meet')
</script>
