'use strict';

const DeviceNode = {
  name: 'Compare',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Logic',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    "Value in": {
      type: 'number',
      displayName: 'Value in'
    },
    "Threshold 1": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 1',
      group: 'Threshold'
    },
    "Threshold 2": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 2',
      group: 'Threshold'
    },
    "Threshold 3": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 3',
      group: 'Threshold'
    },
    "Threshold 4": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 4',
      group: 'Threshold'
    },
    "Threshold 5": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 5',
      group: 'Threshold'
    },
    "Threshold 6": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 6',
      group: 'Threshold'
    },
    "Threshold 7": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 7',
      group: 'Threshold'
    },
    "Threshold 8": {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Threshold 8',
      group: 'Threshold'
    }
  },
  outputs: {
    "Equal out": {
      type: 'boolean',
      displayName: 'Equal out',
      group: 'Equal'
    },
    "Equal value out": {
      type: 'number',
      displayName: 'Equal value out',
      group: 'Equal'
    },
    "Greater than": {
      type: 'boolean',
      displayName: 'Greater than',
      group: 'Greater'
    },
    "Greater than value out": {
      type: 'number',
      displayName: 'Greater than value out',
      group: 'Greater'
    },
    "Smaller than": {
      type: 'boolean',
      displayName: 'Smaller than',
      group: 'Smaller'
    },
    "Smaller than value out": {
      type: 'number',
      displayName: 'Smaller than value out',
      group: 'Smaller'
    },
    "Error out": {
      type: 'number',
      displayName: 'Error out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
