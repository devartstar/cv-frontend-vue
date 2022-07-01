<template>
    <p>
        <span>BitWidth:</span>
        <v-input
            class="objectPropertyAttribute outlined"
            :type="inputType"
            :append-icon="appendIcon"
            :prepend-icon="prependIcon"
            @click:append="appendFunction()"
            @click:prepend="prependFunction()"
        >
            {{ dataVal }}
        </v-input>
    </p>
</template>

<script lang="ts" setup>
import { ref } from '@vue/reactivity'
const props = defineProps({
    data: { type: Number, default: 1 },
    inputType: { type: String, default: 'text' },
    minVal: { type: String, default: '0' },
    maxVal: { type: String, default: '0' },
    appendIcon: { type: String, default: '' },
    prependIcon: { type: String, default: '' },
    appendFunc: { type: Function, default: () => {} },
    prependFunc: { type: Function, default: () => {} },
})
const dataVal = ref(props.data)

function appendFunction() {
    if (dataVal.value < props.maxVal) dataVal.value++
    props.appendFunc()
}
function prependFunction() {
    if (dataVal.value > props.minVal) dataVal.value--
    props.prependFunc()
}
</script>

<style>
.outlined {
    margin-top: 7px;
}
.v-input__control {
    text-align: center;
    border: 1px solid white;
    border-radius: 7px;
    height: 40px;
    line-height: 2;
}
.v-input__prepend,
.v-input__append {
    margin: 2px !important;
    padding: 6px 5px !important;
    border-radius: 3px;
    font-size: 1rem;
}
.v-input__prepend:hover {
    background: var(--bg-secondary) !important;
    color: var(--text-lite) !important;
}
.v-input__append:hover {
    background: var(--bg-secondary) !important;
    color: var(--text-lite) !important;
}
.v-input__details {
    display: none !important;
}
</style>
