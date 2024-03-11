'use strict';

const DeviceNode = {
  name: 'Threshold',
  docs: '',
  category: 'Neue',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    valueIn: {
      type: 'number',
      displayName: 'Value in',
      get() {
        return this._internal.valueIn;
      }
    },
    inputMin: {
      type: 'number',
      displayName: 'Input range min',
      get() {
        return this._internal.inputMin;
      }
    },
    inputMax: {
      type: 'number',
      displayName: 'Input range max',
      get() {
        return this._internal.inputMax;
      }
    },
    outputMin: {
      type: 'number',
      displayName: 'Output range min',
      get() {
        return this._internal.outputMin;
      }
    },
    outputMax: {
      type: 'number',
      displayName: 'Output range max',
      get() {
        return this._internal.outputMax;
      }
    }
  },
  outputs: {
    valueOut: {
      type: 'number',
      displayName: 'Value out',
      get() {
        return this._internal.valueOut;
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};
