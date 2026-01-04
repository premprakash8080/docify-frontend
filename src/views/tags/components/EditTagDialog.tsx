import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from 'react-select';
import {
  Button,
  Form,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { updateTag } from '../store/tagsSlice';
import tagService from '../services/tag.service';
import type { Tag, TagColor } from '../types';
import type { AppDispatch } from '@/store/types';

interface EditTagDialogProps {
  show: boolean;
  onHide: () => void;
  tag: Tag | null;
}

const schema = yup.object().shape({
  name: yup.string().required('Tag name is required'),
  color_id: yup.number().nullable(),
});

type FormValues = yup.InferType<typeof schema>;

type ColorOption = {
  value: number;
  label: string;
  hex_code: string;
};

function EditTagDialog({ show, onHide, tag }: EditTagDialogProps) {
  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colors, setColors] = useState<TagColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      color_id: null,
    },
  });

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const colorsData = await tagService.getColors(true);
        setColors(colorsData);
      } catch (error: any) {
        console.error('Failed to load colors:', error);
      }
    };

    if (show) {
      fetchColors();
      if (tag) {
        reset({
          name: tag.name || '',
          color_id: tag.color_id || null,
        });
        // Set selected color based on tag's color_id
        if (tag.color_id && tag.color) {
          setSelectedColor({
            value: tag.color.id,
            label: tag.color.name,
            hex_code: tag.color.hex_code,
          });
        } else {
          setSelectedColor(null);
        }
      }
      setError(null);
    }
  }, [show, tag, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!tag) return;

    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(
        updateTag({
          tagId: tag.id,
          payload: {
            id: tag.id,
            name: data.name,
            color_id: data.color_id || null,
          },
        })
      );

      if (result.type.endsWith('/fulfilled')) {
        onHide();
        reset();
      } else {
        setError(result.payload as string || 'Failed to update tag');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedColor(null);
    setError(null);
    onHide();
  };

  const handleColorChange = (option: ColorOption | null) => {
    setSelectedColor(option);
    setValue('color_id', option?.value || null);
  };

  const colorOptions: ColorOption[] = colors.map((color) => ({
    value: color.id,
    label: color.name,
    hex_code: color.hex_code,
  }));

  const customOption = ({ data, innerRef, innerProps }: any) => (
    <div ref={innerRef} {...innerProps} className="d-flex align-items-center gap-2 p-2">
      <span
        className="badge rounded-circle"
        style={{
          width: '16px',
          height: '16px',
          backgroundColor: data.hex_code,
          padding: 0,
        }}
      />
      <span>{data.label}</span>
    </div>
  );

  const customSingleValue = ({ data }: any) => (
    <div className="d-flex align-items-center gap-2">
      <span
        className="badge rounded-circle"
        style={{
          width: '16px',
          height: '16px',
          backgroundColor: data.hex_code,
          padding: 0,
        }}
      />
      <span>{data.label}</span>
    </div>
  );

  if (!tag) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle as="h4">Edit Tag</ModalTitle>
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            disabled={loading}
          ></button>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <FormLabel>
              Tag Name <span className="text-danger">*</span>
            </FormLabel>
            <FormControl
              type="text"
              placeholder="Enter tag name"
              isInvalid={!!errors.name}
              disabled={loading}
              {...register('name')}
            />
            {errors.name && (
              <div className="invalid-feedback d-block">{errors.name.message}</div>
            )}
          </div>

          <div className="mb-3">
            <FormLabel>Color (Optional)</FormLabel>
            <Select
              className="react-select"
              classNamePrefix="react-select"
              placeholder="Select a color"
              options={colorOptions}
              value={selectedColor}
              onChange={handleColorChange}
              isClearable
              isDisabled={loading}
              components={{
                Option: customOption,
                SingleValue: customSingleValue,
              }}
            />
            <input type="hidden" {...register('color_id')} />
            <small className="text-muted">Leave empty if no color is needed</small>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Tag'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default EditTagDialog;

