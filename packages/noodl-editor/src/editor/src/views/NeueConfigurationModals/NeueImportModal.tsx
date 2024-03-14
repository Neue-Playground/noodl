import { ActivityIndicator } from '@noodl-core-ui/components/common/ActivityIndicator'
import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton'
import { Select } from '@noodl-core-ui/components/inputs/Select'
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog'
import { Container } from '@noodl-core-ui/components/layout/Container'
import { NeueService } from '@noodl-models/NeueServices/NeueService'
import { loadJsonConfiguration } from '@noodl-utils/NeueExportImportFunctions'
import { filesystem } from '@noodl/platform'
import React, { useEffect, useState } from 'react'

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
    jsonData: any,
    setFlowId: (x: string) => any
}

export default function NeueImportModal(props: ModalProps) {
    const [selectedFlow, setSetSelectedFlow] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [flows, setFlows] = useState([])

    useEffect(() => {
        if (props.isVisible) {
            setLoading(true)
            setSetSelectedFlow(null);
            setError(null);
            NeueService.instance.fetchFlows().then(async (data) => { setFlows(data); setLoading(false); }).catch(e => setError(e))
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
                    {loading ? (
                        <Container hasLeftSpacing hasTopSpacing>
                            <ActivityIndicator />
                        </Container>
                    ) : <>
                        {Boolean(flows.length) && (
                            <Select
                                options={flows.map((flow) => { return { label: JSON.parse(flow.flow).name, value: flow, isDisabled: false } })}
                                onChange={(value: any) => { props.setFlowId(value.id); setSetSelectedFlow(value) }}
                                placeholder="Select flow"
                                value={selectedFlow}
                                label="Available flows"
                                hasBottomSpacing
                            />
                        )}


                        {error && <div style={{ color: 'red' }}>{error}</div>}

                        <PrimaryButton label="Import flow" onClick={async () => {
                            localStorage.setItem('flowId', selectedFlow.id)
                            localStorage.setItem('flowName', JSON.parse(selectedFlow.flow).name)
                            loadJsonConfiguration(selectedFlow.id)
                            props.onClose()
                        }} />
                    </>}

                </div>
            </div>

        </BaseDialog>
    )
}
