import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Select } from '@noodl-core-ui/components/inputs/Select';
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import React, { useEffect, useState } from 'react';

type ModalProps = {
    title: string,
    isVisible: boolean,
    onClose: () => void,
    jsonData: any,
    devices: any[],
    firmware: string,
    commands: any[],
    setCommands: (cmds: any[]) => void,
};

export default function NeueExportModal(props: ModalProps) {
    const [selectedConfiguration, setSetSelectedConfiguration] = useState(null);
    const [selectedDevice, setSetSelectedDevice] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (props.isVisible) {
            setSetSelectedConfiguration(null);
            setSetSelectedDevice(null);
            setError(null);
        }
    }, [props]);

    async function read (message = []) {
        console.log("Reading... Carry over:", message)
        const {value, done} = await this._internal.reader.read()
        if (value == undefined) {
            console.log("Undefined values in read stream", value, done)
            return
        }
        message = [...message, ...Array.from(value)]
        if (message.length < 4) {
            this.read(message)
            return
        } else {
            if (message[0] == 0xAA && message[1] == 0xBB) {
                const length = message[3] + 4

                if (message.length < length) {
                    console.log("Message2: ", message)
                    this.read(message)
                    return
                } else if (message.length >= length) {
                    console.log("Message3.1: ", message)
                    message = message.slice(4, length);
                    console.log("Message3.2: ", message)
                }
            }
        }
        this._internal.dones = done
        this.data = message.slice(5);
        this.flagOutputDirty('data')
        this.sendSignalOnOutput('iterate')
        console.log(done, this.data)
        if (!this._internal.done && !this._internal.stop) {
            this.read(Array.from(message))
        } else {
            this.sendSignalOnOutput('serialRead')
        }
    }

    function toHexString(byteArray) {
        return Array.from(byteArray, function(byte: number) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join(' ').toUpperCase();
    }

    async function writerCommands (cmds, port, writer, reader) {
        try {
            if (selectedDevice === 'USB') {
                const commands = cmds instanceof Response ? (await cmds.json()).flat() : cmds
                console.log("commands", commands)
                for (const group of commands) {
                    await writeCommand(group, writer)
                    const response = await reads(reader)
                    console.log("Command response:", toHexString(response))
                }
            }
        } catch (error) {
            console.log(error)
            setError("Error writing to device: " + error)
        } finally {
            if (selectedDevice === 'USB') {
                if (writer) writer.releaseLock()
                if (reader) reader.releaseLock()
                if (port) port.close()
            }
        }
    }

    function reads(reader) {
        return new Promise((resolve, reject) => {
            const id = setTimeout(() => {
                console.log("Timeout reading")
                reject(new Error("Timeout reading"))
            }, 20000);
            reader.read().then(({ value, done }) => {
                clearTimeout(id)
                console.log("Done reading")
                resolve(value)
            });
        });
    }

    function writeCommand(group, writer) {
        return new Promise((resolve) => {
            // Assuming `cmd` is an array of hex strings like ["0x00", "0x01", "0x02", ...] \xff\x01\x00\x00
            // const cmd = ["0xff", "0x01", "0x00", "0x00"];  // Example cmd array
            const cmds = group.cmd.split(" ");
            console.log("cmds", cmds)
            // Step 1: Convert the cmd array to an array of integers
            const command = cmds.map(hexStr => parseInt(hexStr, 16));
            // Step 2: Create the transfer buffer
            const transfer = new Uint8Array([0xAA, 0xBB, 0x01, 0x00]);

            // Step 3: Append the command array to the transfer buffer
            const combined = new Uint8Array(transfer.length + command.length);
            combined.set(transfer);
            combined.set(command, transfer.length);

            // Step 4: Update the length at the 4th position
            combined[3] = command.length;

            // Step 5: Send the data via port (assuming `port` is defined and open)
            // port.write(combined);
            console.log("writing message", combined)
            writer.write(combined).then(() => {
                setTimeout(() => {
                    console.log("message written")
                    resolve(true)
                }, 100)
            });
        })
    }

    async function onClick() {
        setIsLoading(true);
        setError("")
        let p: any
        if (selectedDevice === 'USB') {
            try {
                // @ts-ignore
                p = await navigator.serial.requestPort()
                await p.open({baudRate: 115200, bufferSize: 255});
            } catch (error) {
                console.log("Error opening port: ", error)
                setError("Error opening port: " + error)
                setIsLoading(false);
                return
            }
        }
        let commands: Response | string[] = []
        if (props.commands.length > 0) {
            commands = props.commands
            props.setCommands([])
        } else {
            commands = await NeueService.instance.pushFlow(selectedDevice, props.jsonData, props.firmware);
        }

        if (selectedDevice !== 'USB') return

        // @ts-ignore
        // const p = await navigator.serial.requestPort()
        // await p.open({baudRate: 115200, bufferSize: 255});
        try {
            const w = p.writable.getWriter()
            const r = p.readable.getReader()
            await writerCommands(commands, p, w, r)
        } catch (error) {
            console.log("Error opening port: ", error)
            setError("Error opening port: " + error)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <BaseDialog
            isVisible={props.isVisible}
            onClose={props.onClose}
            isLockingScroll
            title={props.title}
        >
            <div style={{ width: 400 }}>
                <div
                    style={{
                        backgroundColor: '#444444',
                        position: 'relative',
                        maxHeight: `calc(90vh - 40px)`,
                        // @ts-expect-error https://github.com/frenic/csstype/issues/62
                        overflowY: 'overlay',
                        overflowX: 'hidden',
                        padding: '32px'
                    }}
                >
                    {Boolean(props.devices.length) && (
                        <Select
                            options={props.devices.map((device) => { return { label: device.id, value: device.id, isDisabled: false }; })}
                            onChange={(value: string) => setSetSelectedDevice(value)}
                            placeholder="Select device"
                            value={selectedDevice}
                            label="Available devices"
                            hasBottomSpacing
                        />
                    )}

                    {error && <div style={{ color: 'red' }}>{error}</div>}

                    <PrimaryButton label="Push to device" onClick={onClick}
                        isLoading={isLoading}
                        isDisabled={isLoading} />
                </div>
            </div>

        </BaseDialog>
    );
}
