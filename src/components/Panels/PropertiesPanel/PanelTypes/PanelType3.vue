<template>
    <FormSpinButton
        v-if="!obj.fixedBitWidth"
        :data="obj.bitWidth"
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
    obj: { type: Object, default: undefined },
})

function increaseBitWidth() {
    if (props.obj.bitWidth < 32) props.obj.bitWidth++
}
function decreaseBitWidth() {
    if (props.obj.bitWidth > 1) props.obj.bitWidth--
}
// above functions to be replaced by ux.js line:538
</script>

<style></style>

// check width of input circuit element not increasing, some other stylings
