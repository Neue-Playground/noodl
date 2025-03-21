import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Select } from '@noodl-core-ui/components/inputs/Select';
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import React, { useEffect, useState } from 'react';

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
    jsonData: any,
    devices: any[],
    firmware: string;
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
    }, [props.isVisible]);

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
                        // ignore webpack error
                        // if ("serial" in navigator) {
                        //     // @ts-ignore
                        //     const ports = await navigator.serial.getPorts();
                        //     // @ts-ignore
                        //     const port = await navigator.serial.requestPort();
                        //     let writer
                        //     let reader
                        //     try {
                        //         console.log(ports)
                        //         // @ts-ignore
                        //         console.log(port)
                        //         await port.open({baudRate: 115200});
                        //         console.log("port opened")
                        //         reader = port.readable.getReader();
                        //         console.log("reader created")
                        //         writer = port.writable.getWriter();
                        //         console.log("writer created")
                        //         // Assuming `cmd` is an array of hex strings like ["0x00", "0x01", "0x02", ...] \xff\x01\x00\x00
                        //         const cmd = ["0xff", "0x01", "0x00", "0x00"];  // Example cmd array

                        //         // Step 1: Convert the cmd array to an array of integers
                        //         const command = cmd.map(hexStr => parseInt(hexStr, 16));

                        //         // Step 2: Create the transfer buffer
                        //         const transfer = new Uint8Array([0xAA, 0xBB, 0x01, 0x00]);

                        //         // Step 3: Append the command array to the transfer buffer
                        //         const combined = new Uint8Array(transfer.length + command.length);
                        //         combined.set(transfer);
                        //         combined.set(command, transfer.length);

                        //         // Step 4: Update the length at the 4th position
                        //         combined[3] = command.length;

                        //         // Step 5: Send the data via port (assuming `port` is defined and open)
                        //         // port.write(combined);
                        //         console.log("writing message", combined)
                        //         await writer.write(combined);
                        //         console.log("message written")

                        //         // while (true) {
                        //         const id = setTimeout(() => {
                        //             console.log("aborting")
                        //             writer.abort()
                        //             reader.cancel()
                        //             writer.releaseLock()
                        //             reader.releaseLock()
                        //             // port.close()
                        //         }, 10000)
                        //         const { value, done } = await reader.read();
                        //         clearTimeout(id)
                        //         console.log("Response:", value, done)
                        //         if (done) {
                        //             // |reader| has been canceled.
                        //             // break;
                        //         }
                        //         // Do something with |value|…
                        //         // }
                        //     } catch (error) {
                        //         console.log(error)
                        //     } finally {
                        //         writer.releaseLock();
                        //         reader.releaseLock();
                        //         port.close()
                        //         setIsLoading(false);
                        //     }
                        // }
                        // console.log(JSON.stringify(JSON.stringify(props.jsonData)))
                        const response = await NeueService.instance.pushFlow(selectedDevice, props.jsonData, props.firmware);
                        if (response.status === 200) {
                            props.onClose();
                        } else {
                            const body = await response.json();
                            setError('Failed to push to device: ' + body);
                        }
                        setIsLoading(false);

                    }}
                        isLoading={isLoading}
                        isDisabled={isLoading} />
                </div>
            </div>

        </BaseDialog>
    );
}
