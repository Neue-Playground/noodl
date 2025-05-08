const UsbDefinition = {
  name: 'USB Device',
  docs: 'https://docs.noodl.net/nodes/string-manipulation/string-format',
  category: 'String Manipulation',
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
        console.log("Start reading")
        if (!this._internal.reader) {
          this._internal.port = await navigator.serial.requestPort()
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
      // console.log("Reading... Carry over:", message)
      const {value, done} = await this._internal.reader.read()
      if (value == undefined) {
        console.log("Undefined values in read stream", value, done)
        return
      }
      message = [...message, ...Array.from(value)]
      let carryover = []
      console.log("Handling:", message)
      if (message.length < 4) {
        this.read(message)
        return
      } else if (message.length === 255) {
        this.read()
        return
      } else {
        if (message[0] == 0xAA && message[1] == 0xBB) {
          const length = message[3] + 4

          if (message.length < length) {
            // console.log("Message2: ", message)
            this.read(message)
            return
          } else if (message.length >= length) {
            // console.log("Message3.1: ", message)
            message = message.slice(0, length);
            carryover = message.slice(length);
            // console.log("Message3.2: ", message)
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
      this._internal.dones = done
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
        this.read(Array.from(carryover))
      } else {
        this.sendSignalOnOutput('serialRead')
      }
    }
  }
};

module.exports = {
  node: UsbDefinition
};
