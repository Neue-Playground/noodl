import { PrimaryButton, PrimaryButtonVariant } from '@noodl-core-ui/components/inputs/PrimaryButton'
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog'
import React, { useEffect, useState } from 'react'
import { EventDispatcher } from '../../../../shared/utils/EventDispatcher'
import { Title, TitleSize, TitleVariant } from '@noodl-core-ui/components/typography/Title'
import { importProjectFromZip, uploadProjectZipToCloud } from '@noodl-utils/exporter/cloudSyncFunctions'

type ModalProps = {
    isVisible: boolean,
    onClose: () => void,
    args: any
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
                    {props.args &&
                        <div>
                            <Title size={TitleSize.Large} variant={TitleVariant.Highlighted} hasBottomSpacing isCentered>Cloud Sync</Title>
                            <Title size={TitleSize.Medium} hasBottomSpacing >It appears that the local version of the project is not up to date. Would you like to overwrite the local version with the latest cloud version?</Title>
                        </div>

                    }

                    {error && <div style={{ color: 'red' }}>{error}</div>}


                    {props.args && props.args.action === 'open' &&
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px' }}>
                            <PrimaryButton label="Sync with cloud" hasRightSpacing onClick={async () => {
                                await importProjectFromZip(props.args.project.retainedProjectDirectory, props.args.project.id)
                                EventDispatcher.instance.notifyListeners('check-cloud-version-open-project');
                                props.onClose()
                            }} />

                            <PrimaryButton variant={PrimaryButtonVariant.Muted} label="Open local project" onClick={async () => {
                                EventDispatcher.instance.notifyListeners('check-cloud-version-open-project');
                                props.onClose();
                            }} />
                        </div>
                    }

                    {props.args && props.args.action === 'save' &&
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px' }}>
                            <PrimaryButton label="Download cloud version" hasRightSpacing onClick={async () => {
                                await importProjectFromZip(props.args.project._retainedProjectDirectory, props.args.project.id)
                                EventDispatcher.instance.notifyListeners('check-cloud-version-open-project');
                                props.onClose()
                            }} />

                            <PrimaryButton variant={PrimaryButtonVariant.Muted} label="Save this version to cloud" onClick={async () => {
                                await uploadProjectZipToCloud({
                                    coludProjectVersion: props.args.project.coludProjectVersion + 1,
                                });
                                props.onClose()
                            }} />
                        </div>
                    }
                </div>
            </div>

        </BaseDialog>
    )
}
