'use strict';

const DeviceNode = {
  name: 'Signal gate',
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
    isOpen: {
      displayName: "isOpen",
      type: "boolean",
      default: true
    },
    Open: {
      displayName: "Open",
      type: {
        name: "*",
        allowConnectionOnly: true
      }
    },
    Close: {
      displayName: "Close",
      type: {
        name: "*",
        allowConnectionOnly: true
      }
    },
  },
  outputs: {
    "Signal out": {
    "displayName": "Signal out",
      "type": "*"
    },
  },
};

module.exports = {
  node: DeviceNode
};
