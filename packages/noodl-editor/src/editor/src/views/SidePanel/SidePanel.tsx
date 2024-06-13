import { nextTick } from 'process';
import { useModernModel } from '@noodl-hooks/useModel';
import React, { useState, useEffect } from 'react';

import { App } from '@noodl-models/app';
import { SidebarItem, SidebarModel } from '@noodl-models/sidebar';
import { SidebarModelEvent } from '@noodl-models/sidebar/sidebarmodel';

import { SideNavigation, SideNavigationButton } from '@noodl-core-ui/components/app/SideNavigation';
import { ErrorBoundary } from '@noodl-core-ui/components/common/ErrorBoundary';
import { Container, ContainerDirection } from '@noodl-core-ui/components/layout/Container';

import css from './SidePanel.model.scss';
import { ProjectModel } from '@noodl-models/projectmodel';
import { useNodeGraphContext } from '@noodl-contexts/NodeGraphContext/NodeGraphContext';
import { isComponentModel_CloudRuntime } from '@noodl-utils/NodeGraph';

export function SidePanel() {
  const [group] = useState({});

  const sidebar = useModernModel(SidebarModel.instance, [SidebarModelEvent.itemsChanged]);
  const { nodeGraph } = useNodeGraphContext();

  // Get all the visible toolbar icons
  const items = sidebar.getVisibleItems();

  // All the panel data
  const [activeId, setActiveId] = useState(null);
  const [panels, setPanels] = useState<Record<string, React.ReactChild>>({});

  useEffect(() => {
    // ---
    // Add the first panel
    const currentPanelId = SidebarModel.instance.ActiveId;

    setPanels((prev) => {
      const component = SidebarModel.instance.getPanelComponent(currentPanelId);
      if (component) {
        prev[currentPanelId] = React.createElement(component);
      }
      return prev;
    });

    setActiveId(currentPanelId);

    // ---
    // Listen to when a new panel is opened, also add them if they dont exist.
    SidebarModel.instance.on(
      SidebarModelEvent.activeChanged,
      (panelId) => {
        const panel = SidebarModel.instance.getPanel(panelId);

        // if transient, then always create it again
        if (panel.transient || !panels[panelId]) {
          setPanels((prev) => {
            // TODO: Clean up this inside SidebarModel, createElement can be done here instead
            const component = SidebarModel.instance.getPanelComponent(panelId);
            if (component) {
              prev[panelId] = React.createElement(component);
            }
            return prev;
          });
        }

        setActiveId(panelId);
      },
      group
    );

    // ---
    // Support Hot reload on all panels
    SidebarModel.instance.on(SidebarModelEvent.HotReload, () => {
      nextTick(() => {
        console.log('[hot-reload] Side Panel');

        const currentPanelId = SidebarModel.instance.ActiveId;
        const component = SidebarModel.instance.getPanelComponent(currentPanelId);

        setPanels({
          [currentPanelId]: React.createElement(component)
        });

        setActiveId(currentPanelId);
      });
    });

    return function () {
      SidebarModel.instance.off(group);
    };
  }, []);

  function onItemClick(item: SidebarItem) {
    sidebar.switch(item.id);
    if (item.id === 'neuePanel') {
      const component = ProjectModel.instance.getNeueRootComponent();
      nodeGraph.switchToComponent(component);
    } else if (item.id === 'cloud-functions') {
      const component = ProjectModel.instance.getComponents().filter(comp => isComponentModel_CloudRuntime(comp))[0];
      nodeGraph.switchToComponent(component);
    } else {
      const component = ProjectModel.instance.getRootComponent();
      nodeGraph.switchToComponent(component);
    }
    item.onClick && item.onClick();
  }

  return (
    <SideNavigation
      onExitClick={() => App.instance.exitProject()}
      toolbar={
        <>
          <Container direction={ContainerDirection.Vertical} UNSAFE_style={{ flex: '1' }}>
            {items
              .filter((x) => !x.placement || x.placement === 'top')
              .map((item) => (
                <SideNavigationButton
                  key={item.id}
                  isActive={item.id === activeId}
                  icon={item.icon}
                  onClick={() => onItemClick(item)}
                  label={item.name}
                  fineType={item.fineType}
                  isDisabled={item.isDisabled}
                  testId={item.id + '-panel'}
                />
              ))}
          </Container>
          <Container direction={ContainerDirection.Vertical}>
            {items
              .filter((x) => x.placement === 'bottom')
              .map((item) => (
                <SideNavigationButton
                  key={item.id}
                  isActive={item.id === activeId}
                  icon={item.icon}
                  onClick={() => onItemClick(item)}
                  label={item.name}
                  testId={item.id + '-panel'}
                />
              ))}
          </Container>
        </>
      }
      panel={
        <div style={{ height: '100%' }}>
          {Object.entries(panels).map(([id, panel]) => (
            <div
              key={id}
              data-panel-id={id}
              className={css['PanelItem']}
              style={{
                display: id === activeId ? 'block' : 'none'
              }}
            >
              <ErrorBoundary
                showTryAgain
                onTryAgain={() => {
                  // Recreate all the panels, hopefully it will work again
                  setPanels({});

                  nextTick(() => {
                    const currentPanelId = SidebarModel.instance.ActiveId;
                    const component = SidebarModel.instance.getPanelComponent(currentPanelId);

                    setPanels({
                      [currentPanelId]: React.createElement(component)
                    });

                    setActiveId(currentPanelId);
                  });
                }}
              >
                {panel}
              </ErrorBoundary>
            </div>
          ))}
        </div>
      }
    />
  );
}
