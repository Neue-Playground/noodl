'use strict';

const DeviceNode = {
  name: 'USB',
  docs: 'https://docs.noodl.net/nodes/neue/mqtt',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Port 1': {
      type: '*',
      group: 'Connection'
    },
    'Port 2': {
      type: '*',
      group: 'Connection'
    },
    'Port 3': {
      type: '*',
      group: 'Connection'
    },
    'Port 4': {
      type: '*',
      group: 'Connection'
    },
  },
  outputs: {
  }
};

module.exports = {
  node: DeviceNode
};
