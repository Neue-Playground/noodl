import React, { useEffect, useState } from 'react';
import { platform } from '@noodl/platform';

import getDocsEndpoint from '@noodl-utils/getDocsEndpoint';

import { Logo, LogoSize } from '@noodl-core-ui/components/common/Logo';
import { TextButton } from '@noodl-core-ui/components/inputs/TextButton';
import { HStack } from '@noodl-core-ui/components/layout/Stack';

import { IRouteProps } from '../AppRoute';
import { ProjectsView } from '../../views/projectsview';
import { BaseWindow } from '../../views/windows/BaseWindow';

export interface ProjectsPageProps extends IRouteProps {
  from: TSFixme;
}

export function LoginPage({ route, from }: ProjectsPageProps) {
  const [view, setView] = useState<ProjectsView>(null);
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <BaseWindow title="">
      <TopBar showSpinner={showSpinner} setShowSpinner={setShowSpinner} />
      <div style={{ position: 'relative', flex: 1 }} onClick={() => route.router.route({ to: 'projects', from: 'login' })}>
        test
      </div>
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
        <TextButton label="Docs" onClick={() => platform.openExternal(getDocsEndpoint())} />
        <TextButton label="Community" onClick={() => platform.openExternal('https://www.noodl.net/community')} />
      </HStack>
    </div>
  );
}
