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
  const [showSpinner, setShowSpinner] = useState(false);

  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    NeueService.instance.load().then((result) => {
      setSignedIn(result);
      setLoading(false);
      if (result) {
        route.router.route({ to: 'projects', from: 'login' })
      }
    }).catch((err) => {
      setLoading(false)
      setError(err);
      });
  }, [setSignedIn, setLoading, setError]);

  function loginClick() {
    setChecking(true);
    NeueService.instance.login(email, password).then(() => {
      setSignedIn(true);
      setChecking(false);
      route.router.route({ to: 'projects', from: 'login' })
    }).catch((err) => {
      setSignedIn(false);
      setChecking(false);
      setError(err);
    });
  }

  function logoutClick() {
    NeueService.instance.logout();
    setSignedIn(false);
    setChecking(false);
  }

  return (
    <BaseWindow title="">
      <div style={{paddingLeft: "30%", paddingRight: "30%", paddingTop: "10%"}}>
      {!loading ?
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
              {checking ? (
                <Container hasLeftSpacing hasTopSpacing>
                  <ActivityIndicator />
                </Container>
              ) : null}
            </VStack>
          </Container>
        </BasePanel>
        : null}
      </div>
    </BaseWindow>
  );
}
//onClick={() => route.router.route({ to: 'projects', from: 'login' })

