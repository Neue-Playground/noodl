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
import { isComponentModel_NeueRuntime } from '@noodl-utils/NodeGraph';
import { exportComponent, exportComponentsToJSON } from '@noodl-utils/exporter';
import NeueExportModal from '../../NeueConfigurationModals/NeueExportModal';
import { App } from '@noodl-models/app';
import { filesystem } from '@noodl/platform';

export function iENBLPanel() {
  const environment = useActiveEnvironment(ProjectModel.instance);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [devices, setDevices] = useState([]);

  const [jsonData, setJsonData] = useState({});
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    NeueService.instance.load().then((result) => {
      fetchDevices();
    });
  }, [setLoading]);

  const componentPanelOptions = {
    showSheetList: false,
    lockCurrentSheetName: '__neue__',
    componentTitle: 'Neue components'
  };

  async function logoutClick() {
    await NeueService.instance.logout();
    setLoading(false);
    setDevices([]);
    App.instance.logout();
  }

  function fetchDevices() {
    setLoading(true);
    NeueService.instance.fetchDevices().then((response) => {
      setDevices(response);
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setLoading(false);
    });
  }

  function handleCloseModal() {
    setJsonData([]);
    setIsExportModalOpen(false);
  }

  const findAndExpandNodes = (nodes, allComponents) => {
    const stack = [...nodes];
    const expandedNodes = [];
    const visitedNodes = new Set();

    while (stack.length > 0) {
      const node = stack.pop();

      if (visitedNodes.has(node)) {
        continue;
      }

      visitedNodes.add(node);

      let expandedNode = { ...node.toJSON() };

      if (node.typename.includes('/#__neue__/')) {
        const matchingComponent = allComponents.find(comp => comp.fullName === node.typename);

        if (matchingComponent) {
          const componentNodes = matchingComponent.graph?.getNodeSetWithNodes(matchingComponent.getNodes()).nodes;

          if (componentNodes) {
            const shouldRecurse = componentNodes.some(childNode => childNode.typename.includes('/#__neue__/'));

            let expandedChildren = [];

            if (shouldRecurse) {
              stack.push(...componentNodes);
            }

            expandedChildren = componentNodes.map(childNode => childNode.toJSON());

            expandedNode = {
              ...node.toJSON(),
              nodes: expandedChildren
            };
          }
        }
      }

      expandedNodes.push(expandedNode);
    }

    return expandedNodes;
  };

  async function getJsonConfiguration() {
    const neueRoot = ProjectModel.instance.getNeueRootComponent();
    const allComponents = ProjectModel.instance.components.filter(comp => isComponentModel_NeueRuntime(comp));

    if (neueRoot) {
      setLoading(true);
      const rootNodes = neueRoot?.graph?.getNodeSetWithNodes(neueRoot.getNodes());
      const expandedNodes = findAndExpandNodes(rootNodes.nodes, allComponents);

      const root = {
        ...neueRoot.toJSON(),
        nodes: expandedNodes
      };
      setJsonData(root);
    }
    setLoading(false);

    setIsExportModalOpen(!isExportModalOpen);
  }


  return (
    <BasePanel title="Neue Playground" isFill>
      <Container direction={ContainerDirection.Vertical} isFill>
        <Box hasXSpacing hasYSpacing>
          <VStack>
            <PrimaryButton label="Push Flow to Device" onClick={getJsonConfiguration} isDisabled={loading} />
          </VStack>
        </Box>
        <div style={{ flex: '1', overflow: 'hidden' }}>
          <ComponentsPanel options={componentPanelOptions} />
        </div>
        <Box hasXSpacing hasYSpacing>
          <VStack>
            <PrimaryButton label="Logout" onClick={logoutClick} />
          </VStack>
        </Box>
      </Container>
      <NeueExportModal onClose={handleCloseModal} isVisible={isExportModalOpen} jsonData={jsonData} devices={devices} firmware={ProjectModel.instance.firmware} />

    </BasePanel>

  );
}
