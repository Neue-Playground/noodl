'use strict';

const DeviceNode = {
  name: 'Commands Input',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    this._internal.inputs = [];
  },
  getInspectInfo() {
    return and(this._internal.inputs);
  },
  outputs: {
    Command: {
      type: 'string',
      displayName: 'Command',
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
