import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Select } from '@noodl-core-ui/components/inputs/Select';
import { TextArea } from '@noodl-core-ui/components/inputs/TextArea';
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
    const [serialDevices, setSetSerialDevices] = useState(null);
    const [deviceItems, setSetDeviceItems] = useState(props.devices);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [debuggers, setDebugger] = useState("");

    useEffect(() => {
        if (props.isVisible) {
            setSetSelectedConfiguration(null);
            setSetSelectedDevice(null);
            setError(null);
        }
        // @ts-ignore
        navigator.serial.getPorts().then((ports) => {
            console.log("Serial ports: ", ports)
            setSetSerialDevices(ports);
            const usbDevices = ports.filter((port) => port.getInfo().usbVendorId !== undefined);
            setSetDeviceItems(props.devices.concat(usbDevices.map((port) => { return { id: `USB: pid=${port.getInfo().usbProductId} vid=${port.getInfo().usbVendorId}`, port }; })));
        }).catch((err) => {
            console.log("Error getting serial ports: ", err)
        });
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
                    {Boolean(deviceItems.length) && (
                        <Select
                            options={deviceItems.map((device) => { return { label: device.id, value: device.id, isDisabled: false }; })}
                            onChange={(value: string) => setSetSelectedDevice(value)}
                            placeholder="Select device"
                            value={selectedDevice}
                            label="Available devices"
                            hasBottomSpacing
                        />
                    )}

                    {error && <div style={{ color: 'red' }}>{error}</div>}

                    <PrimaryButton label="Push to device"
                        isLoading={isLoading}
                        isDisabled={isLoading} />
                    <TextArea label="USB Debugger" value={debuggers} isDisabled={true} />
                </div>
            </div>

        </BaseDialog>
    );
}
