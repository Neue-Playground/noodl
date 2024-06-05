'use strict';

const ListBuilderNode = {
  name: 'List builder',
  docs: 'https://docs.noodl.net/nodes/neue/list-builder',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    // Initialization code if needed
  },
  inputs: {
    'Value in': {
      type: '*',
      displayName: 'Value in'
    }
  },
  outputs: {
    'List out': {
      type: 'array',
      displayName: 'List out'
    },
    'Min out': {
      type: '*',
      displayName: 'Min out'
    },
    'Max out': {
      type: '*',
      displayName: 'Max out'
    },
    'Avg out': {
      type: '*',
      displayName: 'Avg out'
    },
    'Vector length out': {
      type: 'number',
      displayName: 'Vector length out'
    },
    'Count out': {
      type: 'number',
      displayName: 'Count out'
    },
    'Values out': {
      type: '*',
      displayName: 'Values out'
    },
    'Sum out': {
      type: '*',
      displayName: 'Sum out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'List builder'
    },
    'Max number of elements': {
      type: 'number',
      displayName: 'Max number of elements',
      default: 1
    },
    'Notes': {
      type: 'string',
      displayName: 'Notes'
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    }
  }
};

module.exports = {
  node: ListBuilderNode
};
