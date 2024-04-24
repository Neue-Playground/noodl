import AdmZip from 'adm-zip';
import { ipcRenderer } from 'electron';
import { filesystem } from '@noodl/platform';

import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { ProjectModel } from '@noodl-models/projectmodel';
import { ProjectItem } from '@noodl-utils/LocalProjectsModel';

import { useCaptureThumbnails } from '../../views/documents/EditorDocument/hooks/UseCaptureThumbnails';

export async function exportProjectToZip(setShowSpinner) {
  setShowSpinner(true);
  const projectItem: ProjectItem = {
    id: ProjectModel.instance.id,
    name: ProjectModel.instance.name,
    latestAccessed: new Date(),
    thumbURI: ProjectModel.instance.getThumbnailURI(),
    retainedProjectDirectory: ProjectModel.instance._retainedProjectDirectory,
    firmware: ProjectModel.instance.firmware,
    isCloud: true
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

  if (ProjectModel.instance.getThumbnailURI() === undefined) {
    //&& ipcRenderer.send('viewer-capture-thumb')
    ipcRenderer.send('viewer-capture-thumb');
    ipcRenderer.once('viewer-capture-thumb-reply', (event, url) => {
      ProjectModel.instance.setThumbnailFromDataURI(url);
    });

    ipcRenderer.on('viewer-capture-thumb', async ({ sender }) => {
      // Capture a snapshot of the viewer
      useCaptureThumbnails(this.canvasView, true);
      const image = await this.canvasView.captureThumbnail();
      ProjectModel.instance.setThumbnailFromDataURI(image.toDataURL());
    });
  }

  await NeueService.instance
    .saveProject(new Uint8Array(zipBuffer).buffer, projectItem, JSON.stringify(json))
    .then((d) => {
      setShowSpinner(false);
    })
    .catch(() => setShowSpinner(false));
}

export async function importProjectFromZip(direntry: string, id: string) {
  const arrayBuffer = await NeueService.instance.fetchProject(id);
  const projectItem = JSON.parse(arrayBuffer[1]);
  const copiedBuffer = Buffer.from(arrayBuffer[0]);

  const zip = new AdmZip(copiedBuffer);
  zip.extractAllTo(`${direntry}/${projectItem.name}`, true);
  return projectItem.name;
}
