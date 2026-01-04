import { Card, CardBody, CardFooter, Button } from 'react-bootstrap';
import { TbEye, TbFileText } from 'react-icons/tb';
import type { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  onUse: (template: Template) => void;
}

function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  const previewContent = template.content.length > 150 
    ? template.content.substring(0, 150) + '...' 
    : template.content;

  return (
    <Card className="h-100">
      <CardBody className="d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-2">
          <TbFileText size={24} className="text-primary" />
          <h5 className="mb-0 fw-semibold">{template.title}</h5>
        </div>
        <p className="text-muted small mb-auto" style={{ minHeight: '60px' }}>
          {previewContent || 'No content available'}
        </p>
      </CardBody>
      <CardFooter className="d-flex gap-2 border-top">
        <Button
          variant="light"
          size="sm"
          className="flex-fill d-flex align-items-center justify-content-center gap-2"
          onClick={() => onPreview(template)}
        >
          <TbEye size={18} />
          Preview
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-fill d-flex align-items-center justify-content-center gap-2"
          onClick={() => onUse(template)}
        >
          Use
        </Button>
      </CardFooter>
    </Card>
  );
}

export default TemplateCard;

