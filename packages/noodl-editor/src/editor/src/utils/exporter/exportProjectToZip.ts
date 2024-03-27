import { ProjectModel } from "@noodl-models/projectmodel";

import AdmZip from 'adm-zip';
import { filesystem } from "@noodl/platform";
import { ProjectItem } from "@noodl-utils/LocalProjectsModel";
import { NeueService } from "@noodl-models/NeueServices/NeueService";

export async function exportProjectToZip() {
  const zip = new AdmZip();
  alert(ProjectModel.instance._retainedProjectDirectory)

  zip.addLocalFolder(ProjectModel.instance._retainedProjectDirectory);
  const zipBuffer = zip.toBuffer();

  const projectItem:ProjectItem = {  
      id: ProjectModel.instance.id,
      name: ProjectModel.instance.name,
      latestAccessed: new Date().getMilliseconds(),
      thumbURI: ProjectModel.instance.getThumbnailURI(),
      retainedProjectDirectory: ProjectModel.instance._retainedProjectDirectory
  }
  const json = await filesystem.readJson(`${ProjectModel.instance._retainedProjectDirectory}/project.json`)
  //alert(JSON.stringify(json))
  //alert(zipBuffer.buffer instanceof ArrayBuffer)

  await NeueService.instance.saveProject( new Uint8Array(zipBuffer).buffer, projectItem, JSON.stringify(json)).then((d)=>{alert(`${d} usp`)})
}

export async function importProjectFromZip(direntry:string, id:string) {
  const arrayBuffer = await NeueService.instance.fetchProject(id)
  const copiedBuffer = Buffer.from(arrayBuffer[0])

  const zip = new AdmZip(copiedBuffer);
  zip.extractAllTo(direntry, true);
}