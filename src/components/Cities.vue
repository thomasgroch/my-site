<template>
        <select class="block appearance-none w-full border py-3 px-4 pr-8 bg-gray-300 dark:bg-neutral-900 rounded leading-tight focus:outline-none focus:bg-white dark:focus:bg-white  text-gray-700 text-gray-700 dark:text-neutral-100  dark:focus:text-black tracking-wide"
                v-model="city"
                :id="id">
            <option v-for="city in citiesList" :key="city" :value="city">{{city}}</option>
        </select>

</template>
<script>
	export default {
		name: 'Cities',
		props: {
			id: {
				type: String,
				required: false
			},
			state: {
				type: String,
				required: true
			}
		},
		computed: {
			citiesList() {
				return this.brazil && this.brazil[this.state] ? this.brazil[this.state].cities : []
			},
		},
		async created() {
			const brazil = await import('@/brazil.json')
			this.brazil = brazil.default
		},
		data() {
			return {
				city: null,
				brazil: null
			}
		},
		watch: {
			city() {
				this.$emit('onCitySelected', this.city)
			}
		}
	}
</script>
