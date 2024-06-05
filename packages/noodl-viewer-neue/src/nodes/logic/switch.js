'use strict';

const DeviceNode = {
  name: 'Switch',
  docs: '',  // Placeholder, no information given about docs URL
  category: 'Neue',  // Assuming 'Neue' as the category based on the example
  color: 'neueData',  // Assuming color based on the example
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {},
  outputs: {
    'Switch out': {
      type: '*',  // Assuming a generic type since it's not specified
      displayName: 'Switch out'
    }
  },
  settings: {
    'Selected input': {
      type: 'number',
      displayName: 'Selected input',
      default: 0
    },
    'Notes': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'Notes'
    },
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Switch'
    }
  }
};

module.exports = {
  node: DeviceNode
};
