import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton'
import { Select } from '@noodl-core-ui/components/inputs/Select'
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog'
import { NeueService } from '@noodl-models/NeueServices/NeueService'
import { filesystem } from '@noodl/platform'
import React, { useEffect, useState } from 'react'

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
    jsonData: any,
    devices: any[]
}

export default function NeueDeployModal(props: ModalProps) {
    const [selectedConfiguration, setSetSelectedConfiguration] = useState(props.jsonData);
    const [selectedDevice, setSetSelectedDevice] = useState(null);
    const [error, setError] = useState(null);
    const [first, setfirst] = useState('')

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
                    {Boolean(props.devices.length) && (
                        <Select
                            options={props.devices.map((device) => { return { label: device, value: device, isDisabled: false } })}
                            onChange={(value: any) => setSetSelectedDevice(value)}
                            placeholder="Select device"
                            value={selectedDevice}
                            label="Available devices"
                            hasBottomSpacing
                        />
                    )}

                    {error && <div style={{ color: 'red' }}>{error}</div>}

                    <PrimaryButton label="Push to device" onClick={async () => {
                        // NeueService.instance.deployFlow(selectedDevice, props.jsonData).then((res) => setfirst(JSON.stringify(res))
                        // )
                        setfirst(selectedDevice)
                        //await filesystem.writeJson(__dirname + 'exportConfiguration.json', { selectedDevice, selectedConfiguration: props.jsonData });
                        //props.onClose()
                    }} />
                    {first}
                </div>
            </div>

        </BaseDialog>
    )
}
