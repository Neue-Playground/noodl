'use strict';

const MathNode = {
  name: 'Math',
  docs: 'https://docs.noodl.net/nodes/core/math',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Math in': {
      displayName: 'Math in',
      type: 'any'
    }
  },
  outputs: {
    'Result out': {
      displayName: 'Result out',
      type: 'number'
    }
  },
  settings: {
    'Name': {
      displayName: 'Name',
      type: 'string',
      default: 'Math'
    },
    'requiredAppVersion': {
      displayName: '',
      type: 'number',
      default: 1
    },
    'Operator': {
      displayName: 'Math operator',
      type: 'string',
      default: '+',
      options: ['+', '-', '/', '*', '%']
    },
    'Operand': {
      displayName: 'Operand',
      type: 'number',
      default: 1
    },
    'Comment': {
      displayName: 'Notes',
      type: 'string',
      default: ''
    }
  }
};

module.exports = {
  node: MathNode
};
