import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton'
import { Select } from '@noodl-core-ui/components/inputs/Select'
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog'
import { NeueService } from '@noodl-models/NeueServices/NeueService'
import { filesystem } from '@noodl/platform'
import React, { useEffect, useState } from 'react'
import { EventDispatcher } from '../../../../shared/utils/EventDispatcher'

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
}

export default function NeueCloudSyncModal(props: ModalProps) {
    const [error, setError] = useState(null);

    useEffect(() => {
        if (props.isVisible) {
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

                    {error && <div style={{ color: 'red' }}>{error}</div>}

                    <PrimaryButton label="Push to device" onClick={async () => {
                        EventDispatcher.instance.notifyListeners('check-cloud-version-close');
                    }} />
                </div>
            </div>

        </BaseDialog>
    )
}
