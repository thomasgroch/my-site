<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true },
  type: { type: String, default: 'text' },
  modelValue: { type: String, default: '' },
  errors: { type: Object, default: () => ({ has: () => false, first: () => '' }) },
  inputClass: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'input'])

const baseInputClass = 'caret-green-400 border-transparent dark:focus:border-neutral-500 focus:border-green-300 focus:ring-0 dark:focus:bg-neutral-100 block w-full dark:bg-neutral-700 bg-neutral-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white dark:focus:outline-none dark:focus:bg-white text-gray-700 dark:text-neutral-100 dark:focus:text-black tracking-wide'

const hasError = computed(() => props.errors.has(props.name))
const errorMessage = computed(() => props.errors.first(props.name))

function onInput(event) {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}
</script>

<template>
  <div>
    <label class="block tracking-wide text-green-400 text-lg mb-2" :for="id">{{ label }}</label>
    <input
      v-if="type !== 'textarea'"
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue"
      @input="onInput"
      :class="[baseInputClass, inputClass]"
    />
    <textarea
      v-else
      :id="id"
      :name="name"
      :value="modelValue"
      @input="onInput"
      :class="[baseInputClass, inputClass]"
      rows="3"
    />
    <p class="text-red-500 text-lg italic" v-if="hasError">{{ errorMessage }}</p>
  </div>
</template>
