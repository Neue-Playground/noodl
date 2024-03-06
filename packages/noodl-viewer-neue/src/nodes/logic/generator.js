'use strict';

const DeviceNode = {
  name: 'Value generator',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Logic',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    "Trigger in 1": {
      type: 'number',
      displayName: 'Trigger in 1'
    },
    "Trigger in 2": {
      type: 'number',
      displayName: 'Trigger in 2'
    },
    "Trigger in 3": {
      type: 'number',
      displayName: 'Trigger in 3'
    },
    "Trigger in 4": {
      type: 'number',
      displayName: 'Trigger in 4'
    },
    "Trigger in 5": {
      type: 'number',
      displayName: 'Trigger in 5'
    },
    "Trigger in 6": {
      type: 'number',
      displayName: 'Trigger in 6'
    },
    "Trigger in 7": {
      type: 'number',
      displayName: 'Trigger in 7'
    },
    "Trigger in 8": {
      type: 'number',
      displayName: 'Trigger in 8'
    },
    "Value out": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Value out'
    }
  },
  outputs: {
    "Value out": {
      type: 'boolean',
      displayName: 'Value out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
