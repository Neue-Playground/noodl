const DeviceNode = {
    name: 'Flag',
    docs: '',  // Placeholder, no information given about docs URL
    category: 'Neue',  // Assuming 'Neue' as the category based on the example
    color: 'neueData',  // Assuming color based on the example
    initialize: function () {
      this._internal.inputs = [];
    },
    inputs: {
      'Flag in': {
        type: '*',  // Assuming a generic type since it's not specified
        displayName: 'Flag in'
      }
    },
    outputs: {
      'Value out': {
        type: '*',  // Assuming a generic type since it's not specified
        displayName: 'Value out'
      },
      'Digital out': {
        type: '*',  // Assuming a generic type since it's not specified
        displayName: 'Digital out'
      }
    },
    settings: {
      'Name': {
        type: 'string',
        displayName: 'Name',
        default: 'Flag'
      },
      'Notes': {
        type: {
          name: 'string',
          multiline: true
        },
        displayName: 'Notes'
      }
    }
  };

  module.exports = {
    node: DeviceNode
  };