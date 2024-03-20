import React, { useEffect, useState } from 'react';
import { platform } from '@noodl/platform';

import getDocsEndpoint from '@noodl-utils/getDocsEndpoint';

import { Logo, LogoSize } from '@noodl-core-ui/components/common/Logo';
import { TextButton } from '@noodl-core-ui/components/inputs/TextButton';
import { HStack, VStack } from '@noodl-core-ui/components/layout/Stack';

import { IRouteProps } from '../AppRoute';
import { ProjectsView } from '../../views/projectsview';
import { BaseWindow } from '../../views/windows/BaseWindow';

import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { BasePanel } from '@noodl-core-ui/components/sidebar/BasePanel';
import { Container, ContainerDirection } from '@noodl-core-ui/components/layout/Container';
import { PropertyPanelRow } from '@noodl-core-ui/components/property-panel/PropertyPanelInput';
import { PropertyPanelTextInput } from '@noodl-core-ui/components/property-panel/PropertyPanelTextInput';
import { PropertyPanelPasswordInput } from '@noodl-core-ui/components/property-panel/PropertyPanelPasswordInput';
import { Label } from '@noodl-core-ui/components/typography/Label';
import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { ActivityIndicator } from '@noodl-core-ui/components/common/ActivityIndicator';

export interface ProjectsPageProps extends IRouteProps {
  from: TSFixme;
}

export function LoginPage({ route, from }: ProjectsPageProps) {
  const [view, setView] = useState<ProjectsView>(null);
  const [showSpinner, setShowSpinner] = useState(false);

  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    NeueService.instance.load().then((result) => {
      setSignedIn(result);
      if (result) {
        route.router.route({ to: 'projects', from: 'login' })
      } else {
        setLoading(false);
      }
    });
  }, [setSignedIn, setLoading]);

  function loginClick() {
    setLoading(true);
    NeueService.instance.login(email, password).then(() => {
      setSignedIn(true);
      setLoading(false);
      route.router.route({ to: 'projects', from: 'login' })
    }).catch((err) => {
      setSignedIn(false);
      setLoading(false);
      setError(err);
    });
  }

  function logoutClick() {
    NeueService.instance.logout();
    setSignedIn(false);
    setLoading(false);
  }

  return (
    <BaseWindow title="">
      <div style={{paddingLeft: "30%", paddingRight: "30%", paddingTop: "10%"}}>
        <BasePanel title="Neue Playground" isFill>
          <Container direction={ContainerDirection.Vertical} isFill>
            <VStack>
              <PropertyPanelRow label="Email" isChanged={false}>
                <PropertyPanelTextInput value={email} onChange={(value) => setEmail(value)} />
              </PropertyPanelRow>
              <PropertyPanelRow label="Password" isChanged={false}>
                <PropertyPanelPasswordInput value={password} onChange={(value) => setPassword(value)} />
              </PropertyPanelRow>
              {error !== '' ? (
                <Label>
                  Invalid email or password...
                </Label>
              ) : null}
              <PrimaryButton label="Login" onClick={loginClick} />
              {loading ? (
                <Container hasLeftSpacing hasTopSpacing>
                  <ActivityIndicator />
                </Container>
              ) : null}
            </VStack>
          </Container>
        </BasePanel>
      </div>
    </BaseWindow>
  );
}
//onClick={() => route.router.route({ to: 'projects', from: 'login' })

