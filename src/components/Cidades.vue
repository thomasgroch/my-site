<template>
        <!--<input class="appearance-none block w-full bg-gray-400 text-gray-300 border border-gray-400 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-grey"-->
        <!--id="grid-cidade" type="text">-->
        <select class="block appearance-none w-full border py-3 px-4 pr-8 bg-gray-300 dark:bg-neutral-900 rounded leading-tight focus:outline-none focus:bg-white dark:focus:bg-white  text-gray-700 text-gray-700 dark:text-neutral-100  dark:focus:text-black tracking-wide"
                v-model="cidade"
                :id="id">
            <option v-for="cidade in cidadesList" :value="cidade">{{cidade}}</option>
        </select>

</template>
<script>
	import brasil from '@/brasil.json'

	export default {
		name: 'Cidades',
		props: {
			id: {
				type: String,
				required: false
			},
			estado: {
				type: String,
				required: true
			}
		},
		computed: {
			cidadesList() {
				return brasil[this.estado].cidades
			},
		},
		data() {
			return {
				cidade: null,
				brasil
			}
		},
		watch: {
			cidade() {
				this.$emit('onCidadeSelected', this.cidade)
			}
		}
	}
</script>
