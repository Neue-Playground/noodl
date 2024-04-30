import classNames from 'classnames';
import React, { useState } from 'react';

import { ProjectLibraryModel } from '@noodl-models/projectlibrarymodel';
import { LocalProjectsModel, ProjectItem } from '@noodl-utils/LocalProjectsModel';
import { timeSince } from '@noodl-utils/utils';

import { ActivityIndicator } from '@noodl-core-ui/components/common/ActivityIndicator';
import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Text } from '@noodl-core-ui/components/typography/Text';
import { TextType } from '@noodl-core-ui/components/typography/Text/Text';
import { Title } from '@noodl-core-ui/components/typography/Title';
import { TitleVariant } from '@noodl-core-ui/components/typography/Title/Title';

import { useNodePickerContext } from '../../NodePicker.context';
import css from './ProjectCard.module.scss';
import { filesystem } from '@noodl/platform';
import { importProjectFromZip } from '@noodl-utils/exporter/cloudSyncFunctions';

enum CardState {
  Idle = 'is-idle',
  Downloading = 'is-downloading',
  Finished = 'is-finished',
  Cancelled = 'is-cancelled'
}
export interface ProjectCardProps {
  project: ProjectItem;
  isNeue?: boolean;
}

async function onPickFolderClicked(project, setCardState) {
  filesystem
    .openDialog({
      allowCreateDirectory: true
    })
    .then(async (direntry) => {
      setCardState(CardState.Downloading);
      await importProjectFromZip(`${direntry}/${project.name}`, project.id)
      setCardState(CardState.Finished);
    });
}

export function ProjectCard({ project, isNeue }: ProjectCardProps) {
  const context = useNodePickerContext();

  const [cardState, setCardState] = useState(CardState.Idle);
  const [cancelMessage, setCancelMessage] = useState('');

  function handleDownload() {
    setCardState(CardState.Downloading);
    ProjectLibraryModel.instance
      .importProject(project, context.doBlockPicker, context.doUnblockPicker)
      .then(() => setCardState(CardState.Finished))
      .catch((error) => {
        setCardState(CardState.Cancelled);
        setCancelMessage(error.message);
      })
      .finally(() => setTimeout(() => setCardState(CardState.Idle), 3000));
  }

  return (
    <article className={classNames(css['Root'], css[cardState])}>
      <div className={css['ImageContainer']}>
        <div className={css['Image']} style={{ backgroundImage: `url(${project.thumbURI})` }} />
      </div>

      <div className={css['Content']}>

        <div>
          <header>
            <Title hasBottomSpacing>{project.name}</Title>
            {project.latestAccessed && (
              <Text textType={TextType.Shy}>Last accessed {isNeue ? timeSince(new Date(project.latestAccessed)) : timeSince(project.latestAccessed)} ago</Text>
            )}
          </header>
        </div>

        <div className={css['HoverOverlay']}>
          <div className={css['CtaContainer']}>
            <PrimaryButton label="Import" onClick={() => isNeue ? onPickFolderClicked(project, setCardState) : handleDownload()} />
          </div>
        </div>

        <div className={css['ImportIndicator']}>
          <Title isCentered hasBottomSpacing>
            Importing module
          </Title>
          <ActivityIndicator />
        </div>

        <div className={css['SuccessToast']}>
          <Title variant={TitleVariant.Success} isCentered hasBottomSpacing>
            Successfully imported
          </Title>
          <Text>{project.name}</Text>
        </div>

        <div className={css['CancelToast']}>
          <Title variant={TitleVariant.Danger} isCentered>
            {cancelMessage}
          </Title>
        </div>
      </div>
    </article>
  );
}
