import { defineStore } from 'pinia'
import simulationArea from '#/simulator/src/simulationArea'
export interface State {
    projectName: string
    circuitName: string
    clockTime: number
    clockEnable: boolean
    lightMode: boolean
}

export const useState = defineStore({
    id: 'simulatorStore.state',

    state: (): State => {
        return {
            projectName: 'Untitled',
            circuitName: globalScope.name,
            clockTime: simulationArea.timePeriod,
            clockEnable: true,
            lightMode: false,
        }
    },
})
