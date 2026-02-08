'use client';

import React, { useEffect } from 'react';
import Modal from '@/components/customs/modal/modal';
import AlertDialog from '@/components/customs/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  FormContainer,
  FormSection,
  FormGrid,
  FormField,
} from '@/components/customs/form-layout';
import FormPreviewer from '@/components/customs/form-previewer';
import { PreviewField } from '@/components/customs/preview-field';

import { GiRooster } from 'react-icons/gi';
import { Eye, Hash, RotateCcw } from 'lucide-react';
import { FormModalProps } from '@/interfaces/shared.interface';
import usePredictionFormLogic from './predict-form.logic';
import ChickenPicker from './chicken-picker';
import ImageCapture from './image-capture';

const FIELD_HELPERS = {
  title: 'Any Title for this Prediction',
  description: 'Detailed overview of the Predection',
  temperature: 'Info About Temperature ',
  humidity: 'Info About Humidity',
  chickenName: 'Common or local name of the chicken breed.',
};

const PredictionFormModal: React.FC<FormModalProps> = ({
  open,
  close,
  mode = 'add',
  onSuccess,
  initialData = null,
}) => {
  const {
    currentDialog,
    openConfirm,
    handleCancel,
    handleConfirm,
    handleSubmit,
    handleReset,
    formData,
    setFormData,
    handleChange,
    previewData,
    isFormValid,
    hasChanges,
    setIsConfirmed,
    setShowPreview,
    showPreview,
    isConfirmed,
  } = usePredictionFormLogic(open, close, mode, initialData, onSuccess);

  useEffect(() => {
    if (isConfirmed) {
      setIsConfirmed(false);
    }
  }, [formData]);

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleConfirmSubmit = () => {
    setShowPreview(false);
    setIsConfirmed(true);
    handleCancel();
  };

  const handleActionClick = () => {
    if (isConfirmed) {
      handleSubmit(true); // proceed with actual submission
      setIsConfirmed(false);
    } else {
      handlePreview(); // open preview first
    }
  };

  return (
    <>
      <Modal
        width="!max-w-[80vw]"
        open={open}
        close={() => openConfirm('close')}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GiRooster className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {mode === 'edit' ? 'Edit Info' : 'Create Prediction Record'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage Prediction information
              </p>
            </div>
          </div>
        }
        footerChildren={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => openConfirm('reset')}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            <Button size="lg" onClick={handleActionClick}>
              <Eye className="w-4 h-4 mr-2" />
              {isConfirmed
                ? mode === 'edit'
                  ? 'Save Changes'
                  : 'Save'
                : mode === 'edit'
                  ? 'Preview & Update'
                  : 'Preview & Create'}
            </Button>
          </div>
        }
      >
        <form className="p-6">
          <FormContainer>
            {/* IMAGE */}
            <FormSection
              title="Chicken Image"
              description="Upload an image or use camera to capture the breed"
              icon={<GiRooster />}
            >
              <FormGrid columns={1}>
                <FormField label="Image">
                  <ImageCapture
                    value={formData.image}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: value || '',
                      }))
                    }
                    maxSizeMB={5}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* BASIC INFO */}
            <FormSection
              title="Basic Information"
              description="Core breed details"
              icon={<GiRooster />}
            >
              <FormGrid columns={2}>
                <FormField label="Title" required helper={FIELD_HELPERS.title}>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField
                  label="Breed Name"
                  required
                  helper={FIELD_HELPERS.chickenName}
                >
                  <ChickenPicker
                    value={formData.chickenBreed}
                    onSelect={(cat) =>
                      setFormData((prev) => ({
                        ...prev,
                        chickenBreed: cat,
                      }))
                    }
                  />
                </FormField>

                <FormField
                  label="Temperature"
                  helper={FIELD_HELPERS.temperature}
                  required
                >
                  <Input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Humidity" helper={FIELD_HELPERS.humidity}>
                  <Input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField
                  label="Description"
                  fullWidth
                  required
                  helper={FIELD_HELPERS.description}
                >
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </FormContainer>
        </form>
      </Modal>

      {/* CONFIRM DIALOG */}
      {currentDialog && (
        <AlertDialog
          isOpen
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          {...currentDialog}
        />
      )}

      {/* PREVIEW */}
      <FormPreviewer
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onSave={handleConfirmSubmit}
        headerTitle="Review Information"
        footerText={mode === 'edit' ? 'Confirm Update' : 'Confirm Create'}
        disabled={mode === 'edit' ? !hasChanges : !isFormValid}
      >
        <ScrollArea>
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
            {formData?.image && (
              <div className="flex flex-col items-center mb-4 pb-4 border-b border-border/30">
                <span className="text-sm text-muted-foreground font-medium mb-2">
                  Chicken Image
                </span>
                <img
                  src={formData.image}
                  alt="Chicken Breed"
                  className="w-full h-full object-cover rounded-lg border border-primary/30 shadow-sm"
                />
              </div>
            )}
            <PreviewField label="Title" value={formData.title} />
            <PreviewField label="Breed Name" value={formData.chickenBreed?.chickenName || ''} />
            <PreviewField label="Temperature" value={formData.temperature} />
            <PreviewField label="Humidity" value={formData.humidity} />
            <PreviewField label="Description" value={formData.description} />
          </div>
        </ScrollArea>
      </FormPreviewer>
    </>
  );
};

export default PredictionFormModal;