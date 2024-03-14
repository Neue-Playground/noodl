import { useActiveEnvironment } from '@noodl-hooks/useActiveEnvironment';
import React, { useEffect, useState } from 'react';

import { ProjectModel } from '@noodl-models/projectmodel';

import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Box } from '@noodl-core-ui/components/layout/Box';
import { Container, ContainerDirection } from '@noodl-core-ui/components/layout/Container';
import { BasePanel } from '@noodl-core-ui/components/sidebar/BasePanel';

import { ComponentsPanel } from '../componentspanel';
import { VStack } from '@noodl-core-ui/components/layout/Stack';
import { Section, SectionVariant } from '@noodl-core-ui/components/sidebar/Section';
import { Text } from '@noodl-core-ui/components/typography/Text';
import { ActivityIndicator } from '@noodl-core-ui/components/common/ActivityIndicator';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { PropertyPanelTextInput } from '@noodl-core-ui/components/property-panel/PropertyPanelTextInput';
import { PropertyPanelRow } from '@noodl-core-ui/components/property-panel/PropertyPanelInput';
import { PropertyPanelPasswordInput } from '@noodl-core-ui/components/property-panel/PropertyPanelPasswordInput';
import { Label } from '@noodl-core-ui/components/typography/Label';
import NeueDeployModal from '../../NeueConfigurationModals/NeueDeployModal';
import NeueImportModal from '../../NeueConfigurationModals/NeueImportModal';
import NeueSaveModal from '../../NeueConfigurationModals/NeueSaveModal';
import { getJsonConfiguration, loadJsonConfiguration } from '@noodl-utils/NeueExportImportFunctions';

export function iENBLPanel() {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [devices, setDevices] = useState([]);

  const [jsonData, setJsonData] = useState({});
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [flowId, setFlowId] = useState(localStorage.getItem('flowId'))

  useEffect(() => {
    NeueService.instance.load().then((result) => {
      setSignedIn(result);
      if (result) {
        fetchDevices();
      } else {
        setLoading(false);
      }
    });
  }, [setSignedIn, setLoading]);

  const componentPanelOptions = {
    showSheetList: false,
    lockCurrentSheetName: '__neue__',
    componentTitle: 'Neue components'
  };

  function loginClick() {
    setLoading(true);
    NeueService.instance.login(email, password).then(() => {
      setSignedIn(true);
      setLoading(false);
      fetchDevices();
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
    setDevices([]);
  }

  function fetchDevices() {
    setLoading(true);
    NeueService.instance.fetchDevices().then((response) => {
      setDevices(response);
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      setLoading(false);
    });
  }

  function handleCloseDeployModal() {
    setJsonData([]);
    setIsDeployModalOpen(false)
  }

  function handleCloseSaveModal() {
    setJsonData([]);
    setIsSaveModalOpen(false)
  }

  function handleCloseImportModal() {
    setIsImportModalOpen(false)
  }

  function pushConfigurationToDevice() {
    getJsonConfiguration(flowId, setJsonData)
    setIsDeployModalOpen(true)
  }

  function saveConfigurationToCloud() {
    getJsonConfiguration(flowId, setJsonData)
    setIsSaveModalOpen(true)
  }
  function importConfigurationFromCloud() {
    setIsImportModalOpen(true)
  }

  return (
    <BasePanel title="Neue Playground" isFill>
      {!signedIn ? (
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
      ) : (
        <Container direction={ContainerDirection.Vertical} isFill>
          <Box hasXSpacing hasYSpacing>
            <VStack>
              <PrimaryButton hasBottomSpacing label="Push Flow to Device" onClick={pushConfigurationToDevice} />
            </VStack>
            <VStack>
              <PrimaryButton hasBottomSpacing label="Save Configuration" onClick={saveConfigurationToCloud} />
            </VStack>
            <VStack>
              <PrimaryButton label="Import Configuration" onClick={importConfigurationFromCloud} />
            </VStack>
          </Box>
          <Section
            title="Available Devices"
            variant={SectionVariant.Panel}

          >
            {devices.length ? (
              <VStack>
                {devices.map((environment, i) => (
                  <Text style={{ margin: '10px 0px 15px 50px' }} key={i}>{environment}</Text>

                  // <CloudServiceCardItem
                  //   key={environment.id}
                  //   environment={environment}
                  //   deleteEnvironment={deleteEnvironment}
                  // />
                ))}
              </VStack>
            ) : error ? (
              <Box hasXSpacing hasYSpacing>
                <VStack>
                  <Text hasBottomSpacing>Failed to load cloud services</Text>
                  <PrimaryButton label="Try again." />
                </VStack>
              </Box>
            ) : loading ? (
              <Container hasLeftSpacing hasTopSpacing>
                <ActivityIndicator />
              </Container>
            ) : (
              <Container hasLeftSpacing hasTopSpacing>
                <Text>Empty</Text>
              </Container>
            )}
          </Section>
          <div style={{ flex: '1', overflow: 'hidden' }}>
            <ComponentsPanel options={componentPanelOptions} />
          </div>
          <Box hasXSpacing hasYSpacing>
            <VStack>
              <PrimaryButton label="Logout" onClick={logoutClick} />
            </VStack>
          </Box>
        </Container>
      )}

      <NeueDeployModal onClose={handleCloseDeployModal} isVisible={isDeployModalOpen} jsonData={jsonData} devices={devices} />
      <NeueImportModal onClose={handleCloseImportModal} isVisible={isImportModalOpen} jsonData={jsonData} setFlowId={setFlowId} />
      <NeueSaveModal onClose={handleCloseSaveModal} isVisible={isSaveModalOpen} jsonData={jsonData} flowId={localStorage.getItem('flowId')} />
    </BasePanel>

  );
}
