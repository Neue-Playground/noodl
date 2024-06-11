'use strict';

const SplitListNode = {
  name: 'Split list',
  docs: 'https://docs.noodl.net/nodes/neue/split-list',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'List in': {
      type: 'array',
      displayName: 'List in'
    }
  },
  outputs: {
    'Result out': {
      type: 'array',
      displayName: 'Result out'
    }
  },
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Split'
    },
    'Split start': {
      type: 'number',
      displayName: 'Split start',
      default: 1
    },
    'Split end': {
      type: 'number',
      displayName: 'Split end',
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
  node: SplitListNode
};
