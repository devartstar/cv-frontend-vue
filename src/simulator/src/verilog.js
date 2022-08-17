/*
    # Primary Developers
    1) James H-J Yeh, Ph.D.
    2) Satvik Ramaprasad

    refer verilog_documentation.md
*/
import { scopeList } from './circuit'
import { errorDetectedGet } from './engine'
import { download } from './utils'
import { getProjectName } from './data/save'
import modules from './modules'
import { sanitizeLabel } from './verilogHelpers'
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/mode/verilog/verilog.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/hint/anyword-hint.js'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/display/autorefresh.js'
import { openInNewTab, copyToClipboard, showMessage } from './utils'
import { SimulatorStore } from '#/store/SimulatorStore/SimulatorStore'
var editor

export function generateVerilog() {
    console.log('Generate Verilog Circuit')
    const simulatorStore = SimulatorStore()
    simulatorStore.dialogBox.exportverilog_dialog = true
    // var dialog = $('#verilog-export-code-window-div')
    // var data = verilog.exportVerilog()
    // console.log(data)
    // editor.setValue(data)
    // $('#verilog-export-code-window-div .CodeMirror').css(
    //     'height',
    //     $(window).height() - 200
    // )
    // dialog.dialog({
    //     resizable: false,
    //     width: '90%',
    //     height: 'auto',
    //     position: { my: 'center', at: 'center', of: window },
    //     buttons: [
    //         {
    //             text: 'Download Verilog File',
    //             click() {
    //                 var fileName = getProjectName() || 'Untitled'
    //                 download(fileName + '.v', editor.getValue())
    //             },
    //         },
    //         {
    //             text: 'Copy to Clipboard',
    //             click() {
    //                 copyToClipboard(editor.getValue())
    //                 showMessage('Code has been copied')
    //             },
    //         },
    //         {
    //             text: 'Try in EDA Playground',
    //             click() {
    //                 copyToClipboard(editor.getValue())
    //                 openInNewTab('https://www.edaplayground.com/x/XZpY')
    //             },
    //         },
    //     ],
    // })
}

export function setupVerilogExportCodeWindow() {
    var myTextarea = document.getElementById('verilog-export-code-window')
    editor = CodeMirror.fromTextArea(myTextarea, {
        mode: 'verilog',
        autoRefresh: true,
        styleActiveLine: true,
        lineNumbers: true,
        autoCloseBrackets: true,
        smartIndent: true,
        indentWithTabs: true,
        extraKeys: { 'Ctrl-Space': 'autocomplete' },
    })
}

export var verilog = {
    // Entry point to verilog generation
    // scope = undefined means export all circuits
    exportVerilog: function (scope = undefined) {
        var dependencyList = {}
        // Reset Verilog Element State
        for (var elem in modules) {
            // Not sure if globalScope here is correct.
            if (modules[elem].resetVerilog) {
                modules[elem].resetVerilog()
            }
        }

        // List of devices under test for which testbench needs to be created
        var DUTs = []
        var SubCircuitIds = new Set()

        // Generate SubCircuit Dependency Graph
        for (id in scopeList) {
            dependencyList[id] = scopeList[id].getDependencies()
            for (var i = 0; i < scopeList[id].SubCircuit.length; i++) {
                SubCircuitIds.add(scopeList[id].SubCircuit[i].id)
            }
        }

        for (id in scopeList) {
            if (!SubCircuitIds.has(id)) DUTs.push(scopeList[id])
        }

        // DFS on SubCircuit Dependency Graph
        var visited = {}
        var elementTypesUsed = {}
        var output = ''
        if (scope) {
            // generate verilog only for scope
            output += this.exportVerilogScope(
                scope.id,
                visited,
                dependencyList,
                elementTypesUsed
            )
        } else {
            // generate verilog for everything
            for (id in scopeList) {
                output += this.exportVerilogScope(
                    id,
                    visited,
                    dependencyList,
                    elementTypesUsed
                )
            }
        }
        // Add Circuit Element - Module Specific Verilog Code
        for (var element in elementTypesUsed) {
            // If element has custom verilog
            if (modules[element] && modules[element].moduleVerilog) {
                output += modules[element].moduleVerilog()
            }
        }

        var report = this.generateReport(elementTypesUsed) + '\n'
        var testbench = this.generateTestBenchCode(DUTs)

        return report + testbench + output
    },
    generateReport: function (elementTypesUsed) {
        var output = ''
        output += '/**\n'
        output +=
            ' * This is an autogenerated netlist code from CircuitVerse. Verilog Code can be\n'
        output +=
            ' * tested on https://www.edaplayground.com/ using Icarus Verilog 0.9.7. This is an\n'
        output +=
            ' * experimental module and some manual changes make need to be done in order for\n'
        output += ' * this to work.\n'
        output += ' *\n'
        output +=
            ' * If you have any ideas/suggestions or bug fixes, raise an issue\n'
        output +=
            ' * on https://github.com/CircuitVerse/CircuitVerse/issues/new/choose\n'
        output += ' */\n'
        output += '\n'
        output += '/*\n'
        output += sp(1) + 'Element Usage Report\n'
        for (var elem in elementTypesUsed) {
            if (elem == 'Node') continue
            output += `${sp(2)}${elem} - ${elementTypesUsed[elem]} times\n`
        }
        output += '*/\n'
        output += '\n'
        var instructions = ''
        output += '/*\n'
        output += sp(1) + 'Usage Instructions and Tips\n'
        instructions +=
            sp(2) +
            'Labels - Ensure unique label names and avoid using verilog keywords\n'
        instructions +=
            sp(2) +
            'Warnings - Connect all optional inputs to remove warnings\n'
        for (var elem in elementTypesUsed) {
            // If element has custom instructions
            if (modules[elem] && modules[elem].verilogInstructions) {
                instructions += indent(2, modules[elem].verilogInstructions())
            }
        }
        output += instructions
        output += '*/\n'
        return output
    },
    generateTestBenchCode: function (DUTs) {
        if (DUTs.length == 0) return ''
        var output = '// Sample Testbench Code - Uncomment to use\n'

        output += '\n/*\n'
        output += 'module TestBench();\n'
        var registers = {}
        var wires = {}
        for (var i = 1; i <= 32; i++) registers[i] = new Set()
        for (var i = 1; i <= 32; i++) wires[i] = new Set()

        var clocks = new Set()
        var inputs = new Set()
        var outputs = new Set()
        var deviceInstantiations = ''
        for (var i = 0; i < DUTs.length; i++) {
            var DUT = DUTs[i]
            for (var j = 0; j < DUT.Input.length; j++) {
                var inp = DUT.Input[j]
                registers[inp.bitWidth].add(inp.label)
                inputs.add(inp.label)
            }
            for (var j = 0; j < DUT.Output.length; j++) {
                var out = DUT.Output[j]
                wires[out.bitWidth].add(out.label)
                outputs.add(out.label)
            }
            for (var j = 0; j < DUT.Clock.length; j++) {
                var inp = DUT.Clock[j]
                registers[1].add(inp.label)
                clocks.add(inp.label)
            }
            var circuitName = sanitizeLabel(DUT.name)
            var dutHeader = this.generateHeaderHelper(DUT)
            deviceInstantiations += `${sp(
                1
            )}${circuitName} DUT${i}${dutHeader}\n`
        }
        output += '\n'
        // Generate Reg Initialization Code
        for (var bitWidth = 1; bitWidth <= 32; bitWidth++) {
            if (registers[bitWidth].size == 0) continue
            var regArray = [...registers[bitWidth]]
            if (bitWidth == 1) output += `${sp(1)}reg ${regArray.join(', ')};\n`
            else
                output += `${sp(1)}reg [${bitWidth - 1}:0] ${regArray.join(
                    ', '
                )};\n`
        }
        output += '\n'
        // Generate Wire Initialization Code
        for (var bitWidth = 1; bitWidth <= 32; bitWidth++) {
            if (wires[bitWidth].size == 0) continue
            var wireArray = [...wires[bitWidth]]
            if (bitWidth == 1)
                output += `${sp(1)}wire ${wireArray.join(', ')};\n`
            else
                output += `${sp(1)}wire [${bitWidth - 1}:0] ${wireArray.join(
                    ', '
                )};\n`
        }
        output += '\n'

        output += deviceInstantiations

        if (clocks.size) {
            output += `${sp(1)}always begin\n`
            output += `${sp(2)}#10\n`
            for (var clk of clocks) output += `${sp(2)}${clk} = 0;\n`
            output += `${sp(2)}#10\n`
            for (var clk of clocks) output += `${sp(2)}${clk} = 1;\n`
            output += `${sp(1)}end\n`
            output += '\n'
        }

        output += `${sp(1)}initial begin\n`

        // Reset inputs to 0
        for (var inp of inputs) {
            output += `${sp(2)}${inp} = 0;\n`
        }
        output += '\n'
        output += `${sp(2)}#15\n`
        for (var out of outputs) {
            output += `${sp(2)}$display("${out} = %b", ${out});\n`
        }
        output += '\n'
        output += `${sp(2)}#10\n`
        for (var out of outputs) {
            output += `${sp(2)}$display("${out} = %b", ${out});\n`
        }
        output += '\n'
        output += `${sp(2)}$finish;\n\n`
        output += `${sp(1)}end\n`

        output += 'endmodule\n'

        output += '\n*/\n'

        return output
    },
    // Recursive DFS function
    exportVerilogScope: function (
        id,
        visited,
        dependencyList,
        elementTypesUsed
    ) {
        // Already Visited
        if (visited[id]) return ''
        // Mark as Visited
        visited[id] = true

        var output = ''
        // DFS on dependencies
        for (var i = 0; i < dependencyList[id].length; i++)
            output +=
                this.exportVerilogScope(
                    dependencyList[id][i],
                    visited,
                    dependencyList,
                    elementTypesUsed
                ) + '\n'

        var scope = scopeList[id]
        // Initialize labels for all elements
        this.resetLabels(scope)
        this.setLabels(scope)

        output += this.generateHeader(scope)
        output += this.generateOutputList(scope) // generate output first to be consistent
        output += this.generateInputList(scope)

        // Note: processGraph function populates scope.verilogWireList
        var res = this.processGraph(scope, elementTypesUsed)

        // Generate Wire Initialization Code
        for (var bitWidth = 1; bitWidth <= 32; bitWidth++) {
            var wireList = scope.verilogWireList[bitWidth]
            // Hack for splitter
            wireList = wireList.filter((x) => !x.includes('['))
            if (wireList.length == 0) continue
            if (bitWidth == 1) output += '  wire ' + wireList.join(', ') + ';\n'
            else
                output +=
                    '  wire [' +
                    (bitWidth - 1) +
                    ':0] ' +
                    wireList.join(', ') +
                    ';\n'
        }

        // Append Wire connections and module instantiations
        output += res

        // Append footer
        output += 'endmodule\n'

        return output
    },
    // Performs DFS on the graph and generates netlist of wires and connections
    processGraph: function (scope, elementTypesUsed) {
        // Initializations
        var res = ''
        scope.stack = []
        scope.verilogWireList = []
        for (var i = 0; i <= 32; i++) scope.verilogWireList.push(new Array())

        var verilogResolvedSet = new Set()

        // Start DFS from inputs
        for (var i = 0; i < inputList.length; i++) {
            for (var j = 0; j < scope[inputList[i]].length; j++) {
                scope.stack.push(scope[inputList[i]][j])
            }
        }

        // Iterative DFS on circuit graph
        while (scope.stack.length) {
            if (errorDetectedGet()) return
            var elem = scope.stack.pop()

            if (verilogResolvedSet.has(elem)) continue

            // Process verilog creates variable names and adds elements to DFS stack
            elem.processVerilog()

            // Record usage of element type
            if (elem.objectType != 'Node') {
                if (elementTypesUsed[elem.objectType])
                    elementTypesUsed[elem.objectType]++
                else elementTypesUsed[elem.objectType] = 1
            }

            if (
                elem.objectType != 'Node' &&
                elem.objectType != 'Input' &&
                elem.objectType != 'Clock'
            ) {
                verilogResolvedSet.add(elem)
            }
        }

        // Generate connection verilog code and module instantiations
        for (var elem of verilogResolvedSet) {
            res += '  ' + elem.generateVerilog() + '\n'
        }
        return res
    },

    resetLabels: function (scope) {
        for (var i = 0; i < scope.allNodes.length; i++) {
            scope.allNodes[i].verilogLabel = ''
        }
    },
    // Sets labels for all Circuit Elements elements
    setLabels: function (scope = globalScope) {
        /**
         * Sets a name for each element. If element is already labeled,
         * the element is used directly, otherwise an automated label is provided
         * sanitizeLabel is a helper function to escape white spaces
         */
        for (var i = 0; i < scope.Input.length; i++) {
            if (scope.Input[i].label == '') scope.Input[i].label = 'inp_' + i
            else scope.Input[i].label = sanitizeLabel(scope.Input[i].label)
            // copy label to node
            scope.Input[i].output1.verilogLabel = scope.Input[i].label
        }
        for (var i = 0; i < scope.ConstantVal.length; i++) {
            if (scope.ConstantVal[i].label == '')
                scope.ConstantVal[i].label = 'const_' + i
            else
                scope.ConstantVal[i].label = sanitizeLabel(
                    scope.ConstantVal[i].label
                )
            // copy label to node
            scope.ConstantVal[i].output1.verilogLabel =
                scope.ConstantVal[i].label
        }

        // copy label to clock
        for (var i = 0; i < scope.Clock.length; i++) {
            if (scope.Clock[i].label == '') scope.Clock[i].label = 'clk_' + i
            else scope.Clock[i].label = sanitizeLabel(scope.Clock[i].label)
            scope.Clock[i].output1.verilogLabel = scope.Clock[i].label
        }

        for (var i = 0; i < scope.Output.length; i++) {
            if (scope.Output[i].label == '') scope.Output[i].label = 'out_' + i
            else scope.Output[i].label = sanitizeLabel(scope.Output[i].label)
        }
        for (var i = 0; i < scope.SubCircuit.length; i++) {
            if (scope.SubCircuit[i].label == '')
                scope.SubCircuit[i].label =
                    scope.SubCircuit[i].data.name + '_' + i
            else
                scope.SubCircuit[i].label = sanitizeLabel(
                    scope.SubCircuit[i].label
                )
        }
        for (var i = 0; i < moduleList.length; i++) {
            var m = moduleList[i]
            for (var j = 0; j < scope[m].length; j++) {
                scope[m][j].verilogLabel =
                    sanitizeLabel(scope[m][j].label) ||
                    scope[m][j].verilogName() + '_' + j
            }
        }
    },
    generateHeader: function (scope = globalScope) {
        // Example: module HalfAdder (a,b,s,c);
        var res = '\nmodule ' + sanitizeLabel(scope.name)
        res += this.generateHeaderHelper(scope)
        return res
    },
    generateHeaderHelper: function (scope = globalScope) {
        // Example: (a,b,s,c);
        var res = '('
        var pins = []
        for (var i = 0; i < scope.Output.length; i++) {
            pins.push(scope.Output[i].label)
        }
        for (var i = 0; i < scope.Clock.length; i++) {
            pins.push(scope.Clock[i].label)
        }
        for (var i = 0; i < scope.Input.length; i++) {
            pins.push(scope.Input[i].label)
        }
        res += pins.join(', ')
        res += ');\n'
        return res
    },
    generateInputList: function (scope = globalScope) {
        var inputs = {}
        for (var i = 1; i <= 32; i++) inputs[i] = []

        for (var i = 0; i < scope.Input.length; i++) {
            inputs[scope.Input[i].bitWidth].push(scope.Input[i].label)
        }

        for (var i = 0; i < scope.Clock.length; i++) {
            inputs[scope.Clock[i].bitWidth].push(scope.Clock[i].label)
        }

        var res = ''
        for (var bitWidth in inputs) {
            if (inputs[bitWidth].length == 0) continue
            if (bitWidth == 1) res += '  input ' + inputs[1].join(', ') + ';\n'
            else
                res +=
                    '  input [' +
                    (bitWidth - 1) +
                    ':0] ' +
                    inputs[bitWidth].join(', ') +
                    ';\n'
        }

        return res
    },
    generateOutputList: function (scope = globalScope) {
        // Example 1: output s,cout;
        var outputs = {}
        for (var i = 0; i < scope.Output.length; i++) {
            if (outputs[scope.Output[i].bitWidth])
                outputs[scope.Output[i].bitWidth].push(scope.Output[i].label)
            else outputs[scope.Output[i].bitWidth] = [scope.Output[i].label]
        }
        var res = ''
        for (var bitWidth in outputs) {
            if (bitWidth == 1)
                res += '  output ' + outputs[1].join(',  ') + ';\n'
            else
                res +=
                    '  output [' +
                    (bitWidth - 1) +
                    ':0] ' +
                    outputs[bitWidth].join(', ') +
                    ';\n'
        }

        return res
    },
    /*
    sanitizeLabel: function(name){
        // Replace spaces by "_"
        name = name.replace(/ /g , "_");
        // Replace Hyphens by "_"
        name = name.replace(/-/g , "_");
        // Replace Colons by "_"
        name = name.replace(/:/g , "_");
        // replace ~ with inv_
        name = name.replace(/~/g , "inv_");
        // Shorten Inverse to inv
        name = name.replace(/Inverse/g , "inv");

        // If first character is a number
        if(name.substring(0, 1).search(/[0-9]/g) > -1) {
            name = "w_" + name;
        }

        // if first character is not \ already
        if (name[0] != '\\') {
            //if there are non-alphanum_ character, add \
            if (name.search(/[\W]/g) > -1)
                name = "\\" + name;
        }
        return name;
    },
    */
}

/*
    Helper function to generate spaces for indentation
*/
function sp(indentation) {
    return ' '.repeat(indentation * 2)
}

/*
    Helper function to indent paragraph
*/
function indent(indentation, string) {
    var result = string.split('\n')
    if (result[result.length - 1] == '') {
        result.pop()
        result = result.map((x) => sp(indentation) + x).join('\n')
        result += '\n'
        return result
    }
    return result.map((x) => sp(indentation) + x).join('\n')
}
