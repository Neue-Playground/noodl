import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { platform } from '@noodl/platform';

import { ProjectModel } from '@noodl-models/projectmodel';
import getDocsEndpoint from '@noodl-utils/getDocsEndpoint';
import { LocalProjectsModel } from '@noodl-utils/LocalProjectsModel';

import { Logo, LogoSize } from '@noodl-core-ui/components/common/Logo';
import { TextButton } from '@noodl-core-ui/components/inputs/TextButton';
import { HStack } from '@noodl-core-ui/components/layout/Stack';

import { EventDispatcher } from '../../../../shared/utils/EventDispatcher';
import { IRouteProps } from '../../pages/AppRoute';
import { Frame } from '../../views/common/Frame';
import { ProjectsView } from '../../views/projectsview';
import { BaseWindow } from '../../views/windows/BaseWindow';
import NeueProjectImportModal from '../../views/NeueConfigurationModals/NeueProjectImport';
import NeueCloudSyncModal from '../../views/NeueConfigurationModals/NeueCloudSyncModal';

export interface ProjectsPageProps extends IRouteProps {
  from: TSFixme;
}

export function ProjectsPage({ route, from }: ProjectsPageProps) {
  const [view, setView] = useState<ProjectsView>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showCloudImport, setShowCloudImport] = useState(false)
  const [showCloudSync, setShowCloudSync] = useState(false)
  const [cloudSyncArgs, setCloudSyncArgs] = useState(undefined)

  useEffect(() => {
    const eventGroup = {};

    EventDispatcher.instance.on(
      'import-neue-cloud-open',
      () => {
        setShowCloudImport(true)
      },
      eventGroup
    );
    EventDispatcher.instance.on(
      'import-neue-cloud-close',
      () => {
        setShowCloudImport(false)
      },
      eventGroup
    );

    EventDispatcher.instance.on(
      'check-cloud-version-import-project-open',
      (args) => {
        setCloudSyncArgs(args)
        setShowCloudSync(true)
      },
      eventGroup
    );

    // Switch main window size
    ipcRenderer.send('main-window-resize', { size: 'editor', center: true });

    const instance = new ProjectsView({ from });
    instance.render();

    setView(instance);

    instance.on(
      'projectLoaded',
      (project: ProjectModel) => {
        LocalProjectsModel.instance.setCurrentGlobalGitAuth(project.id);
        route.router.route({ to: 'editor', project });
      },
      eventGroup
    );

    EventDispatcher.instance.on(
      'importFromUrl',
      (url: string) => {
        instance.importFromUrl(url);
      },
      eventGroup
    );

    return function () {
      EventDispatcher.instance.off(eventGroup);
      instance?.off(eventGroup);
      instance?.dispose();
    };
  }, []);

  function handleImportModalClose() {
    setShowCloudImport(false)
  }

  function handleCloudSyncModalClose() {
    setShowCloudSync(false)
    setCloudSyncArgs(undefined)
  }

  return (
    <BaseWindow title="">
      <TopBar showSpinner={showSpinner} setShowSpinner={setShowSpinner} />
      <div style={{ position: 'relative', flex: 1 }}>
        <Frame instance={view} isAbsolute />
        {showSpinner && (
          <div
            className="spinner page-spinner"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        )}
      </div>
      <NeueProjectImportModal isVisible={showCloudImport} onClose={handleImportModalClose}></NeueProjectImportModal>
      <NeueCloudSyncModal isVisible={showCloudSync} onClose={handleCloudSyncModalClose} args={cloudSyncArgs}></NeueCloudSyncModal>
    </BaseWindow>
  );
}

interface TopBarProps {
  showSpinner: boolean;
  setShowSpinner: (value: boolean) => void;
}

function TopBar({ showSpinner, setShowSpinner }: TopBarProps) {
  return (
    <div
      style={{
        height: '52px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'var(--theme-color-bg-2)'
      }}
    >
      <HStack
        UNSAFE_style={{
          alignItems: 'center',
          height: '100%'
        }}
        hasSpacing={6}
      >
        <Logo
          size={LogoSize.Small}
          UNSAFE_style={{
            marginLeft: '24px'
          }}
        />
        {/* <TextButton label="Docs" onClick={() => platform.openExternal(getDocsEndpoint())} /> */}
        <TextButton label="Homepage" onClick={() => platform.openExternal('https://www.neue.se')} />
        <TextButton label="Account" onClick={() => platform.openExternal('https://playground.neue.se/')} />
      </HStack>
    </div>
  );
}
