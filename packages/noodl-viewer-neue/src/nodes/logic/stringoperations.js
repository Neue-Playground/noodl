'use strict';

const DeviceNode = {
  name: 'String operations',
  docs: '',  // Placeholder, no information given about docs URL
  category: 'Neue',
  color: 'neueLogic',  // Assuming color based on the example
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'String in': {
      type: {
        name: '*',
        allowConnectionsOnly: true
      },
      displayName: 'String in'
    },
    'Operation': {
      type: {
        name: 'enum',
        enums: [
          { label: 'Append', value: 'append' },
          { label: 'Prepend', value: 'prepend' },
          { label: 'Remove', value: 'remove' },
          { label: 'Replace', value: 'replace' },
          { label: 'To lower case', value: 'toLowerCase' },
          { label: 'To upper case', value: 'toUpperCase' }
        ]
      },
      default: 'append',
      displayName: 'Operation'
    },
    'Notes': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'Notes'
    },
    'Argument': {
      type: 'string',
      displayName: 'Argument'
    },
    'Replace with': {
      type: 'string',
      displayName: 'Replace with'
    }
  },
  outputs: {
    'String out': {
      type: 'string',
      displayName: 'String out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
