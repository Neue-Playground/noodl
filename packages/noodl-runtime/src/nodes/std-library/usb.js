const UsbDefinition = {
  name: 'USB Device',
  docs: 'https://docs.noodl.net/nodes/string-manipulation/string-format',
  category: 'String Manipulation',
  exportDynamicPorts: true,
  initialize() {
    this._internal.reader = undefined
    this._internal.port = undefined
    this._internal.stop = true
    this._internal.dones = false

  },
  getInspectInfo() {
    return {
      "Data": this.data,
      "Debug": "Debug info"
    };
  },
  inputs: {
    read: {
      displayName: 'Start',
      valueChangedToTrue: async function () {
        this._internal.dones = false
        this._internal.stop = false
        const selectedPort = this._internal.device
        if (!selectedPort) this.context.editorConnection.sendWarning(this.nodeScope.componentOwner.name, this.id, 'usb-device', {
            message: 'No USB device selected'
          });
        if (!this._internal.reader && selectedPort) {
          this.context.editorConnection.clearWarnings(this.nodeScope.componentOwner.name, this.id, 'usb-device');
          const info = selectedPort.split(':').map(v => parseInt(v))
          this._internal.port = await navigator.serial.requestPort({filters: [
            { usbVendorId: info[0], usbProductId: info[1] }
          ]})
          // @ts-ignore
          console.log(this._internal.port.connected)
          console.log("port.connected")
          try {
            await this._internal.port.open({baudRate: 115200})
          } catch (e) {
            console.log(e)
          }
          this._internal.reader = this._internal.port.readable.getReader()
        }
        // this.reader = port;
        // this.flagOutputDirty('reader');

        this.read()
      }
    },
    stop: {
      displayName: 'Stop',
      valueChangedToTrue: function () {
        this._internal.stop = true
        if (this._internal.reader) {
          this._internal.reader.releaseLock()
          this._internal.reader = undefined
        }
        if (this._internal.port) {
          this._internal.port.close()
          this._internal.port = undefined
        }
        console.log("Stop reading")
      }
    },
    refresh: {
      displayName: 'Refresh devices',
      type: 'button',
      set: function () {
        this._internal.debug = 'Refresh devices pressed'
        this.flagOutputDirty('debug')
      }
    }
  },
  outputs: {
    port1: {
      displayName: 'Port 1',
      type: '*',
      getter: function () {
        return this.port1;
      }
    },
    port2: {
      displayName: 'Port 2',
      type: '*',
      getter: function () {
        return this.port2;
      }
    },
    port3: {
      displayName: 'Port 3',
      type: '*',
      getter: function () {
        return this.port3;
      }
    },
    port4: {
      displayName: 'Port 4',
      type: '*',
      getter: function () {
        return this.port4;
      }
    },
    debug: {
      displayName: 'Debug',
      type: '*',
      getter: function () {
        return this._internal.debug
      }
    },
    serialRead: {
      displayName: 'Read completed',
      type: 'signal'
    },
    iterate: {
      displayName: 'Read',
      type: 'signal',
    }
  },
  methods: {
    read: async function (message = []) {
      let d = false
      let v = []
      if (message.length < 4 || message.length < message[3] + 4 ) {
        const {value, done} = await this._internal.reader.read()
        if (v === undefined) {
          console.log("Undefined values in read stream", v, d)
          return
        }
        v = value
        d = done
      }
      message = [...message, ...Array.from(v)]
      // console.log("Reading... Carry over:", message)
      let carryover = []
      console.log("Handling:", message)
      if (message.length < 4) {
        this.read(message)
        return
      } else if (message.length > 255) {
        this.read()
        return
      } else {
        if (message[0] == 0xAA && message[1] == 0xBB) {
          const length = message[3] + 4

          if (message.length < length) {
            this.read(message)
            return
          } else if (message.length >= length) {
            carryover = message.slice(length);
            message = message.slice(0, length);
          }
        } else {
          for (let i = 0; i < message.length; i++) {
            if (message[i] == 0xAA && message[i + 1] == 0xBB) {
              message = message.slice(i);
              this.read(message)
              return
            }
          }
          this.read()
          return
        }
      }
      this._internal.dones = d
      // console.log("Message:", message.map((v) => v.toString(16).padStart(2, '0')).join(' '))
      const type = message[2] >> 4
      this.data = message.slice(9);
      switch (type) {
        case 0:
          this.port1 = this.data
          this.flagOutputDirty('port1')
          break;
        case 1:
          this.port2 = this.data
          this.flagOutputDirty('port2')
          break;
        case 2:
          this.port3 = this.data
          this.flagOutputDirty('port3')
          break;
        case 3:
          this.port4 = this.data
          this.flagOutputDirty('port4')
          break;
        default:
          console.log("Unknown type:", type)
      }
      // this.flagOutputDirty('data')
      this.sendSignalOnOutput('iterate')
      console.log(type)
      if (!this._internal.done && !this._internal.stop) {
        console.log("Carryover:", carryover)
        this.read(carryover)
      } else {
        this.sendSignalOnOutput('serialRead')
      }
    },
    registerInputIfNeeded: function (name) {
      if (this.hasInput(name)) {
        return;
      }

      if (name === 'device') {
        this.registerInput(name, {
          set: this.setDevice.bind(this)
        });
      }
    },
    setDevice : function (value) {
      this._internal.device = value
    }
  }
};

module.exports = {
  node: UsbDefinition,
  setup: function (context, graphModel) {
    if (!context.editorConnection) {
      return;
    }

    function _managePortsForNode(node) {
      async function updatePorts() {
        const serialPorts = await navigator.serial.getPorts()
        const infos = serialPorts.map(port => port.getInfo()).filter(info => info.usbVendorId && info.usbProductId)
        // this._internal.ports = serialPorts
        let ports = []
        if (infos.length === 0) {
          ports = [{
            displayName: 'Selected Device',
            name: 'device',
            type: {
              name: "enum",
              enums: [
                {
                  label: `No Device Available`,
                  value: null
                }
              ],
              allowEditOnly: true
            },
            plug: 'input'
          }]
        } else {
          ports = [{
            displayName: 'Selected Device',
            name: 'device',
            type: {
              name: "enum",
              enums: infos.map((info, index) => {
                return {
                  label: `Device ${index + 1} - USB Vendor ID: ${info.usbVendorId || 'N/A'}, Product ID: ${info.usbProductId || 'N/A'}`,
                  value: `${info.usbVendorId}:${info.usbProductId}`
                };
              }),
              allowEditOnly: true
            },
            // default: `${infos[0].usbVendorId}:${infos[0].usbProductId}`,
            plug: 'input'
          }]
        }
        context.editorConnection.sendDynamicPorts(node.id, ports);
      }
      updatePorts();
      node.on('parameterUpdated', function (event) {
        updatePorts();
      });
    }

    graphModel.on('editorImportComplete', () => {
      graphModel.on('nodeAdded.USB Device', function (node) {
        _managePortsForNode(node);
      });
      for (const node of graphModel.getNodesWithType('USB Device')) {
        _managePortsForNode(node);
      }
    });
  }
}
