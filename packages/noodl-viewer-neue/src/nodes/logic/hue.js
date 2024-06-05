'use strict';

const PhilipsHUENode = {
  name: 'Philips HUE',
  docs: 'https://docs.noodl.net/nodes/neue/philips-hue',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    // Initialization code if needed
  },
  inputs: {
    'Light On': {
      type: 'signal',
      displayName: 'Light On'
    },
    'Light Off': {
      type: 'signal',
      displayName: 'Light Off'
    },
    'Change Brightness': {
      type: 'number',
      displayName: 'Change Brightness'
    },
    'Change Saturation': {
      type: 'number',
      displayName: 'Change Saturation'
    },
    'Change Hue': {
      type: 'number',
      displayName: 'Change Hue'
    },
    'Change Temperature': {
      type: 'number',
      displayName: 'Change Temperature'
    },
    'Change X': {
      type: 'number',
      displayName: 'Change X'
    },
    'Change Y': {
      type: 'number',
      displayName: 'Change Y'
    },
    'Change Red': {
      type: 'number',
      displayName: 'Change Red'
    },
    'Change Green': {
      type: 'number',
      displayName: 'Change Green'
    },
    'Change Blue': {
      type: 'number',
      displayName: 'Change Blue'
    },
    'Single alert': {
      type: 'signal',
      displayName: 'Single alert'
    },
    '30 sec alert': {
      type: 'signal',
      displayName: '30 sec alert'
    },
    'Stop alert': {
      type: 'signal',
      displayName: 'Stop alert'
    },
    'Start color loop': {
      type: 'signal',
      displayName: 'Start color loop'
    },
    'Stop color loop': {
      type: 'signal',
      displayName: 'Stop color loop'
    }
  },
  outputs: {},
  settings: {
    'Name': {
      type: 'string',
      displayName: 'Name',
      default: 'Philips HUE'
    },
    'BridgeList': {
      type: 'string',
      displayName: 'Philips HUE Bridge'
    },
    'LightList': {
      type: 'string',
      displayName: 'Philips HUE Light'
    },
    'Toggle light': {
      type: 'boolean',
      displayName: 'Toggle light'
    },
    'Hue': {
      type: 'number',
      displayName: 'Hue',
      default: 0
    },
    'Saturation': {
      type: 'number',
      displayName: 'Saturation',
      default: 0
    },
    'Brightness': {
      type: 'number',
      displayName: 'Brightness',
      default: 0
    },
    'Temperature': {
      type: 'number',
      displayName: 'Temperature',
      default: 153
    },
    'X': {
      type: 'number',
      displayName: 'X',
      default: 0
    },
    'Y': {
      type: 'number',
      displayName: 'Y',
      default: 0
    },
    'Red': {
      type: 'number',
      displayName: 'Red',
      default: 0
    },
    'Green': {
      type: 'number',
      displayName: 'Green',
      default: 0
    },
    'Blue': {
      type: 'number',
      displayName: 'Blue',
      default: 0
    },
    'requiredAppVersion': {
      type: 'number',
      displayName: '',
      default: 1
    },
    'Notes': {
      type: 'string',
      displayName: 'Notes',
      default: ''
    }
  }
};

module.exports = {
  node: PhilipsHUENode
};
