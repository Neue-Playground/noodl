import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton'
import { Select } from '@noodl-core-ui/components/inputs/Select'
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog'
import { NeueService } from '@noodl-models/NeueServices/NeueService'
import { filesystem } from '@noodl/platform'
import React, { useEffect, useState } from 'react'

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
    jsonData: any[],
    devices: any[]
}

export default function NeueExportModal(props: ModalProps) {
    const [selectedConfiguration, setSetSelectedConfiguration] = useState(null);
    const [selectedDevice, setSetSelectedDevice] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (props.isVisible) {
            setSetSelectedConfiguration(null)
            setSetSelectedDevice(null)
            setError(null)
        }
    }, [props.isVisible])

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
                    {Boolean(props.jsonData.length) && (
                        <Select
                            options={props.jsonData.map((comp) => { return { label: comp.name.split("/#__neue__/").pop(), value: comp, isDisabled: false } })}
                            onChange={(value: string) => setSetSelectedConfiguration(value)}
                            placeholder="Select device configuration"
                            value={selectedConfiguration}
                            label="Device flow"
                            hasBottomSpacing
                        />
                    )}
                    {Boolean(props.devices.length) && (
                        <Select
                            options={props.devices.map((device) => { return { label: device, value: device, isDisabled: false } })}
                            onChange={(value: string) => setSetSelectedDevice(value)}
                            placeholder="Select device"
                            value={selectedDevice}
                            label="Available devices"
                            hasBottomSpacing
                        />
                    )}

                    {error && <div style={{ color: 'red' }}>{error}</div>}

                    <PrimaryButton label="Push to device" onClick={async () => {
                        const response = await NeueService.instance.deployFlow(selectedDevice, selectedConfiguration)
                        if (response.status === 200) {
                            props.onClose()
                        } else {
                            const body = await response.json()
                            setError('Failed to push to device: ' + body)
                        }
                    }} />
                </div>
            </div>

        </BaseDialog>
    )
}