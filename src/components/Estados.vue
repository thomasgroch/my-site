<template>
        <select class="block appearance-none w-full border py-3 px-4 pr-8 bg-gray-300 dark:bg-neutral-900 rounded leading-tight focus:outline-none focus:bg-white dark:focus:bg-white text-gray-700 dark:text-neutral-100  dark:focus:text-neutral-500 tracking-wide"
                v-model="estado"
                :id="id">
            <option v-for="estado in estadosList" :value="estado.value">{{estado.text}}</option>
        </select>
</template>
<script>
	export default {
		name: 'Estados',
		props: {
			id: {
				type: String,
				required: false
			},
		},
		data() {
			return {
				estado: null,
				estadosList: [
					{value: null, text: 'Selecione um estado'},
					{value: 'AC', text: 'Acre'},
					{value: 'AL', text: 'Alagoas'},
					{value: 'AP', text: 'Amapá'},
					{value: 'AM', text: 'Amazonas'},
					{value: 'BA', text: 'Bahia'},
					{value: 'CE', text: 'Ceará'},
					{value: 'DF', text: 'Distrito Federal'},
					{value: 'ES', text: 'Espírito Santo'},
					{value: 'GO', text: 'Goiás'},
					{value: 'MA', text: 'Maranhão'},
					{value: 'MT', text: 'Mato Grosso'},
					{value: 'MS', text: 'Mato Grosso do Sul'},
					{value: 'MG', text: 'Minas Gerais'},
					{value: 'PA', text: 'Pará'},
					{value: 'PB', text: 'Paraíba'},
					{value: 'PR', text: 'Paraná'},
					{value: 'PE', text: 'Pernambuco'},
					{value: 'PI', text: 'Piauí'},
					{value: 'RJ', text: 'Rio de Janeiro'},
					{value: 'RN', text: 'Rio Grande do Norte'},
					{value: 'RS', text: 'Rio Grande do Sul'},
					{value: 'RO', text: 'Rondônia'},
					{value: 'RR', text: 'Roraima'},
					{value: 'SC', text: 'Santa Catarina'},
					{value: 'SP', text: 'São Paulo'},
					{value: 'SE', text: 'Sergipe'},
					{value: 'TO', text: 'Tocantins'}
				]
			}
		},
		watch: {
			estado() {
				this.$emit('onEstadoSelected', this.estado)
			}
		}
	}
</script>
