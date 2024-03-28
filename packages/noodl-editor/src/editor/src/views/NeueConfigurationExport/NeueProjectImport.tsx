import React, { useEffect, useState } from 'react';
import { filesystem } from '@noodl/platform';

import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { importProjectFromZip } from '@noodl-utils/exporter/exportProjectToZip';
import { LocalProjectsModel, ProjectItem } from '@noodl-utils/LocalProjectsModel';

import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog';
import { ProjectCard } from '../NodePicker/components/ProjectCard';
import css from '../NodePicker/tabs/ImportFromProject/ImportFromProject.module.scss';
import { EventDispatcher } from '../../../../shared/utils/EventDispatcher';

type ModalProps = {
    isVisible: boolean;
    onClose: () => void;
};

async function onPickFolderClicked(id) {
    filesystem
        .openDialog({
            allowCreateDirectory: true
        })
        .then(async (direntry) => {
            importProjectFromZip(direntry, id).then(async (projectName) => {
                await LocalProjectsModel.instance.openProjectFromFolder(`${direntry}/${projectName}`).then(() => {
                    EventDispatcher.instance.notifyListeners('import-neue-cloud-close')
                })
            });
        });
}

export default function NeueProjectImportModal(props: ModalProps) {
    const [projects, setProjects] = useState<Array<ProjectItem>>([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isSubscribed = true;

        if (props.isVisible) {
            setError(null);
        }
        const fetchData = async () => {
            const data = await NeueService.instance.listProjects();
            setProjects(data);
        };
        fetchData()
            .catch((err) => setError(err));
        return () => {
            isSubscribed = false;
        };
    }, [props.isVisible]);

    return (
        <BaseDialog isVisible={props.isVisible} onClose={props.onClose} isLockingScroll>
            <div style={{ width: 900 }}>
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
                    {Boolean(projects.length) && (
                        <ul className={css['Grid']}>
                            {projects.map((project) => {
                                return (
                                    <li key={project.id} className={css['GridItem']}>
                                        <ProjectCard project={project} isNeue={true} handleNeueImport={onPickFolderClicked} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {projects.length < 1 && (
                        <div
                            className="spinner page-spinner"
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <div className="bounce1"></div>
                            <div className="bounce2"></div>
                            <div className="bounce3"></div>
                        </div>
                    )}

                    {error && <div style={{ color: 'red' }}>{error}</div>}
                </div>
            </div>
        </BaseDialog>
    );
}
