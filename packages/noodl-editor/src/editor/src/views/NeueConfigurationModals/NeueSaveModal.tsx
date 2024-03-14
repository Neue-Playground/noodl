import { Icon, IconName } from '@noodl-core-ui/components/common/Icon'
import { PrimaryButton, PrimaryButtonVariant } from '@noodl-core-ui/components/inputs/PrimaryButton'
import { Select } from '@noodl-core-ui/components/inputs/Select'
import { TextInput, TextInputVariant } from '@noodl-core-ui/components/inputs/TextInput'
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog'
import { HStack } from '@noodl-core-ui/components/layout/Stack'
import { Text, TextType } from '@noodl-core-ui/components/typography/Text'
import { Title, TitleSize, TitleVariant } from '@noodl-core-ui/components/typography/Title'
import { NeueService } from '@noodl-models/NeueServices/NeueService'
import { filesystem } from '@noodl/platform'
import React, { useEffect, useState } from 'react'

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
    jsonData: any,
    flowId: string
}

export default function NeueSaveModal(props: ModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const [configName, setConfigName] = useState('')

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
                    {localStorage.getItem('flowId') !== null ? <>
                        <Title size={TitleSize.Large} variant={TitleVariant.Highlighted}>
                            Save new flow version?
                        </Title>
                        {!localStorage.getItem('flowName') && <TextInput
                            slotBeforeInput={<Icon icon={IconName.CloudUpload} variant={TextType.Shy} />}
                            value={configName}
                            onChange={(e) => setConfigName(e.currentTarget.value)}
                            variant={TextInputVariant.InModal}
                        />}
                        <HStack>
                            <PrimaryButton hasTopSpacing label="Save" onClick={async () => {
                                NeueService.instance.updateFlow(props.jsonData.flowId, { name: localStorage.getItem('flowName') !== null ? localStorage.getItem('flowName') : configName, ...props.jsonData }).then((res) => { props.onClose(); localStorage.removeItem('flowName'); localStorage.removeItem('flowId') })
                            }} />
                            <PrimaryButton hasTopSpacing hasLeftSpacing label="Cancel" variant={PrimaryButtonVariant.Danger} onClick={async () => {
                                props.onClose()
                            }} />
                        </HStack>
                    </> : <>
                        <TextInput
                            slotBeforeInput={<Icon icon={IconName.CloudUpload} variant={TextType.Shy} />}
                            value={configName}
                            onChange={(e) => setConfigName(e.currentTarget.value)}
                            variant={TextInputVariant.InModal}
                        />
                        <PrimaryButton hasTopSpacing label="Add new Configuration" isDisabled={loading} onClick={async () => {
                            setLoading(true)
                            NeueService.instance.saveFlow({ name: configName, ...props.jsonData, })
                                .then(data => { setLoading(false); localStorage.setItem('flowId', data); props.onClose(); localStorage.removeItem('flowName'); localStorage.removeItem('flowId') })
                                .catch(e => setError(JSON.stringify(e)))

                        }} />
                    </>}

                    {error && <div style={{ color: 'red' }}>{error}</div>}

                </div>
            </div>

        </BaseDialog>
    )
}
