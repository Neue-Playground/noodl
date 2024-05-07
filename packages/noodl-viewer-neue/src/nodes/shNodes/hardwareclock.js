'use strict';

const DeviceNode = {
  name: 'Hardware Clock',
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
    'On/Off': {
      type: 'boolean',
      displayName: 'On/Off',
      set() {
        this._internal['On/Off'] = false;
      },
      get() {
        return this._internal['On/Off'];
      }
    },
    'Read Rate': {
      type: 'number',
      displayName: 'Read Rate',
      get() {
        return this._internal['Read Rate'];
      }
    }
  },
  outputs: {
    'Read value': {
      type: 'number',
      displayName: 'Read value',
      get() {
        return this._internal.result;
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
