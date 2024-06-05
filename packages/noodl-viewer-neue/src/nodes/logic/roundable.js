'use strict';

const RoundableObjectNode = {
  name: 'Roundable object',
  docs: 'https://docs.noodl.net/nodes/core/roundable-object',
  category: 'Core',
  color: 'core',
  initialize: function () {
    // Initialization code if needed
  },
  inputs: {
    'Content mode': {
      displayName: 'Content mode',
      type: 'string'
    },
    'Border color alpha': {
      displayName: 'Border color alpha',
      type: 'number'
    }
  },
  outputs: {},
  settings: {
    'Name': {
      displayName: 'Name',
      type: 'string',
      default: 'Roundable object'
    },
    'requiredAppVersion': {
      displayName: '',
      type: 'number',
      default: 1
    },
    'Width': {
      displayName: 'Width',
      type: 'number',
      default: 10
    },
    'Height': {
      displayName: 'Height',
      type: 'number',
      default: 10
    },
    'Z value': {
      displayName: 'Z value',
      type: 'number',
      default: 0
    },
    'Visible': {
      displayName: 'Visible',
      type: 'boolean',
      default: true
    },
    'Rounded corners': {
      displayName: 'Rounded corners',
      type: 'number',
      default: 0
    },
    'Left': {
      displayName: 'Left',
      type: 'number',
      default: 40
    },
    'Top': {
      displayName: 'Top',
      type: 'number',
      default: 40
    },
    'Right': {
      displayName: 'Right',
      type: 'number',
      default: 40
    },
    'Bottom': {
      displayName: 'Bottom',
      type: 'number',
      default: 10
    },
    'Horizontal alignment': {
      displayName: 'Horizontal alignment',
      type: 'string',
      default: 'none'
    },
    'Vertical alignment': {
      displayName: 'Vertical alignment',
      type: 'string',
      default: 'none'
    },
    'Background color red': {
      displayName: 'Background color red',
      type: 'number',
      default: 255
    },
    'Background color green': {
      displayName: 'Background color green',
      type: 'number',
      default: 255
    },
    'Background color blue': {
      displayName: 'Background color blue',
      type: 'number',
      default: 255
    },
    'Background color alpha': {
      displayName: 'Background color alpha',
      type: 'number',
      default: 1
    },
    'Border color red': {
      displayName: 'Border color red',
      type: 'number',
      default: 0
    },
    'Border color green': {
      displayName: 'Border color green',
      type: 'number',
      default: 0
    },
    'Border color blue': {
      displayName: 'Border color blue',
      type: 'number',
      default: 0
    },
    'Border color alpha': {
      displayName: 'Border color alpha',
      type: 'number',
      default: 1
    },
    'Image': {
      displayName: 'Image',
      type: 'image'
    },
    'Notes': {
      displayName: 'Notes',
      type: 'string',
      default: ''
    },
    'AutomatableWidth': {
      displayName: 'Width',
      type: 'number',
      default: 40
    },
    'AutomatableHeight': {
      displayName: 'Height',
      type: 'number',
      default: 40
    },
    'Left type': {
      displayName: 'Left type',
      type: 'string',
      default: 'Point'
    },
    'Top type': {
      displayName: 'Top type',
      type: 'string',
      default: 'Point'
    },
    'Right type': {
      displayName: 'Right type',
      type: 'string',
      default: 'Automatic'
    },
    'Bottom type': {
      displayName: 'Bottom type',
      type: 'string',
      default: 'Automatic'
    },
    'Width type': {
      displayName: 'Width type',
      type: 'string',
      default: 'Point'
    },
    'Height type': {
      displayName: 'Height type',
      type: 'string',
      default: 'Point'
    },
    'designSystemVersion': {
      displayName: 'Height',
      type: 'number',
      default: 1
    }
  }
};

module.exports = {
  node: RoundableObjectNode
};
