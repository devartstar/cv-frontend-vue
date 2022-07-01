<template>
    <FormSpinButton
        v-if="!data.fixedBitWidth"
        input-type="text"
        min-val="1"
        max-val="32"
        append-icon="mdi-plus"
        prepend-icon="mdi-minus"
        :append-func="increaseBitWidth"
        :prepend-func="decreaseBitWidth"
    />
</template>

<script lang="ts" setup>
import FormSpinButton from '../Shared/FormSpinButton.vue'

const props = defineProps({
    data: { type: Object, default: undefined },
})

function increaseBitWidth() {
    if (props.data.bitWidth < 32) props.data.bitWidth++
}
function decreaseBitWidth() {
    if (props.data.bitWidth > 1) props.data.bitWidth--
}
</script>

<style></style>

// check width of input circuit element not increasing, some other stylings
