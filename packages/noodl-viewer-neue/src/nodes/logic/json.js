'use strict';

const DeviceNode = {
  name: 'Convert to json',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    'Json Template': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'Json Template'
    },
    'JSON Creator in 1': {
      type: 'string',
      displayName: 'JSON Creator in 1'
    },
    'JSON Creator in 2': {
      type: 'string',
      displayName: 'JSON Creator in 2'
    },
    'JSON Creator in 3': {
      type: 'string',
      displayName: 'JSON Creator in 3'
    },
  },
  outputs: {
    'JSON out': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'JSON out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
