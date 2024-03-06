'use strict';

const DeviceNode = {
  name: 'Toggle',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Logic',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    "Toggle 1 in": {
      type: 'number',
      displayName: 'Toggle 1 in'
    },
    "Toggle 2 in": {
      type: 'number',
      displayName: 'Toggle 2 in'
    },
    "Toggle 3 in": {
      type: 'number',
      displayName: 'Toggle 3 in'
    },
    "Toggle 4 in": {
      type: 'number',
      displayName: 'Toggle 4 in'
    },
    "Toggle 5 in": {
      type: 'number',
      displayName: 'Toggle 5 in'
    },
    "Toggle 6 in": {
      type: 'number',
      displayName: 'Toggle 6 in'
    },
    "Toggle 7 in": {
      type: 'number',
      displayName: 'Toggle 7 in'
    },
    "Toggle 8 in": {
      type: 'number',
      displayName: 'Toggle 8 in'
    }
  },
  outputs: {
    "Toggle 1 out": {
      type: 'number',
      displayName: 'Toggle 1 out'
    },
    "Toggle 2 out": {
      type: 'number',
      displayName: 'Toggle 2 out'
    },
    "Toggle 3 out": {
      type: 'number',
      displayName: 'Toggle 3 out'
    },
    "Toggle 4 out": {
      type: 'number',
      displayName: 'Toggle 4 out'
    },
    "Toggle 5 out": {
      type: 'number',
      displayName: 'Toggle 5 out'
    },
    "Toggle 6 out": {
      type: 'number',
      displayName: 'Toggle 6 out'
    },
    "Toggle 7 out": {
      type: 'number',
      displayName: 'Toggle 7 out'
    },
    "Toggle 8 out": {
      type: 'number',
      displayName: 'Toggle 8 out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
