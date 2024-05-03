// import fs from 'fs';
const input = require('./max44009.json');  // eslint-disable-line @typescript-eslint/no-var-requires
const sensor = input.sensor;
let node = {
  name: sensor.name,
  docs: "https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/",
  category: "Neue",
  color: "neueSensor",
  // initialize: function () {
  //   this._internal.inputs = [];
  // },
  inputs: {

  },
  outputs: {},
};
sensor.groups.forEach(group => {
  group.configParams.forEach(param => {
    node.inputs[param.internalName] = {
      group: group.groupName,
      displayName: param.name,
      // get() {
      //   return this._internal[param.name];
      // }
    }
    if (param.guiControl === "slider") {
      if (param.values.length > 1) {
        node.inputs[param.internalName].type = {
          name: "enum",
          enums: [],
          allowEditOnly: true
        };
        param.values.forEach((value, i) => {
          if (param.defaultValue[1] === value[2]) node.inputs[param.internalName].default = value[2] + "";
          node.inputs[param.internalName].type.enums.push({
            label: value[0],
            value: value[2] + ""
          })
        })
        if (node.inputs[param.internalName].default === undefined) node.inputs[param.internalName].default = param.values[0][2] + "";
      } else {
        node.inputs[param.internalName].type = {
          name: "slider",
          min: param.values[0][1].min,
          max: param.values[0][1].max,
          step: param.values[0][1].step,
          allowEditOnly: true,
        };
        node.inputs[param.internalName].default = 0
        node.inputs[param.internalName].set = `set(value) {\n if(value === undefined) return\n if(value < ${param.values[0][1].min}) value = ${param.values[0][1].min}\n if(value > ${param.values[0][1].max}) value = ${param.values[0][1].max}\n this._internal['${param.internalName}'] = value;\n}`
      }
      node.inputs[param.internalName].get = `get() {\n return this._internal['${param.internalName}'];\n}`
    } else if (param.guiControl === "checkbox") {
      node.inputs[param.internalName].type = {
        name: "boolean",
        allowEditOnly: true
      };
      node.inputs[param.internalName].default = param.defaultValue[0];
    }
  })
})
sensor.ports.forEach(port => {
  let type
  switch (port.value) {
    case "bool":
      type = "boolean"
      break;
    case "data":
      type = "number"
      break;
    case "event":
      type = "signal"
      break;
    default:
      type = "number"
      break;
  }
  let nodePort = {
    group: "Ports",
    displayName: port.name,
    type: type
  }
  node[port.type === "in" ? "inputs" : "outputs"][port.name] = nodePort
})

let jsonString = JSON.stringify(node, undefined, 2)
jsonString = jsonString.replace(`"color": "neueSensor",`, '"color": "neueSensor",\n  initialize: function () {\n    this._internal.inputs = [];\n  },\n')
jsonString = jsonString.replaceAll("\"set\": \"", '')
jsonString = jsonString.replaceAll("\"get\": \"", '')
jsonString = jsonString.replaceAll('\\n}"', '\n\t}')
jsonString = jsonString.replaceAll('\\n', '\n\t')
console.log(jsonString)


