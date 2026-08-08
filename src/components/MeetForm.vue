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
	<FormField
		:label="$t('meet.name')"
		name="nome"
		id="grid-nome"
		v-model="form.nome"
		:errors="errors"
	/>
</div>

<label class="pt-3 pb-2 block tracking-wide text-green-400 text-lg capitalize"
	for="grid-date">{{ $t('meet.date') }}</label>

<div class="flex mb-3 md:mb-0">
	<FormField
		name="date"
		id="grid-date"
		type="date"
		v-model="form.date"
		:errors="errors"
	/>
	<FormField
		class="ml-5"
		name="time"
		id="grid-time"
		type="time"
		v-model="form.time"
		:errors="errors"
	/>
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
	import FormField from '@/components/FormField.vue'

	const form = ref({
		nome: '',
		date: '',
		time: ''
	})

	const errors = ref({
		has: () => false,
		first: () => ''
	})

	const router = useRouter()

	const submit = () => {
		try {
			nprogress.start()
			const url = '/' + router.currentRoute.value.path.split('/')[1] + `/${form.value.nome}/${form.value.date}-${form.value.time.replace(/:/g, '-')}`
			router.push(url)
		} catch (error) {
			console.log(error)
			nprogress.done()
			return
		}
		nprogress.done()
		return true
	}

	const formAction = computed(() => import.meta.env.PROD ? '/.netlify/functions/meet' : 'http://localhost:8888/.netlify/functions/meet')
</script>
