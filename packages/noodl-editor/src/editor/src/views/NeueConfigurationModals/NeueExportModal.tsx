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

    async function writerCommands (cmds, port, writer) {
        try {
            if (selectedDevice === 'USB') {
                const commands = cmds instanceof Response ? (await cmds.json()).flat() : cmds
                console.log("commands", commands)
                for (const group of commands) {
                    await writeCommand(group, writer)
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            if (selectedDevice === 'USB') {
                if (writer) writer.releaseLock()
                if (port) port.close()
            }
        }
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
                }, 1000)
            });
        })
    }

    async function onClick() {
        setIsLoading(true);
        let commands: Response | string[] = []
        if (props.commands.length > 0) {
            commands = props.commands
            props.setCommands([])
        } else {
            commands = await NeueService.instance.pushFlow(selectedDevice, props.jsonData, props.firmware);
        }
        if (selectedDevice !== 'USB') return
        // @ts-ignore
        const p = await navigator.serial.requestPort()

        try {
            await p.open({baudRate: 115200, bufferSize: 255});
        }
        catch (error) {
            console.log("Error opening port: ", error)
        }
        const w = p.writable.getWriter()
        // r = p.readable.getReader()
        await writerCommands(commands, p, w)
        setIsLoading(false);
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
