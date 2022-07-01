<template>
    <div
        id="moduleProperty"
        class="moduleProperty noSelect effect1 properties-panel draggable-panel draggable-panel-css guide_2"
    >
        <PanelHeader :header-title="$t('simulator.panel_header.properties')" />
        <div class="panel-body">
            <div id="moduleProperty-inner">
                <div id="moduleProperty-header">
                    {{ modulePropertyInnerHeader }}
                </div>
                <PanelBody1 v-if="displayCase === 1" />
                <PanelBody2 v-if="displayCase === 2" />
                <PanelBody3 v-if="displayCase === 3" :data="propertiesToShow" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { layoutModeGet } from '#/simulator/src/layoutMode'
import simulationArea from '#/simulator/src/simulationArea'
import {
    hideProperties,
    prevPropertyObjGet,
    prevPropertyObjSet,
} from '#/simulator/src/ux'
import { SimulatorStore } from '#/store/SimulatorStore/SimulatorStore'
import { onMounted, ref, toRaw } from '@vue/runtime-core'
import PanelHeader from '../Shared/PanelHeader.vue'
import PanelBody1 from './PropertiesPanelBody/PanelBody1.vue'
import PanelBody2 from './PropertiesPanelBody/PanelBody2.vue'
import PanelBody3 from './PropertiesPanelBody/PanelBody3.vue'

const propertiesToShow = ref(undefined)
const showModuleProperty = ref(true)
const showLayoutProperty = ref(false)
const displayCase = ref(1)
const modulePropertyInnerHeader = ref('PROJECT PROPERTIES')

onMounted(() => {
    var updateSelection = setInterval(func, 100)
    function func() {
        if (
            toRaw(propertiesToShow.value) !== simulationArea.lastSelected &&
            simulationArea.lastSelected &&
            simulationArea.lastSelected.objectType !== 'Wire'
        ) {
            propertiesToShow.value = simulationArea.lastSelected
            prevPropertyObjSet(simulationArea.lastSelected)
            console.log(propertiesToShow.value)
            showProperties()
        }
    }
})

function showProperties() {
    // hideProperties()
    prevPropertyObjSet(undefined)

    // layout Properties Panel
    if (layoutModeGet()) {
        // CASE 1
        if (
            simulationArea.lastSelected === undefined ||
            ['Wire', 'CircuitElement', 'Node'].indexOf(
                simulationArea.lastSelected.objectType
            ) !== -1
        ) {
            showModuleProperty.value = false
            showLayoutProperty.value = true
            return
        }

        showModuleProperty.value = true
        showLayoutProperty.value = false
        displayCase.value = 1
        modulePropertyInnerHeader.value = simulationArea.lastSelected.objectType
    } else if (
        simulationArea.lastSelected === undefined ||
        ['Wire', 'CircuitElement', 'Node'].indexOf(
            simulationArea.lastSelected.objectType
        ) !== -1
    ) {
        // CASE 2
        showModuleProperty.value = true
        showLayoutProperty.value = false
        displayCase.value = 2
        modulePropertyInnerHeader.value = 'PROJECT PROPERTIES'
    } else {
        // CASE 3
        showModuleProperty.value = true
        showLayoutProperty.value = false
        displayCase.value = 3
        modulePropertyInnerHeader.value = simulationArea.lastSelected.objectType
    }
    console.log(displayCase.value)
}
</script>
