'use strict';

const DeviceNode = {
  name: 'Range',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'visual',
  initialize: function () {
    this._internal.inputs = [];
  },
  getInspectInfo() {
    return and(this._internal.inputs);
  },
  inputs: {
    value: {
      type: 'number',
      displayName: 'Value',
      get() {
        return this._internal.value;
      }
    },
    inputMax: {
      type: 'number',
      displayName: 'Input range max',
      get() {
        return this._internal.inputMax;
      }
    },
    inputMin: {
      type: 'number',
      displayName: 'Input range min',
      get() {
        return this._internal.inputMin;
      }
    },
    outputMax: {
      type: 'number',
      displayName: 'Output range max',
      get() {
        return this._internal.outputMax;
      }
    },
    outputMin: {
      type: 'number',
      displayName: 'Output range min',
      get() {
        return this._internal.outputMin;
      }
    },
  },
  outputs: {
    value: {
      type: 'number',
      displayName: 'Value',
      get() {
        return this._internal.value;
      }
    }
  }
};

module.exports = {
  node: DeviceNode
};

function and(values) {
  //if none are false, then return true
  return values.length > 0 && values.some((v) => !v) === false;
}
