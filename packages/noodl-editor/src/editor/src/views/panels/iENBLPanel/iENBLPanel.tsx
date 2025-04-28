import { useActiveEnvironment } from '@noodl-hooks/useActiveEnvironment';
import React, { useEffect, useReducer, useState } from 'react';

import { ProjectModel } from '@noodl-models/projectmodel';

import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Box } from '@noodl-core-ui/components/layout/Box';
import { Container, ContainerDirection } from '@noodl-core-ui/components/layout/Container';
import { BasePanel } from '@noodl-core-ui/components/sidebar/BasePanel';

import { ComponentsPanel } from '../componentspanel';
import { VStack } from '@noodl-core-ui/components/layout/Stack';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { isComponentModel_NeueRuntime } from '@noodl-utils/NodeGraph';
import NeueExportModal from '../../NeueConfigurationModals/NeueExportModal';
import { App } from '@noodl-models/app';
import { CollapsableSection } from '@noodl-core-ui/components/sidebar/CollapsableSection';
import { SectionVariant } from '@noodl-core-ui/components/sidebar/Section';

export function iENBLPanel() {
  const environment = useActiveEnvironment(ProjectModel.instance);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [devices, setDevices] = useState([]);

  const [jsonData, setJsonData] = useState({});
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [commands, setCommands] = useState([]);

  const [exportModalTitle, setExportModalTitle] = useState("");

  useEffect(() => {
    NeueService.instance.load().then((result) => {
      fetchDevices();
    });
  }, [setLoading]);
  // useMemo(readStream, [serial])
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
      setDevices([...response, {id: 'USB'}]);
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setLoading(false);
    });
  }

  function handleCloseModal() {
    setJsonData([]);
    setIsExportModalOpen(false);
    // readStream()
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
      console.log(root)
      setJsonData(root);
    }
    setLoading(false);
    setExportModalTitle("Push Flow to Device")
    setIsExportModalOpen(!isExportModalOpen);
  }

  async function sendRestartCommand() {
    setExportModalTitle("Restart device")
    setCommands([{cmd: '07 90 00 01 00', index: 0, comment: 'Restart device'}])
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
        <CollapsableSection title="Device Commands" variant={SectionVariant.Panel} hasTopDivider hasBottomSpacing hasGutter isClosed={true}>
            <VStack>
              <PrimaryButton label="Restart" onClick={sendRestartCommand} isDisabled={loading} />
            </VStack>
        </CollapsableSection>
        <div style={{ flex: '1', overflow: 'hidden' }}>
          <ComponentsPanel options={componentPanelOptions} />
        </div>

        <Box hasXSpacing hasYSpacing>
          <VStack>
            <PrimaryButton label="Logout" onClick={logoutClick} />
          </VStack>
        </Box>
      </Container>
      <NeueExportModal title={exportModalTitle} commands={commands} setCommands={setCommands} onClose={handleCloseModal} isVisible={isExportModalOpen} jsonData={jsonData} devices={devices} firmware={ProjectModel.instance.firmware} />

    </BasePanel>

  );
}
