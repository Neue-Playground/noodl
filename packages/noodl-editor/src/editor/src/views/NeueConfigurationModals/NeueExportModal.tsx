import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Select } from '@noodl-core-ui/components/inputs/Select';
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { SerialPort } from 'electron/main';
import React, { useEffect, useState } from 'react';

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
    jsonData: any,
    devices: any[],
    firmware: string,
    log: any[],
    setLog: (log: any[]) => void,
    writer: WritableStreamDefaultWriter,
    reader: ReadableStreamDefaultReader,
    port: SerialPort,
    setSerial: (serial: any) => void,
    readStreamer: (reader: any, log: any) => void
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
        console.log(props.reader, props.writer)
    }, [props]);

    async function writeCommand(group, reader) {
        new Promise((resolve) => {
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
            props.writer.write(combined).then(() => {
                setTimeout(() => {
                    console.log("message written")
                    resolve(true)
                }, 1000)
            });
        // const id = setTimeout(() => {
        //     console.log("Message response timeout")
        //     reader.cancel()
        //     writeCommand(group, writer, reader)
        // }, 5000);
        // const { done, value } = await reader.read()
        // console.log("Message response: ", value, done)
        // props.setLog([...props.log, value])
        // clearTimeout(id)
        })
    }

    return (
        <BaseDialog
            isVisible={props.isVisible}
            onClose={props.onClose}
            isLockingScroll
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

                    <PrimaryButton label="Push to device" onClick={async () => {
                        setIsLoading(true);
                        try {
                            const response = await NeueService.instance.pushFlow(selectedDevice, props.jsonData, props.firmware);
                            const commands = (await response.json()).flat()
                            console.log("commands", commands)

                            // props.reader.cancel()
                            // await props.reader.closed
                            // @ts-ignore
                            // const reader = props.port.readable.getReader()'
                            // await writeCommand(commands[0], props.reader)
                            // console.log("Message response: ", await props.reader.read())
                            // return
                            // console.log("Message response2: ", value, done)
                            if (selectedDevice === 'USB') {
                                for (const group of commands) {
                                    await writeCommand(group, props.reader)
                                }
                                // props.reader.read()
                                // @ts-ignore
                                // props.setSerial({port: props.port, reader: props.reader, writer: props.writer})
                                props.readStreamer(props.reader, [])
                            }
                        } catch (error) {
                            console.log(error)
                        } finally {
                            // props.reader.releaseLock()
                            props.writer.releaseLock()
                            // @ts-ignore
                            props.port.close()
                            setIsLoading(false);
                        }
                        // const response = await NeueService.instance.pushFlow(selectedDevice, props.jsonData, props.firmware);
                        // if (response.status === 200) {
                        //     props.onClose();
                        // } else {
                        //     const body = await response.json();
                        //     setError('Failed to push to device: ' + JSON.stringify(body));
                        // }
                        setIsLoading(false);
                    }}
                        isLoading={isLoading}
                        isDisabled={isLoading} />
                </div>
            </div>

        </BaseDialog>
    );
}
