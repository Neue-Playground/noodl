import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { PropertyPanelSelectInput } from './PropertyPanelSelectInput';

export default {
  title: 'Property Panel/Select',
  component: PropertyPanelSelectInput,
  argTypes: {}
} as ComponentMeta<typeof PropertyPanelSelectInput>;

const Template: ComponentStory<typeof PropertyPanelSelectInput> = (args) => (
  <div style={{ width: 280 }}>
    <PropertyPanelSelectInput {...args} />
  </div>
);

export const Common = Template.bind({});
Common.args = {
  value: 'disabled',
  properties: {
    options: [
      { label: 'Disabled', value: 'disabled' },
      { label: 'GPT-4o', value: 'gpt-4o' }
    ]
  }
};

export const hasSmallText = Template.bind({});
hasSmallText.args = {
  value: 'disabled',
  properties: {
    options: [
      { label: 'Disabled', value: 'disabled' },
      { label: 'GPT-4o', value: 'gpt-4o' }
    ]
  },
  hasSmallText: true
};
