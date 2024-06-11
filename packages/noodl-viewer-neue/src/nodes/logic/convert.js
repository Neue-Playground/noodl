'use strict';

const ConvertFromJSONNode = {
  name: 'Convert from json',
  docs: 'https://docs.noodl.net/nodes/neue/convert-from-json',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'JSON in': {
      type: {
        name: '*',
        allowConnectionsOnly: true
      },
      displayName: 'JSON in'
    }
  },
  outputs: {
    'Parsed out': {
      type: '*',
      displayName: 'Parsed out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Convert from json'
    },
    'Key': {
      type: 'string',
      displayName: 'Key',
      default: ''
    },
    'Condition': {
      type: 'string',
      displayName: 'Condition',
      default: ''
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    }
  }
};

module.exports = {
  node: ConvertFromJSONNode
};
