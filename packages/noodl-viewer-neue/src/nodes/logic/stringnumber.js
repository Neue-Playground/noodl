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
      type: '*'
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
      type: {
        name: 'string',
        allowEditOnly: true
      },
      default: ''
    }
  },
  outputs: {
    'String/Number out': {
      displayName: 'String/Number out',
      type: 'any'
    }
  },
  settings: {

  }
};

module.exports = {
  node: StringNumberNode
};
