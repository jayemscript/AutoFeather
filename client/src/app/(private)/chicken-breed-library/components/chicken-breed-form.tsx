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

import SingleImageUploader from '@/components/customs/single-image-uploader';
import FormPreviewer from '@/components/customs/form-previewer';
import { PreviewField } from '@/components/customs/preview-field';

import { GiRooster } from 'react-icons/gi';
import { Eye, Hash, RotateCcw } from 'lucide-react';

import { FormModalProps } from '@/interfaces/shared.interface';
import useChickenBreedFormLogic from './chicken-breed-form.logic';

import { BreedPurposeEnum } from '@/api/protected/predict/chicken-breed-api.interface';

const FIELD_HELPERS = {
  code: 'Unique internal identifier for this chicken breed.',
  chickenName: 'Common or local name of the chicken breed.',
  scientificName: 'Scientific (taxonomic) name of the breed.',
  originCountry: 'Country where this breed was originally developed.',
  purpose: 'Primary production purpose of the breed.',
  eggColor: 'Typical color of eggs produced by this breed.',
  eggPerYear: 'Average number of eggs produced per year.',
  meatType: 'Meat characteristics (e.g., white, dark, tender).',
  plumageColor: 'Primary feather color of the breed.',
  combType: 'Type of comb (single, rose, pea, etc.).',
  averageWeight: 'Average adult body weight in kilograms.',
  temperament: 'General behavior (docile, aggressive, active).',
  climateTolerance: 'Climate conditions this breed adapts well to.',
  broodiness: 'Whether hens tend to sit on eggs and hatch chicks.',
  description: 'Detailed overview of the breed’s characteristics.',
};

const ChickenBreedFormModal: React.FC<FormModalProps> = ({
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
  } = useChickenBreedFormLogic(open, close, mode, initialData, onSuccess);

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
                {mode === 'edit'
                  ? 'Edit Chicken Breed'
                  : 'Create Chicken Breed'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage chicken breed information
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
              description="Upload an image of the breed"
              icon={<GiRooster />}
            >
              <FormGrid columns={1}>
                <FormField label="Image">
                  <SingleImageUploader
                    value={formData.image}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: value || '',
                      }))
                    }
                    valueType="base64"
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
                <FormField label="Code" required helper={FIELD_HELPERS.code}>
                  <Input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField
                  label="Breed Name"
                  required
                  helper={FIELD_HELPERS.chickenName}
                >
                  <Input
                    name="chickenName"
                    value={formData.chickenName}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField
                  label="Scientific Name"
                  required
                  helper={FIELD_HELPERS.scientificName}
                >
                  <Input
                    name="scientificName"
                    value={formData.scientificName}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField
                  label="Origin Country"
                  required
                  helper={FIELD_HELPERS.originCountry}
                >
                  <Input
                    name="originCountry"
                    value={formData.originCountry}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField
                  label="Purpose"
                  required
                  helper={FIELD_HELPERS.purpose}
                >
                  <Select
                    value={formData.purpose}
                    onValueChange={(value: BreedPurposeEnum) =>
                      setFormData((prev) => ({
                        ...prev,
                        purpose: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BreedPurposeEnum.EGG}>Egg</SelectItem>
                      <SelectItem value={BreedPurposeEnum.MEAT}>
                        Meat
                      </SelectItem>
                      <SelectItem value={BreedPurposeEnum.DUAL}>
                        Dual
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Egg Color" helper={FIELD_HELPERS.eggColor}>
                  <Input
                    name="eggColor"
                    value={formData.eggColor}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField
                  label="Eggs per Year"
                  helper={FIELD_HELPERS.eggPerYear}
                >
                  <Input
                    type="number"
                    name="eggPerYear"
                    value={formData.eggPerYear}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Meat Type" helper={FIELD_HELPERS.meatType}>
                  <Input
                    name="meatType"
                    value={formData.meatType}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField
                  label="Plumage Color"
                  helper={FIELD_HELPERS.plumageColor}
                >
                  <Input
                    name="plumageColor"
                    value={formData.plumageColor}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Comb Type" helper={FIELD_HELPERS.combType}>
                  <Input
                    name="combType"
                    value={formData.combType}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField
                  label="Average Weight (kg)"
                  helper={FIELD_HELPERS.averageWeight}
                >
                  <Input
                    type="number"
                    name="averageWeight"
                    value={formData.averageWeight}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField
                  label="Temperament"
                  helper={FIELD_HELPERS.temperament}
                >
                  <Input
                    name="temperament"
                    value={formData.temperament}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField
                  label="Climate Tolerance"
                  helper={FIELD_HELPERS.climateTolerance}
                >
                  <Input
                    name="climateTolerance"
                    value={formData.climateTolerance}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Broodiness" helper={FIELD_HELPERS.broodiness}>
                  <Select
                    value={String(formData.broodiness)}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        broodiness: value === 'true',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
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
        headerTitle="Review Chicken Breed"
        disabled={mode === 'edit' ? !hasChanges : !isFormValid}
      >
        <ScrollArea>
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
            {formData?.image && (
              <div className="flex flex-col items-center mb-4 pb-4 border-b border-border/30">
                <span className="text-sm text-muted-foreground font-medium mb-2">
                  Previous Image
                </span>
                <img
                  src={formData.image}
                  alt="Previous Chicken Breed"
                  className="w-full h-full object-cover rounded-lg border border-primary/30 shadow-sm"
                />
              </div>
            )}
            <PreviewField label="Code" value={formData.code} />
            <PreviewField label="Breed Name" value={formData.chickenName} />
            <PreviewField
              label="Scientific Name"
              value={formData.scientificName}
            />
            <PreviewField label="Origin" value={formData.originCountry} />
            <PreviewField label="Purpose" value={formData.purpose} />
            <PreviewField label="Egg Color" value={formData.eggColor} />
            <PreviewField label="Eggs / Year" value={formData.eggPerYear} />
            <PreviewField label="Meat Type" value={formData.meatType} />
            <PreviewField
              label="Average Weight"
              value={formData.averageWeight}
            />
            <PreviewField label="Temperament" value={formData.temperament} />
            <PreviewField
              label="Broody"
              value={formData.broodiness ? 'Yes' : 'No'}
            />
            <PreviewField label="Description" value={formData.description} />
          </div>
        </ScrollArea>
      </FormPreviewer>
    </>
  );
};

export default ChickenBreedFormModal;
