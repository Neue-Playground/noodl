'use strict';

const DeviceNode = {
  name: 'State',
  docs: '',  // Placeholder, no information given about docs URL
  category: 'Neue',  // Assuming 'Neue' as the category based on the example
  color: 'neueData',  // Assuming color based on the example
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {},
  outputs: {
    'State out': {
      type: '*',  // Assuming a generic type since it's not specified
      displayName: 'State out'
    }
  },
  settings: {
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
      default: 'State'
    },
    'State': {
      type: 'string',
      displayName: 'State'
    }
  }
};

module.exports = {
  node: DeviceNode
};
