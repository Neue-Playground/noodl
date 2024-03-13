import { Icon, IconName } from '@noodl-core-ui/components/common/Icon'
import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton'
import { Select } from '@noodl-core-ui/components/inputs/Select'
import { TextInput, TextInputVariant } from '@noodl-core-ui/components/inputs/TextInput'
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog'
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
    const [selectedConfiguration, setSetSelectedConfiguration] = useState(props.jsonData);
    const [selectedDevice, setSetSelectedDevice] = useState(null);
    const [error, setError] = useState(null);
    const [configName, setConfigName] = useState('')
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
                    {props.jsonData.flowId !== '' ? <>
                        <Title size={TitleSize.Large} variant={TitleVariant.Highlighted}>
                            Save new flow version?
                        </Title>
                        <PrimaryButton hasTopSpacing label="Save" onClick={async () => {
                            NeueService.instance.updateFlow(props.jsonData.flowId, props.jsonData).then((res) => setfirst(JSON.stringify(res)))
                            //setfirst(selectedDevice)
                            //await filesystem.writeJson(__dirname + 'exportConfiguration.json', { selectedDevice, selectedConfiguration: props.jsonData });
                            //props.onClose()
                        }} />
                    </> : <>
                        <TextInput
                            slotBeforeInput={<Icon icon={IconName.CloudUpload} variant={TextType.Shy} />}
                            value={configName}
                            onChange={(e) => setConfigName(e.currentTarget.value)}
                            variant={TextInputVariant.InModal}
                        />
                        <PrimaryButton hasTopSpacing label="Add new Configuration" onClick={async () => {
                            NeueService.instance.saveFlow({ name: configName, ...props.jsonData, }).then(data => { setfirst(JSON.stringify(data)); props.onClose() }).catch(e => setfirst(JSON.stringify({ error: e })))
                            //await filesystem.writeJson(__dirname + 'exportConfiguration.json', { selectedDevice, selectedConfiguration: props.jsonData });
                            //props.onClose()
                        }} />
                    </>}



                    {error && <div style={{ color: 'red' }}>{error}</div>}


                    {first}
                </div>
            </div>

        </BaseDialog>
    )
}
