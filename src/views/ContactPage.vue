<script setup>
import Estados from '@/components/Estados.vue'
import Cidades from '@/components/Cidades.vue'
import nprogress from 'nprogress'
</script>

<template>
  <main class="mt-5 flex flex-col items-center justify-center">
    <div v-if="modal.visible" @click.self="modal.visible = false"
         class="absolute z-20 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded shadow-lg p-8 m-4 max-h-full text-center">
      <div class="mb-4">
        <h1 class="dark:text-neutral-200 text-neutral-600">{{ $t('contact.hello') }} <span class="font-bold text-green-400">{{
            form.nome
          }}</span></h1>
      </div>
      <div class="mb-8">
        <div class="flex bg-green-100 dark:bg-neutral-600 border-t-4 border-green-400 rounded-b px-4 py-3"
             role="alert">
          <div class="py-1">

            <svg class="fill-current h-7 w-7 text-green-400  mr-4" xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 24 24">
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
            </svg>
          </div>
          <div class="text-gray-600">
            <p class="font-bold text-green-400 dark:text-green-400">{{ $t('contact.success_msg') }}</p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">{{ $t('contact.return_msg') }}</p>
          </div>
        </div>
      </div>
      <div class="flex justify-center">
        <button
          class="bg-neutral-200 shadow dark:bg-neutral-300 dark:text-neutral-500 text-neutral-500 dark:hover:border-transparent dark:hover:text-green-400 dark:hover:bg-neutral-700 hover:bg-green-100 hover:text-green-400 drop-shadow-md hover:shadow-sm-light px-4 py-2 border border-transparent hover:border-green-100 rounded"
          @click.self="modal.visible = false">{{ $t('contact.close') }}
        </button>
      </div>
    </div>

    <div class="flex mb-20 flex-wrap justify-center dark:bg-neutral-800 py-5 px-8 rounded-md">
      <!--            <div v-if="modal.visible" @click.self="modal.visible = false"-->
      <!--                 class="h-screen w-full absolute flex items-center justify-center bg-modal rounded-lg shadow-lg p-10">-->
      <!--            </div>-->

      <form class="w-full max-w-md"
            :action="formAction"
            @submit.prevent="validateBeforeSubmit"
            name="contact"
            method="post"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            netlify>
        <input type="hidden" name="form-name" value="contact"/>
        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full md:w-full px-3 mb-3 md:mb-0">

            <label class="block tracking-wide text-green-400 text-lg mb-2"
                   for="grid-nome">{{ $t('contact.name') }}</label>
            <input
              class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight  focus:bg-white dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
              :class="{'input': true, 'border-red': errors.has('nome') }"
              name="nome"
              v-model="form.nome"
              id="grid-nome"
              type="text">
            <p class="text-red-500 text-lg italic"
               v-if="errors.has('nome')">{{ errors.first('nome') }}</p>

          </div>
        </div>


        <div class="flex flex-wrap -mx-3 mb-2"
             v-show="hasFilled('nome')">
          <div class="w-full px-3 mb-2 md:mb-0"
               :class="{'input': true, 'md:w-1/2': hasFilled('email') }">

            <label class="block tracking-wide text-green-400 text-lg  mb-2"
                   for="grid-email">{{ $t('contact.email') }}</label>
            <div class="relative">
              <input
                class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white dark:focus:outline-none dark:focus:bg-white text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
                :class="{'input': true, 'border-red': errors.has('email') }"
                name="email"
                v-model="form.email"
                id="grid-email"
                type="text">
              <p class="text-red-500 text-lg italic"
                 v-if="errors.has('email')">{{ errors.first('email') }}</p>
            </div>

          </div>

          <div class="w-full md:w-1/2 px-3 mb-3 md:mb-0"
               v-show="hasFilled('email')">

            <label class="block tracking-wide text-green-400 text-lg  mb-2"
                   for="grid-telefone">{{ $t('contact.telephone') }}</label>
            <div class="relative">
              <input
                class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white dark:focus:outline-none dark:focus:bg-white  text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
                :class="{'input': true, 'border-red': errors.has('telefone') }"
                name="telefone"
                v-model="form.telefone"
                id="grid-telefone"
                type="text">
              <p class="text-red-500 text-lg italic"
                 v-if="errors.has('telefone')">{{ errors.first('telefone') }}</p>
            </div>


          </div>
        </div>


        <div class="flex flex-wrap -mx-3 mb-3">
          <div class="w-full px-3">

            <label class="block tracking-wide text-green-400 text-lg mb-2"
                   for="grid-mensagem">{{ $t('contact.help') }}</label>
            <textarea
              class="caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200 rounded pt-3 pb-10 px-4 mb-3 leading-tight focus:outline-none focus:bg-white dark:focus:outline-none dark:focus:bg-white text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide"
              :class="{'input': true, 'border-red': errors.has('mensagem') }"
              name="mensagem"
              v-model="form.mensagem"
              @input="textareaResize" ref="textarea" rows="3"
              id="grid-mensagem"/>
            <p class="text-red-500 text-lg italic"
               v-if="errors.has('mensagem')">{{ errors.first('mensagem') }}</p>
            <span class="text-neutral-400 text-xs italic">{{ $t('contact.span_message') }}</span>

          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-2"
             v-show="hasFilled('mensagem')">
          <div class="w-full px-3 mb-3 md:mb-0"
               :class="{'input': true, 'md:w-1/2': hasFilled('estado') }">

            <label class="block tracking-wide text-green-400 text-lg mb-2"
                   for="grid-estado">{{ $t('contact.state') }}</label>
            <div class="relative">
              <Estados @onEstadoSelected="changeEstado"
                       :class="{'input': true, 'border-red': errors.has('estado') }"
                       class="caret-green-400 dark:bg-neutral-600 bg-neutral-200 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100"
                       name="estado"
                       v-model="form.estado"
                       id="grid-estado"/>
              <p class="text-red-500 text-lg italic"
                 v-if="errors.has('estado')">{{ errors.first('estado') }}</p>
            </div>

          </div>
          <div class="w-full md:w-1/2 px-3 mb-3 md:mb-0"
               v-if="hasFilled('estado')">

            <label class="block tracking-wide text-green-400 text-lg  mb-2"
                   for="grid-cidade">{{ $t('contact.city') }}</label>
            <p class="text-red-500 text-lg italic"
               v-if="errors.has('estado')">{{ errors.first('estado') }}</p>
            <div class="relative">
              <Cidades
                class="caret-green-400 dark:bg-neutral-600 bg-neutral-200 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100"
                :class="{'input': true, 'border-red': errors.has('cidade') }"
                name="cidade"
                v-model="form.cidade"
                :estado="form.estado"
                @onCidadeSelected="changeCidade"
                id="grid-cidade"/>
              <p class="text-red-500 text-lg italic"
                 v-if="errors.has('cidade')">{{ errors.first('cidade') }}</p>
            </div>

          </div>
        </div>

        <div class="w-full px-3 mb-3 md:mb-0">

          <div v-if="status === 'error'"
               class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
               role="alert">
            <strong class="font-bold">☹️ Ops</strong>
            <span class="block sm:inline">, {{ $t('contact.error_msg_1') }}<br/> {{ $t('contact.error_msg_2') }}</span>
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3"
                  @click="status = 'idle'">
                            <svg class="fill-current h-6 w-6 text-red-500" Contarole="button"
                                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <title>Close</title>
                                <path
                                  d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                            </svg>
                        </span>
          </div>

          <div class="flex items-center justify-center px-3 my-6 md:mb-0 items-center p-5">
            <button
              class="rounded border-2 font-medium px-8 py-2.5 text-base bg-transparent text-neutral-500 border-green-300 shadow-xs dark:hover:text-green-400 dark:shadow-white dark:text-neutral-200 dark:border-neutral-200 dark:hover:bg-neutral-700 dark:hover:border-neutral-700 hover:drop-shadow-lg hover:bg-green-100 hover:text-green-400 hover:border-green-100"
              type="submit">{{ $t('contact.submit') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import { reactive, ref } from "vue"
// import VueTextareaAutosize from 'vue-textarea-autosize'

export default {
  name: 'ContatoPage',
  metaInfo: {
    title: 'Contato',
  },
  components: {
    // VueTextareaAutosize,
    Estados, Cidades
  },
  props: {},
  data() {
    return {
      modal: {
        visible: false
      },
      errors: {
        has: () => {
          return false
        }
      },

      form: {
        nome: null,
        email: null,
        telefone: null,
        estado: null,
        cidade: null,
        mensagem: '',
        date: '',
      },
      status: 'idle',
      isEmail: null
    }
  },
  computed: {
    formAction() {
      return (process.env.NODE_ENV === 'production') ? '/.netlify/functions/contact' : 'http://localhost:8888/.netlify/functions/contact'
    }
  },
  methods: {
    async validateBeforeSubmit() {
      let result = false
      let response
      try {
        // TODO: Add UX like this
        //  https://forestry-community.slack.com/join/shared_invite/enQtNDAxMTU5NzcwMzA3LWUyYTk3NDY2ZDNiMjFhNmVlMjExM2FjYzFhNjJhNjU2NTc2ODVjZTdlYjJiODhhZDgwYTVhYjY0ZGU3ZWFmYzM
        nprogress.start()
        this.status = 'loading'

        // Validate
        // result = await this.$validator.validateAll()
        // if (!result) {
        //   this.status = 'error'
        //   throw new Error('Form is not valid')
        //   return
        // }

        response = await fetch(this.formAction, {
          method: 'POST',
          body: JSON.stringify(this.$data.form)
        })
        if (Number(response.status) !== 200) {
          throw new Error(`Status: ${response.status}. Error: ${response.body.error}.`)
          return
        }
      } catch (error) {
        console.log(error)
        this.status = 'error'
        nprogress.done()
        return
      }
      nprogress.done()
      this.status = 'done'
      this.modal.visible = true
      return true
    },

    hasFilled(field) {
      return (!this.errors.has(field) && this.form[field])
    },
    // textareaResize() {
    // 	this.$refs.textarea.style.minHeight = this.$refs.textarea.scrollHeight + 'px'
    // },
    changeEstado(estado) {
      this.form.estado = estado
    },
    changeCidade(cidade) {
      this.form.cidade = cidade
    },
    beforeModalClose(event) {
      this.status = 'dismiss'
    }
  },
  // mounted() {
  // 	this.$refs.textarea.style.minHeight = this.$refs.textarea.scrollHeight + 'px'
  // }
}
</script>

