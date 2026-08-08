<script setup>
import States from '@/components/States.vue'
import Cities from '@/components/Cities.vue'
import FormField from '@/components/FormField.vue'
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
            <FormField
              :label="$t('contact.name')"
              name="nome"
              id="grid-nome"
              v-model="form.nome"
              :errors="errors"
            />
          </div>
        </div>


        <div class="flex flex-wrap -mx-3 mb-2"
             v-show="hasFilled('nome')">
          <div class="w-full px-3 mb-2 md:mb-0"
               :class="{'input': true, 'md:w-1/2': hasFilled('email') }">
            <FormField
              :label="$t('contact.email')"
              name="email"
              id="grid-email"
              v-model="form.email"
              :errors="errors"
            />
          </div>

          <div class="w-full md:w-1/2 px-3 mb-3 md:mb-0"
               v-show="hasFilled('email')">
            <FormField
              :label="$t('contact.telephone')"
              name="telefone"
              id="grid-telefone"
              v-model="form.telefone"
              :errors="errors"
            />
          </div>
        </div>


        <div class="flex flex-wrap -mx-3 mb-3">
          <div class="w-full px-3">
            <FormField
              :label="$t('contact.help')"
              name="mensagem"
              id="grid-mensagem"
              type="textarea"
              v-model="form.mensagem"
              :errors="errors"
              inputClass="pt-3 pb-10"
            />
            <span class="text-neutral-400 text-xs italic">{{ $t('contact.span_message') }}</span>
          </div>
        </div>

        <div class="flex flex-wrap -mx-3 mb-2"
             v-show="hasFilled('mensagem')">
          <div class="w-full px-3 mb-3 md:mb-0"
               :class="{'input': true, 'md:w-1/2': hasFilled('state') }">

            <label class="block tracking-wide text-green-400 text-lg mb-2"
                   for="grid-state">{{ $t('contact.state') }}</label>
            <div class="relative">
              <States @onStateSelected="changeState"
                       :class="{'input': true, 'border-red': errors.has('state') }"
                       class="caret-green-400 dark:bg-neutral-600 bg-neutral-200 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100"
                       name="state"
                       v-model="form.state"
                       id="grid-state"/>
              <p class="text-red-500 text-lg italic"
                 v-if="errors.has('state')">{{ errors.first('state') }}</p>
            </div>

          </div>
          <div class="w-full md:w-1/2 px-3 mb-3 md:mb-0"
               v-if="hasFilled('state')">

            <label class="block tracking-wide text-green-400 text-lg  mb-2"
                   for="grid-city">{{ $t('contact.city') }}</label>
            <p class="text-red-500 text-lg italic"
               v-if="errors.has('state')">{{ errors.first('state') }}</p>
            <div class="relative">
              <Cities
                class="caret-green-400 dark:bg-neutral-600 bg-neutral-200 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100"
                :class="{'input': true, 'border-red': errors.has('city') }"
                name="city"
                v-model="form.city"
                :state="form.state"
                @onCitySelected="changeCity"
                id="grid-city"/>
              <p class="text-red-500 text-lg italic"
                 v-if="errors.has('city')">{{ errors.first('city') }}</p>
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
                                <title>{{ $t('contact.close') }}</title>
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
// These imports are kept for potential future use
import { /* reactive, ref */ } from "vue"
// import VueTextareaAutosize from 'vue-textarea-autosize'

export default {
  name: 'ContatoPage',
  metaInfo: {
    title: 'Contato',
  },
  components: {
    // VueTextareaAutosize,
    States, Cities
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
        state: null,
        city: null,
        mensagem: '',
        date: '',
      },
      status: 'idle',
      isEmail: null
    }
  },
  computed: {
    formAction() {
      return import.meta.env.PROD ? '/.netlify/functions/contact' : 'http://localhost:8888/.netlify/functions/contact'
    }
  },
  methods: {
    async validateBeforeSubmit() {
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
    changeState(state) {
      this.form.state = state
    },
    changeCity(city) {
      this.form.city = city
    },
    beforeModalClose() {
      this.status = 'dismiss'
    }
  }
}
</script>

