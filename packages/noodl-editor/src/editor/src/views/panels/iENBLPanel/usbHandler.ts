type USBDeviceInfo = {
  usbVendorId: number;
  usbProductId: number;
};

export class USBHandler {
  devices: USBDeviceInfo[];
  usbInfo: USBDeviceInfo;
  serialPort: any;
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  writer: WritableStreamDefaultWriter<Uint8Array> | null;
  navigator: any;
  commands: any[];
  eventListeners: { [key: string]: Array<(data: any) => void> } = {};

  constructor(navigator: any) {
    this.devices = [];
    this.usbInfo = { usbVendorId: 0, usbProductId: 0 };
    this.serialPort = null;
    this.reader = null;
    this.writer = null;
    this.navigator = navigator;
  }

  getDevices(): Promise<USBDeviceInfo[]> {
    return new Promise((resolve, reject) => {
      this.navigator.serial.getPorts().then((ports) => {
        console.log('Serial ports: ', ports);
        const usbDevices = ports.map((port) => port.getInfo()).filter((info) => info.usbVendorId !== undefined);
        resolve(
          usbDevices.map((info) => {
            return { id: `USB: pid=${info.usbProductId} vid=${info.usbVendorId}`, port: info };
          })
        );
      });
    });
  }

  async connectToDevice(usbInfo: USBDeviceInfo): Promise<void> {
    console.log('Connecting to device with info: ', usbInfo);
    this.serialPort = await this.navigator.serial.requestPort({ filters: [usbInfo] });

    await this.serialPort.open({ baudRate: 115200, bufferSize: 255 });
    this.reader = this.serialPort.readable.getReader();
    this.writer = this.serialPort.writable.getWriter();
  }

  async disconnect(): Promise<void> {
    if (this.reader) {
      await this.reader.releaseLock();
      this.reader = null;
    }
    if (this.writer) {
      await this.writer.releaseLock();
      this.writer = null;
    }
    if (this.serialPort) {
      await this.serialPort.close();
      this.serialPort = null;
    }
    this.dispatchEvent('disconnected', null);
    this.commands = [];
  }

  readData(timeout = 0): Promise<Uint8Array> {
    if (!this.reader) {
      throw new Error('Not connected to any device');
    }
    this.dispatchEvent('readStart', null);
    return new Promise((resolve, reject) => {
      let id: NodeJS.Timeout | undefined;
      if (timeout > 0) {
        id = setTimeout(() => {
          console.log('Timeout reading');
          this.dispatchEvent('timeout', null);
          reject(new Error('Timeout reading'));
        }, timeout);
      }
      this.reader.read().then(({ value, done }) => {
        if (id) clearTimeout(id);
        console.log('Done reading');
        this.dispatchEvent('read', value);
        resolve(value);
      });
    });
  }

  async sendData(data: any): Promise<void> {
    if (!this.writer) {
      throw new Error('Not connected to any device');
    }
    this.dispatchEvent('writeStart', null);
    await this.writeCommand(data);
    this.dispatchEvent('write', data.cmd);
  }

  writeCommand(group: any) {
    return new Promise((resolve) => {
      // Assuming `cmd` is an array of hex strings like ["0x00", "0x01", "0x02", ...] \xff\x01\x00\x00
      // const cmd = ["0xff", "0x01", "0x00", "0x00"];  // Example cmd array
      const cmds = group.cmd.split(' ');
      console.log('cmds', cmds);
      // Step 1: Convert the cmd array to an array of integers
      const command = cmds.map((hexStr) => parseInt(hexStr, 16));
      // Step 2: Create the transfer buffer
      const transfer = new Uint8Array([0xaa, 0xbb, 0x01, 0x00]);

      // Step 3: Append the command array to the transfer buffer
      const combined = new Uint8Array(transfer.length + command.length);
      combined.set(transfer);
      combined.set(command, transfer.length);

      // Step 4: Update the length at the 4th position
      combined[3] = command.length;

      // Step 5: Send the data via port (assuming `port` is defined and open)
      // port.write(combined);
      console.log('writing message', combined);
      this.writer.write(combined).then(() => {
        setTimeout(() => {
          console.log('message written');
          resolve(true);
        }, 100);
      });
    });
  }

  async sendAllCommands(commands: any): Promise<void> {
    try {
      if (this.writer && this.reader) {
        const cmds = commands instanceof Response ? (await commands.json()).flat() : commands;
        console.log('commands', cmds);
        for (const group of cmds) {
          await this.sendData(group);
          console.log('Sent');
          await this.readData(20000);
        }
      }
    } finally {
      this.disconnect();
    }
  }

  async sendCommandsManually(commands: any): Promise<void> {
    if (this.writer && this.reader) {
      console.log('sendCommandsManually', commands);
      const cmds = commands instanceof Response ? (await commands.json()).flat() : commands;
      this.commands = cmds;
      console.log('commands', cmds);
      const group = this.commands.shift();
      await this.sendData(group);
      console.log('Sent');
      await this.readData();
    }
  }

  async sendNextCommand(): Promise<boolean> {
    if (this.writer && this.reader) {
      if (this.commands.length === 0) {
        console.log('No commands to send');
        this.disconnect();
        return true;
      }
      const group = this.commands.shift();
      await this.sendData(group);
      await this.readData();
      if (this.commands.length === 0) {
        console.log('All commands sent');
        this.disconnect();
        return true;
      }
      return false;
    }
  }

  addEventListener(event: string, listener: (data: any) => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  removeEventListener(event: string, listener: (data: any) => void) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter((l) => l !== listener);
    }
  }

  dispatchEvent(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((listener) => listener(data));
    }
  }

  static toHexString(byteArray) {
    return Array.from(byteArray, function (byte: number) {
      return ('0' + (byte & 0xff).toString(16)).slice(-2);
    })
      .join(' ')
      .toUpperCase();
  }
}
