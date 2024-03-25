import { ProjectModel } from "@noodl-models/projectmodel";

import AdmZip from 'adm-zip';
import { ipcRenderer } from "electron";
import { useCanvasView } from "../../views/documents/EditorDocument/hooks/UseCanvasView";
import { useCaptureThumbnails } from "../../views/documents/EditorDocument/hooks/UseCaptureThumbnails";

export function exportProjectToZip() {
  const zip = new AdmZip();
  //ProjectModel.instance.setThumbnailFromDataURI('https://media.istockphoto.com/id/495199168/photo/latin-bridge-in-sarajevo-bosnia-and-herzegovina.jpg?s=612x612&w=0&k=20&c=CnWiNahELbd4wEJWokVk5Pxq5u3CVVMtX7wkYtjP2m8=')
  alert()
  zip.addLocalFolder(ProjectModel.instance._retainedProjectDirectory);
  ProjectModel.instance.getThumbnailURI() === undefined && ipcRenderer.emit('viewer-capture-thumb')
  // .on('viewer-capture-thumb', async ({ sender }) => {
  //   // Capture a snapshot of the viewer
  //   useCaptureThumbnails( this.canvasView, true)
  //   // const image = await this.canvasView.captureThumbnail();
  //   // ProjectModel.instance.setThumbnailFromDataURI(image.toDataURL())
  // });
  const zipBuffer = zip.toBuffer();

  const zip2 = new AdmZip(zipBuffer);
  zip2.writeZip(`C:/Users/User/Desktop/${ProjectModel.instance.name}_Buffer.zip`)
}

export function importProjectFromZip(direntry:string) {
  const zip = new AdmZip(`C:/Users/User/Desktop/hmm_Buffer.zip`);
  zip.extractAllTo(direntry, true);
}