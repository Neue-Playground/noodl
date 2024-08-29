import { PrimaryButton } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { TextInput, TextInputVariant } from '@noodl-core-ui/components/inputs/TextInput';
import { BaseDialog } from '@noodl-core-ui/components/layout/BaseDialog';
import { exportTemplateToCloud } from '@noodl-utils/exporter/cloudSyncFunctions';
import React, { RefObject, useEffect, useState } from 'react';

type ModalProps = {
  isVisible: boolean,
  onClose: () => void,
  toastActivity: any;
  triggerRef: RefObject<HTMLElement>;
};

export default function NeueSaveTemplateToCloud(props: ModalProps) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [imageURI, setImageURI] = useState(null);

  useEffect(() => {
    if (props.isVisible) {
      setDescription('');
      setError(null);
      setImageURI(null);
    }
  }, [props.isVisible]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 400;
        const maxHeight = 400;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const base64String = canvas.toDataURL('image/jpeg');
        setImageURI(base64String);
      };
    };

    reader.readAsDataURL(file);
  };

  return (
    <BaseDialog
      triggerRef={props.triggerRef}
      isVisible={props.isVisible}
      onClose={props.onClose}
      isLockingScroll
    >
      <div style={{ width: 400 }}>
        <div
          style={{
            backgroundColor: '#444444',
            position: 'relative',
            maxHeight: `calc(90vh - 40px)`,
            // @ts-expect-error https://github.com/frenic/csstype/issues/62
            overflowY: 'overlay',
            overflowX: 'hidden',
            padding: '32px'
          }}
        >
          <TextInput
            value={description}
            variant={TextInputVariant.InModal}
            label='Template description'
            onChange={(ev) => setDescription(ev.currentTarget.value)}
            hasBottomSpacing={true}
          />
          <TextInput
            type='file'
            value={null}
            variant={TextInputVariant.InModal}
            label='Template image'
            onChange={handleImageUpload}
            hasBottomSpacing={true}
            acceptedFileTypes='.png, .jpg, .jpeg'
          />

          {error && <div style={{ color: 'red' }}>{error}</div>}

          <PrimaryButton label="Save template" onClick={async () => {
            setIsLoading(true);
            try {
              const response = await exportTemplateToCloud(description, imageURI);
              if (response) {
                props.toastActivity.showSuccess('Template successfully saved');

                props.onClose();
              }
              else {
                setIsLoading(false);

              }
            } catch (error) {
              setError('Failed to save the template: ' + error);
              props.toastActivity.showError('ERROR while saving the temlate');
            }
            setIsLoading(false);

          }}
            isLoading={isLoading}
            isDisabled={isLoading} />
        </div>
      </div>

    </BaseDialog>
  );
}
