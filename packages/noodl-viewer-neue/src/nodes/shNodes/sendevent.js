'use strict';

const DeviceNode = {
  name: 'Register event',
  docs: 'https://www.neue.se/support-documentation/building-an-app/patches-the-building-blocks/',
  category: 'Neue',
  color: 'neue',
  initialize: function () {
    this._internal.inputs = [];
  },
  getInspectInfo() {
    return and(this._internal.inputs);
  },
  inputs: {
    "Event type": {
      type: {
        name: 'enum',
        enums: ['Acceleration event', 'Temperature event', 'Hardware clock event', 'Command event'],
        allowEditOnly: true
      },
      displayName: 'Event type',
      get() {
        return this._internal["Event type"];
      }
    },
    "Send data": {
      type: 'signal',
      displayName: 'Send data',
      get() {
        return this._internal["Send data"];
      }
    }
  },
  outputs: {
    "Response": {
      type: 'string',
      displayName: 'Response',
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
