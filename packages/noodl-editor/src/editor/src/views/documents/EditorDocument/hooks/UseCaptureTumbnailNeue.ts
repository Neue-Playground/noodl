import { BrowserWindow } from '@electron/remote';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';

import { ProjectModel } from '@noodl-models/projectmodel';

import { CanvasView } from '../../../VisualCanvas/CanvasView';

export function useCaptureThumbnailNeue(canvasView: CanvasView, viewerDetached: boolean, isNeue: boolean) {
  const [refreshRate, setRefreshRate] = useState(1000);
  useEffect(() => {
    setRefreshRate(isNeue ? 1000 : 20 * 1000);
  }, [isNeue]);

  useEffect(() => {
    // Start capture interval for viewer thumbs
    const timer = setInterval(async () => {
      if (isNeue) {
        const win = BrowserWindow.getFocusedWindow();

        win.webContents
          .capturePage({
            x: 350,
            y: 20,
            width: 800,
            height: 900
          })
          .then((img) => {
            ProjectModel.instance.setThumbnailFromDataURI(img.toDataURL());
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        if (viewerDetached) {
          ipcRenderer.send('viewer-capture-thumb');
          ipcRenderer.once('viewer-capture-thumb-reply', (event, url) => {
            ProjectModel.instance.setThumbnailFromDataURI(url);
          });
        } else {
          const thumb = await canvasView?.captureThumbnail();
          if (thumb) {
            ProjectModel.instance.setThumbnailFromDataURI(thumb.toDataURL());
          }
        }
      }
    }, refreshRate);

    return () => {
      clearInterval(timer);
    };
  }, [canvasView, viewerDetached, isNeue]);
}
