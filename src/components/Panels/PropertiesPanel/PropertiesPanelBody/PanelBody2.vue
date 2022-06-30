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
        />
    </p>
    <p>
        <span>Circuit:</span>
        <input
            id="circname"
            v-model="circuitName"
            class="objectPropertyAttribute"
            type="text"
            autocomplete="off"
			@keyup="changeCircuitName(circuitName)"
        />
    </p>
    
	<p>
        <span>Clock Time (ms):</span>
        <div class="input-group">
            <div class="input-group-prepend">
                <button
                    style="border: none; min-width: 2.5rem"
                    class="btn btn-decrement btn-outline-secondary"
                    type="button"
					@click="clockTimeDecrement()"
                >
                    <strong>-</strong>
                </button>
            </div>
            <input
				v-model="clockTime"
                type="text"
                inputmode="decimal"
                style="text-align: center"
                class="form-control objectPropertyAttribute"
                placeholder=""
				@change="simulationArea.timePeriod = clockTime"
            />
            <div class="input-group-append">
                <button
                    style="border: none; min-width: 2.5rem"
                    class="btn btn-increment btn-outline-secondary"
                    type="button"
					@click="clockTimeIncrement()"
                >
                    <strong>+</strong>
                </button>
            </div>
        </div>
    </p>

	<p>
		<span>Clock Enabled:</span> 
		<label class='switch'> 
				<input 
					v-model="clockEnable"
					type='checkbox' 
					class='objectPropertyAttributeChecked' 
					@change="changeClockEnable(clockEnable)"
				>
			<span class='slider'></span>
		</label>
	</p>

	<p>
		<span>Lite Mode:</span> 
		<label class='switch'> 
			<input 
				v-model="lightMode"
				type='checkbox' 
				class='objectPropertyAttributeChecked' 
				@change='changeLightMode(lightMode)' 
			> 
			<span class='slider'></span> 
		</label>
	</p>

	<p>
		<button 
			type='button' 
			class='objectPropertyAttributeChecked btn btn-xs custom-btn--primary' 
			@click='toggleLayoutMode()' 
		>
			Edit Layout
		</button>
		<button 
			type='button' 
			class='objectPropertyAttributeChecked btn btn-xs custom-btn--tertiary' 
			@click ='deleteCurrentCircuit()' 
		>
			Delete Circuit
		</button> 
	</p>
</template>

<script lang="ts" setup>
import { changeCircuitName, deleteCurrentCircuit } from '#/simulator/src/circuit'
import { getProjectName, setProjectName } from '#/simulator/src/data/save'
import { changeLightMode } from '#/simulator/src/engine'
import { toggleLayoutMode } from '#/simulator/src/layoutMode'
import { changeClockEnable } from '#/simulator/src/sequential'
import simulationArea from '#/simulator/src/simulationArea'

import { SimulatorStore } from '#/store/SimulatorStore/SimulatorStore'
import { storeToRefs } from 'pinia'
const main = SimulatorStore()
const { projectName, circuitName, clockTime, clockEnable, lightMode } = storeToRefs(main)

function clockTimeIncrement() {
	clockTime.value += 10;
}
function clockTimeDecrement() {
	clockTime.value -= 10;
}
</script>



<!-- 
TODO
The circuit Name on properties panel dosent change on circuitTab change 
-->