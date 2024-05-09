'use strict';

const DeviceNode = {
  initialize: function () {
    this._internal.inputs = [];
  },
  methods:{
    setResponseParameter:function(name,value) {
      this._internal.responseParameters[name] = value
    },
    registerInputIfNeeded: function(name) {
      if(this.hasInput(name)) {
          return;
      }

      if(name.startsWith('pm-')) this.registerInput(name, {
          set: this.setResponseParameter.bind(this, name.substring('pm-'.length))
      })
    },
  }
};

module.exports = {
  node: DeviceNode,
  setup: function (context, graphModel) {
    if (!context.editorConnection || !context.editorConnection.isRunningLocally()) {
      return;
    }

    function _managePortsForNode(node) {
      function _updatePorts() {
        var ports = []

        // Add params outputs
        if(node.parameters.status === 'success' || node.parameters.status === undefined) {
          var params = node.parameters.params;
          if (params !== undefined) {
            params = params.split(',');
            for (var i in params) {
              var p = params[i];

              ports.push({
                type: '*',
                plug: 'input',
                group: 'Parameters',
                name: 'pm-' + p,
                displayName: p
              })
            }
          }
        }

        context.editorConnection.sendDynamicPorts(node.id, ports);
      }

      _updatePorts();
      node.on("parameterUpdated", function (event) {
        if (event.name === 'params') {
          _updatePorts();
        }
      });
    }

    graphModel.on("editorImportComplete", () => {
      graphModel.on("nodeAdded.acc", function (node) {
        _managePortsForNode(node)
      })

      for (const node of graphModel.getNodesWithType('noodl.acc')) {
        _managePortsForNode(node)
      }
    })
  }
};
