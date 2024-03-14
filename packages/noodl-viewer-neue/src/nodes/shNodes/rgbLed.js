'use strict';

const DeviceNode = {
  name: 'A2.1 RGB LED',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neueSensor',
  initialize: function () {
    this._internal.inputs = [];
  },
  getInspectInfo() {
    return and(this._internal.inputs);
  },
  inputs: {
    'Red in': {
      type: 'color',
      default: '#FF0000',
      displayName: 'Red',
      allowVisualStates: true,
      get() {
        return this._internal['Red in'];
      }
    },
    'Green in': {
      type: 'color',
      default: '#00FF00',
      displayName: 'Green',
      allowVisualStates: true,
      get() {
        return this._internal['Green in'];
      }
    },
    'Blue in': {
      type: 'color',
      default: '#0000FF',
      displayName: 'Blue',
      allowVisualStates: true,
      get() {
        return this._internal['Blue in'];
      }
    }
  },
  outputs: {}
};

module.exports = {
  node: DeviceNode
};

function and(values) {
  //if none are false, then return true
  return values.length > 0 && values.some((v) => !v) === false;
}
