'use strict';

const DeviceNode = {
  name: 'Signal inverter',
  docs: 'https://docs.noodl.net/nodes/utilities/logic/condition',
  category: 'Neue',
  color: 'neueLogic',
  initialize: function () {
    this._internal.inputs = [];
  },

  inputs: {
    "Signal in": {
      displayName: "Signal in",
      type: {
        name: "*",
        allowConnectionOnly: true
      }
    },
  },
  outputs: {
    "Signal out": {
      displayName: "Signal out",
      type: "*"
    },
  },
};

module.exports = {
  node: DeviceNode
};
