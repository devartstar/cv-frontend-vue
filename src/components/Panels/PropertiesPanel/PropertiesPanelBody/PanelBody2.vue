<template>
    <p>
        <span>Project:</span>
        <input
            id="projname"
            v-model="projectName"
            class="objectPropertyAttribute"
            type="text"
            autocomplete="off"
            @keyup="setProjectName(projectName)"
            @value="getProjectName() || 'Untitled'"
        />
    </p>
</template>

<script lang="ts" setup>
import { getProjectName, setProjectName } from '#/simulator/src/data/save'
import { ref } from '@vue/reactivity'
const projectName = ref('Untitled')
</script>
