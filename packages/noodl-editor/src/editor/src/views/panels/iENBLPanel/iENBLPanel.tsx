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
import { TextInput } from '@noodl-core-ui/components/inputs/TextInput';
import { TextArea } from '@noodl-core-ui/components/inputs/TextArea';
import { Text } from '@noodl-core-ui/components/typography/Text';

export function iENBLPanel() {
  const environment = useActiveEnvironment(ProjectModel.instance);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [devices, setDevices] = useState([]);

  const [jsonData, setJsonData] = useState({});
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // const [port, setPort] = useState(null);
  // const [writer, setWriter] = useState(null);
  // const [reader, setReader] = useState(null);
  const [serial, setSerial] = useState({port: null, writer: null, reader: null});
  const [log, setLog] = useState([]);

  useEffect(() => {
    NeueService.instance.load().then((result) => {
      fetchDevices();
    });
  }, [setLoading]);
  useEffect(() => {
    // setupStream().then(readStream)
    console.log("Serial has changed", serial)
    setupStream()
  }, [serial]);
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

  async function setupStream() {
    console.log(serial)
    let p = serial.port
    let r = serial.reader
    let w = serial.writer
    if (p == null && "serial" in navigator || p.readable == null || p.writable == null) {
      // @ts-ignore
      p = await navigator.serial.requestPort()

      try {
        await p.open({baudRate: 115200, bufferSize: 255});
      }
      catch (error) {
        console.log("Error opening port: ", error)
      }
      w = p.writable.getWriter()
      // r = p.readable.getReader()
      console.log("Setting writer", {p, r, w})
      setSerial({port: p, reader: r, writer: w})
    } else {
      if (r == null) {
        // r = p.readable.getReader()
        // setSerial({port: p, reader: r, writer: w})
      }
      if (w == null) {
        w = p.writable.getWriter()
        setSerial({port: p, reader: r, writer: w})
      }
    }
    // console.log("reading", await r.read())
    // console.log("reading")
    // const {value, done} = await r.read()
    // console.log("Read value: ", value)
    // const temp = [...log, Array.from(value)]
    // console.log(log)
    // setLog(temp)
    // document.dispatchEvent(new CustomEvent('log', {detail: Array.from(value)}))
    // if (!done) {
    // }
  }

  async function resetStream() {
    const p = serial.port
    const r = serial.reader
    const w = serial.writer
    console.log("Resetting stream...")
    if (p != null && "serial" in navigator) {
      try {
        if (r != null) {
          await r.releaseLock()
        }
      } catch (error) {
        console.log("Error releasing reader lock: ", error)
      }
      try {
        if (w != null) {
          await w.releaseLock()
        }
      } catch (error) {
        console.log("Error releasing writer lock: ", error)
      }

      console.log("Closing port...")
      await p.close()
      serial.port = null
      serial.writer = null
      console.log(p)
      setSerial({port: null, reader: null, writer: null})
    }
  }

  async function readStream() {
    console.log("Read stream...", serial.reader)
    if (serial.reader != null) {
      try {
        const {value, done} = await serial.reader.read()
        console.log("Read value: ", value)
        const temp = [...log, Array.from(value)]
        console.log(temp)
        setLog(temp)
        if (!done) {
          readStream()
        }
      } catch (error) {
        console.log("Error reading stream: ", error)
        setSerial({...serial, reader: null})
      }
    }
  }
  async function readStreamer(reader, message = [], log = []) {
    // console.log("Read stream...", serial.reader)
    return
    if (reader != null) {
      try {
        const {value, done} = await reader.read()
        if (value == undefined) {
          console.log("Undefined values in read stream", value, done)
          readStreamer(reader, [], log)
          return
        }
        let values = value
        console.log("Read value: ", values)
        if (message.length < 4) {
          message = [...message, ...Array.from(values)]
          console.log("Message1: ", message)
          readStreamer(reader, message, log)
          return
        } else {
          if (message[0] == 0xAA && message[1] == 0xBB) {
            const length = message[3]
            if (message.length < length + 4) {
              message = [...message, ...Array.from(values)]
              console.log("Message2: ", message)
              readStreamer(reader, message, log)
              return
            } else if (message.length > length + 4) {
              message = message.slice(0, length + 4)
              values = values.slice(length + 4)
            }
          }
        }
        console.log("Complete message: ", message)
        log = [...log, message]
        console.log(log)
        setLog(log)
        if (!done) {
          readStreamer(reader,Array.from(value), log)
        }
      } catch (error) {
        console.log("Error reading stream: ", error)
        setupStream()
        // setSerial({...serial, reader: null})
      }
    }
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
      // await resetStream()
      // setupStream()
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
          <Box hasXSpacing hasYSpacing>
            <VStack>
              <Text>{`USB Device: ${serial.port != null && serial.reader != null && serial.writer != null ? "Connected" : "Disconnected"}`}</Text>
            </VStack>
            <VStack>
              <TextArea label="USB Debug" value={log.reduce((accumulator, currentValue) => {return accumulator += "\n" + currentValue}, "")} isDisabled={true}/>
            </VStack>
          </Box>
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
      <NeueExportModal readStreamer={readStreamer} log={log} setLog={setLog} setSerial={setSerial} port={serial.port} writer={serial.writer} reader={serial.reader} onClose={handleCloseModal} isVisible={isExportModalOpen} jsonData={jsonData} devices={devices} firmware={ProjectModel.instance.firmware} />

    </BasePanel>

  );
}
