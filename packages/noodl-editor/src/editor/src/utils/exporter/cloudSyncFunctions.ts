import AdmZip from 'adm-zip';
import { ipcRenderer } from 'electron';
import { filesystem } from '@noodl/platform';

import { App } from '@noodl-models/app';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { ProjectModel } from '@noodl-models/projectmodel';
import { LocalProjectsModel, ProjectItem } from '@noodl-utils/LocalProjectsModel';

import { EventDispatcher } from '../../../../shared/utils/EventDispatcher';

export async function exportProjectZipToCloud(setShowSpinner: (x: boolean) => void) {
  setShowSpinner(true);
  await checkCloudVersion().then(() => setShowSpinner(false));
}

export async function importProjectFromZip(direntry: string, id: string) {
  App.instance.exitProject();
  await LocalProjectsModel.instance.removeProject(id);

  const arrayBuffer = await NeueService.instance.fetchProject(id);
  const projectItem = JSON.parse(arrayBuffer[1]);
  const copiedBuffer = Buffer.from(arrayBuffer[0]);

  const zip = new AdmZip(copiedBuffer);
  await zip.extractAllTo(`${direntry}`, true);

  await LocalProjectsModel.instance.openProjectFromFolder(`${direntry}`).then(async (res) => {
    res.setCloudVersionChange(projectItem.cloudVersion);
    EventDispatcher.instance.notifyListeners('import-neue-cloud-close');
  });
}

async function checkCloudVersion() {
  const coludProjectVersion = await NeueService.instance
    .fetchProject(ProjectModel.instance.id)
    .then((res) => {
      const config = JSON.parse(res[1]);
      return config.cloudVersion as number;
    })
    .catch(() => 0);

  if (coludProjectVersion !== null && coludProjectVersion > ProjectModel.instance.cloudVersion) {
    EventDispatcher.instance.notifyListeners('check-cloud-version-download-project-open', {
      project: {
        ...ProjectModel.instance,
        coludProjectVersion: coludProjectVersion + 1
      },
      action: 'save'
    });
  } else {
    await uploadProjectZipToCloud({
      coludProjectVersion: coludProjectVersion + 1
    });
  }
}

export async function uploadProjectZipToCloud(args) {
  const projectItem: ProjectItem = {
    id: ProjectModel.instance.id,
    name: ProjectModel.instance.name,
    latestAccessed: new Date(),
    thumbURI: ProjectModel.instance.getThumbnailURI(),
    retainedProjectDirectory: ProjectModel.instance._retainedProjectDirectory,
    firmware: ProjectModel.instance.firmware,
    isCloud: true,
    cloudVersion: args.coludProjectVersion
  };
  const jsonLocal = await filesystem.readJson(`${ProjectModel.instance._retainedProjectDirectory}/project.json`);
  const json = {
    ...jsonLocal,
    ...projectItem
  };

  await filesystem.writeJson(`${ProjectModel.instance._retainedProjectDirectory}/project.json`, json);

  const zip = new AdmZip();
  zip.addLocalFolder(ProjectModel.instance._retainedProjectDirectory);
  const zipBuffer = zip.toBuffer();

  await NeueService.instance
    .saveProject(new Uint8Array(zipBuffer).buffer, projectItem, JSON.stringify(json))
    .then(() => {
      ProjectModel.instance.setIsCloud(true);
      ProjectModel.instance.setCloudVersionChange(args.coludProjectVersion);
    })
    .catch((err) => {
      throw new Error(err);
    });
}
