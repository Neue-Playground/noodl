'use strict';

const DeviceNode = {
  name: 'Compare',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    'Value in': {
      type: 'number',
      displayName: 'Value in'
    },
    'is': {
      type: {
        displayName: 'is',
        type: 'enum',
        options: ['=', '>', '<', '>=', '<=', '!='],
        default: '=',
        allowEditOnly: true
      },
      displayName: 'is'
    },
    'Condition value': {
      type: {
        name: 'number',
        allowEditOnly: true
      },
      displayName: 'Condition value'
    },
  },
  outputs: {
    'Equal out': {
      type: 'boolean',
      displayName: 'Equal out',
      group: 'Equal'
    },
    'Equal value out': {
      type: 'number',
      displayName: 'Equal value out',
      group: 'Equal'
    },
    'Greater than': {
      type: 'boolean',
      displayName: 'Greater than',
      group: 'Greater'
    },
    'Greater than value out': {
      type: 'number',
      displayName: 'Greater than value out',
      group: 'Greater'
    },
    'Smaller than': {
      type: 'boolean',
      displayName: 'Smaller than',
      group: 'Smaller'
    },
    'Smaller than value out': {
      type: 'number',
      displayName: 'Smaller than value out',
      group: 'Smaller'
    },
    'Error out': {
      type: 'number',
      displayName: 'Error out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
