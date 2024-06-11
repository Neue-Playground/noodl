'use strict';

const StringNumberNode = {
  name: 'String/Number',
  docs: 'https://docs.noodl.net/nodes/core/string-number',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Trigger in': {
      displayName: 'Trigger in',
      type: 'signal'
    }
  },
  outputs: {
    'String/Number out': {
      displayName: 'String/Number out',
      type: 'any'
    }
  },
  settings: {
    'Name': {
      displayName: 'Name',
      type: 'string',
      default: 'String/Number'
    },
    'requiredAppVersion': {
      displayName: '',
      type: 'number',
      default: 1
    },
    'String or number': {
      displayName: 'String or number',
      type: 'string',
      default: ''
    },
    'Type': {
      displayName: 'Type',
      type: 'enum',
      options: ['Auto detect', 'String', 'Integer', 'Float'],
      default: 'Auto detect'
    },
    'Notes': {
      displayName: 'Notes',
      type: 'string',
      default: ''
    }
  }
};

module.exports = {
  node: StringNumberNode
};
