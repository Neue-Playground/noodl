const fs = require('fs');

// Load the JSON file
const data = fs.readFileSync('patches.json', 'utf8');
const patches = JSON.parse(data);

// Function to convert JSON patch to JavaScript object
function convertPatch(patch) {
  const jsPatch = {
    name: patch.type,
    docs: '', // Placeholder, no information given about docs URL
    category: 'Neue', // Assuming 'Neue' as the category based on the example
    color: 'neueData', // Assuming color based on the example
    initialize: function () { this._internal.inputs = []; },
    inputs: {},
    outputs: {}
  };

  // Convert settings to inputs
  if (patch.setting-inputs) {
    patch.setting-inputs.forEach(setting => {
      const settingInfo = patch.settings.find(s => s.name === setting);
      if (settingInfo) {
        jsPatch.inputs[settingInfo.name] = {
          type: settingInfo['value-type'].toLowerCase().includes('numeric') ? 'number' : 'string',
          displayName: settingInfo.name
        };
        if (settingInfo['numeric-value-type'] === 'Int') {
          jsPatch.inputs[settingInfo.name].type = 'number';
        }
      }
    });
  }

  // Convert available inputs
  if (patch.inputs) {
    patch.inputs.forEach(input => {
      jsPatch.inputs[input] = {
        type: { name: '*', allowConnectionsOnly: true },
        displayName: input
      };
    });
  }

  // Convert available outputs
  if (patch.outputs) {
    patch.outputs.forEach(output => {
      jsPatch.outputs[output] = {
        type: 'string',
        displayName: output
      };
    });
  }

  return jsPatch;
}

// Convert all patches
const deviceNode = {};
Object.keys(patches).forEach(key => {
  deviceNode[key] = convertPatch(patches[key]);
});

// Output the converted object
const output = {
  node: deviceNode
};

fs.writeFileSync('convertedPatches.js', `module.exports = ${JSON.stringify(output, null, 2)};`);

console.log('Conversion complete! Check the convertedPatches.js file.');
