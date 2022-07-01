<template>
    <p v-if="!obj.fixedBitWidth">
        <span>BitWidth:</span>
        <div class="input-group">
			<div class="input-group-prepend">
				<button style=" border:none; min-width: 2.5rem" class="btn" type="button" @click="decBitWidth()">
					<strong>-</strong>
				</button>
			</div>
			<input 
				type="number" 
				style="text-align: center" 
				class="form-control objectPropertyAttribute"  
				name='newBitWidth' 
				min='1' 
				max='32' 
				:value="obj.bitWidth"
			>
			<div class="input-group-append">
				<button style=" border:none; min-width: 2.5rem" class="btn btn-increment btn-outline-secondary" type="button" @click="incBitWidth()">
					<strong>+</strong>
				</button>
			</div>
		</div>
    </p>
</template>

<script lang="ts" setup>
import simulationArea from "#/simulator/src/simulationArea";

const props = defineProps({
    data: { type: Object, default: undefined },
})
const obj = props.data
function decBitWidth() {
	console.log("bw--")
	if (obj.bitWidth > 0) {
		obj.bitWidth--;
	}
}
function incBitWidth() {
	console.log("bw++")
	if (obj.bitWidth < 32) {
		obj.bitWidth++;
	}
}

</script>
