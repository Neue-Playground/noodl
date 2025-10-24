import { useActiveEnvironment } from '@noodl-hooks/useActiveEnvironment';
import React, { useEffect, useReducer, useState } from 'react';

import { App } from '@noodl-models/app';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { ProjectModel } from '@noodl-models/projectmodel';
import { isComponentModel_NeueRuntime } from '@noodl-utils/NodeGraph';

import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Select, SelectColorTheme } from '@noodl-core-ui/components/inputs/Select';
import { TextArea } from '@noodl-core-ui/components/inputs/TextArea';
import { Box } from '@noodl-core-ui/components/layout/Box';
import { Container, ContainerDirection } from '@noodl-core-ui/components/layout/Container';
import { VStack } from '@noodl-core-ui/components/layout/Stack';
import { BasePanel } from '@noodl-core-ui/components/sidebar/BasePanel';
import { CollapsableSection } from '@noodl-core-ui/components/sidebar/CollapsableSection';
import { SectionVariant } from '@noodl-core-ui/components/sidebar/Section';

import { ComponentsPanel } from '../componentspanel';
import { USBHandler } from './usbHandler';
import { values } from 'underscore';
import { Label } from '@noodl-core-ui/components/typography/Label';

export function iENBLPanel() {
  const environment = useActiveEnvironment(ProjectModel.instance);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [devices, setDevices] = useState([]);
  const [mode, setMode] = useState('auto');
  const [manualCommands, setManualCommands] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const [jsonData, setJsonData] = useState({});
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [commands, setCommands] = useState([]);

  const [exportModalTitle, setExportModalTitle] = useState('');

  const [selectedConfiguration, setSetSelectedConfiguration] = useState(null);
  const [selectedDevice, setSetSelectedDevice] = useState(null);
  const [serialDevices, setSetSerialDevices] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debuggers, setDebugger] = useState('');
  const [usbHandler] = useState(new USBHandler(navigator));

  useEffect(() => {
    NeueService.instance.load().then((result) => {
      fetchDevices();
    });
    usbHandler.addEventListener('write', (data) => {
      setDebugger((prev) => prev + `\nWrote: ${data}`);
    });
    usbHandler.addEventListener('read', (data) => {
      setDebugger((prev) => prev + `\nRead: ${data}`);
    });
  }, []);
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
    console.log('Fetching devices...');
    setLoading(true);
    // @ts-ignore
    navigator.serial.getPorts().then((ports) => {
        console.log("Serial ports: ", ports)
        setSetSerialDevices(ports);
        const usbDevices = ports.filter((port) => port.getInfo().usbVendorId !== undefined);
        if (usbDevices.length === 0) {
          setError('No USB devices found. Please connect a device and try again.');
          setSetSelectedDevice(null);
        }
        setDevices(usbDevices.map((port) => { return { id: `USB: pid=${port.getInfo().usbProductId} vid=${port.getInfo().usbVendorId}`, port }; }));
    }).catch((err) => {
        console.log("Error getting serial ports: ", err)
    }).finally(() => {
        setLoading(false)
    });
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
        const matchingComponent = allComponents.find((comp) => comp.fullName === node.typename);

        if (matchingComponent) {
          const componentNodes = matchingComponent.graph?.getNodeSetWithNodes(matchingComponent.getNodes()).nodes;

          if (componentNodes) {
            const shouldRecurse = componentNodes.some((childNode) => childNode.typename.includes('/#__neue__/'));

            let expandedChildren = [];

            if (shouldRecurse) {
              stack.push(...componentNodes);
            }

            expandedChildren = componentNodes.map((childNode) => childNode.toJSON());

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
    const usbVendorId = parseInt(selectedDevice.match(/vid=(\d+)/)?.[1] || "0", 10);
    const usbProductId = parseInt(selectedDevice.match(/pid=(\d+)/)?.[1] || "0", 10);
    const usbInfo = {
      usbVendorId,
      usbProductId
    }
    await usbHandler.connectToDevice(usbInfo);
    setDebugger('Converting flow...');
    const neueRoot = ProjectModel.instance.getNeueRootComponent();
    const allComponents = ProjectModel.instance.components.filter((comp) => isComponentModel_NeueRuntime(comp));

    if (neueRoot) {
      setLoading(true);
      const rootNodes = neueRoot?.graph?.getNodeSetWithNodes(neueRoot.getNodes());
      const expandedNodes = findAndExpandNodes(rootNodes.nodes, allComponents);

      const root = {
        ...neueRoot.toJSON(),
        nodes: expandedNodes
      };
      console.log(root);
      setJsonData(root);
      deployFlow(root);
    }
  }

  async function deployFlow(flow: any) {
    setLoading(true);
    setError('');
    setDebugger('Fetching commands from server... ');
    const cmds = await NeueService.instance.pushFlow(selectedDevice, flow, ProjectModel.instance.firmware);
    if (!selectedDevice) {
      setError('No device selected. Please select a device and try again.');
      return;
    }
    if (mode === 'auto') {
      setDebugger('Sending commands automatically... ');
      await usbHandler.sendAllCommands(cmds);
      setLoading(false);
    } else {
      await usbHandler.sendCommandsManually(cmds);
    }
  }

  async function sendNextCommand() {
    if (usbHandler.commands.length === 0) {
      setDebugger((prev) => prev + `\nNo commands to send...`);
      return;
    }
    setIsWaitingForResponse(true);
    const isDone = await usbHandler.sendNextCommand();
    setIsWaitingForResponse(false);
    if (isDone) {
      setLoading(false);
    }
  }

  async function resetConnection() {
    setDebugger('');
    usbHandler.disconnect();
    setIsLoading(false);
    setIsWaitingForResponse(false);
  }

  return (
    <BasePanel title="Neue Playground" isFill>
      <Container direction={ContainerDirection.Vertical} isFill>
        <Box hasXSpacing hasYSpacing>
          <VStack>
            <Select
              options={devices.map((device) => {
                return { label: device.id, value: device.id, isDisabled: false };
              })}
              onChange={(value: string) => setSetSelectedDevice(value)}
              placeholder="Select device"
              value={selectedDevice}
              label="Selected device"
              hasBottomSpacing
              onShowOptions={fetchDevices}
              colorTheme={SelectColorTheme.DarkLighter}
            />
            <PrimaryButton label="Push Flow to Device" onClick={getJsonConfiguration} isLoading={loading} />
          </VStack>
        </Box>
        <CollapsableSection
          title="Device Communications"
          variant={SectionVariant.Panel}
          hasTopDivider
          hasBottomSpacing
          hasGutter
          isClosed={true}
        >
          <Select
            options={[
              { label: 'Auto', value: 'auto', isDisabled: false },
              { label: 'Manual', value: 'manual', isDisabled: false }
            ]}
            onChange={(value: string) => setMode(value)}
            label="Communication mode"
            value={mode}
            colorTheme={SelectColorTheme.DarkLighter}
            hasBottomSpacing
            />
          {mode === 'manual' &&
            <PrimaryButton label="Send next command" onClick={sendNextCommand} isDisabled={isWaitingForResponse} hasBottomSpacing/>
          }
          <TextArea label="USB Debugger" value={debuggers} isDisabled={true} scrollBottomOnChange={true} hasBottomSpacing/>
          <PrimaryButton label="Reset connection" onClick={resetConnection} hasBottomSpacing/>
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
      {/* <NeueExportModal
        title={exportModalTitle}
        commands={commands}
        setCommands={setCommands}
        onClose={handleCloseModal}
        isVisible={isExportModalOpen}
        jsonData={jsonData}
        devices={devices}
        firmware={ProjectModel.instance.firmware}
      /> */}
    </BasePanel>
  );
}
