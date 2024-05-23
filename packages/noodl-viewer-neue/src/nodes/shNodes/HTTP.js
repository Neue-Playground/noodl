'use strict';

const DeviceNode = {
  name: 'HTTP',
  docs: 'https://docs.noodl.net/nodes/neue/mqtt',
  category: 'Neue',
  color: 'neueData',
  initialize: function () {
    this._internal.inputs = [];
  },
  inputs: {
    'URL': {
      type: 'string',
      displayName: 'URL'
    },
    'HTTP Method': {
      type: {
        name: 'enum',
        enums: [
          {
            label: 'GET',
            value: 'get'
          },
          {
            label: 'POST',
            value: 'post'
          },
          {
            label: 'PUT',
            value: 'put'
          },
          {
            label: 'DELETE',
            value: 'delete'
          }
        ]
      },
      default: 'get',
      displayName: 'HTTP Method'
    },
    'Query string': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'Query string'
    },
    'Parameters as JSON': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'Parameters as JSON'
    },
    'HTTP Headers': {
      type: {
        name: 'string',
        multiline: true
      },
      displayName: 'HTTP Headers'
    },
    'Perform request': {
      type: 'signal',
      displayName: 'Perform request'
    },
    'Basic auth id': {
      type: 'string',
      displayName: 'Basic auth id'
    },
    'Basic auth password': {
      type: 'string',
      displayName: 'Basic auth password'
    },
    'Request trigger': {
      type: 'signal',
      displayName: 'Request trigger'
    },
  },
  outputs: {
    'Error out': {
      type: 'string',
      displayName: 'Error out'
    },
    'Status out': {
      type: 'string',
      displayName: 'Status out'
    },
    'Response out': {
      type: 'string',
      displayName: 'Response out'
    }
  }
};

module.exports = {
  node: DeviceNode
};
