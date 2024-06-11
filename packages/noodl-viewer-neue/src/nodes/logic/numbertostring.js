'use strict';

const NumberToStringNode = {
  name: 'Number to string',
  docs: 'https://docs.noodl.net/nodes/core/number-to-string',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'Number in': {
      displayName: 'Number in',
      type: 'number'
    }
  },
  outputs: {
    'String out': {
      displayName: 'String out',
      type: 'string'
    }
  },
  settings: {
    'Name': {
      displayName: 'Name',
      type: 'string',
      default: 'Number to string'
    },
    'requiredAppVersion': {
      displayName: '',
      type: 'number',
      default: 1
    },
    'Min nr of integer digits': {
      displayName: 'Min nr of integer digits',
      type: 'number',
      default: 2,
      min: 0,
      max: 7
    },
    'Max nr of integer digits': {
      displayName: 'Max nr of integer digits',
      type: 'number',
      default: 2,
      min: 0,
      max: 7
    },
    'Max nr of decimal digits': {
      displayName: 'Max nr of decimal digits',
      type: 'number',
      default: 2,
      min: 0,
      max: 7
    },
    'Min nr of decimal digits': {
      displayName: 'Min nr of decimal digits',
      type: 'number',
      default: 2,
      min: 0,
      max: 7
    },
    'Decimal separator': {
      displayName: 'Decimal separator',
      type: 'string',
      default: '.'
    },
    'Comment': {
      displayName: 'Notes',
      type: 'string',
      default: ''
    }
  }
};

module.exports = {
  node: NumberToStringNode
};
