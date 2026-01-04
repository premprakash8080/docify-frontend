import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Nav, NavItem, NavLink, Row, Spinner, TabContainer, TabContent, TabPane, Modal, ModalBody, ModalHeader, ModalTitle, ModalFooter, Button as BootstrapButton } from 'react-bootstrap';
import { TbFileText, TbUser } from 'react-icons/tb';
import ComponentCard from '@/components/cards/ComponentCard';
import TemplateCard from './TemplateCard';
import { fetchSystemTemplates, fetchMyTemplates, selectSystemTemplates, selectMyTemplates, selectTemplatesLoading } from '../store/templatesSlice';
import type { Template } from '../types';
import type { AppDispatch } from '@/store/types';

function TemplatesList() {
  const dispatch: AppDispatch = useDispatch();
  const systemTemplates = useSelector(selectSystemTemplates);
  const myTemplates = useSelector(selectMyTemplates);
  const loading = useSelector(selectTemplatesLoading);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    dispatch(fetchSystemTemplates());
    dispatch(fetchMyTemplates());
  }, [dispatch]);

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleUse = (template: Template) => {
    // TODO: Implement template usage logic
    console.log('Use template:', template);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewTemplate(null);
  };

  return (
    <>
      <ComponentCard title="Templates" bodyClassName="p-0">
        <TabContainer defaultActiveKey="system">
          <Nav className="nav-tabs nav-justified nav-bordered nav-bordered-primary mb-3 px-3 pt-3">
            <NavItem>
              <NavLink eventKey="system" href="#system-templates">
                <TbFileText className="fs-lg me-md-1 align-middle" />
                System Templates
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink eventKey="my" href="#my-templates">
                <TbUser className="fs-lg me-md-1 align-middle" />
                My Templates
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent className="p-3">
            <TabPane eventKey="system" id="system-templates">
              {loading && systemTemplates.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" className="text-primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : systemTemplates.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <TbFileText size={64} className="mb-3 opacity-50" />
                  <p className="mb-0">No system templates available</p>
                </div>
              ) : (
                <Row className="g-3">
                  {systemTemplates.map((template) => (
                    <Col key={template.id} xs={12} sm={6} md={4} lg={3}>
                      <TemplateCard
                        template={template}
                        onPreview={handlePreview}
                        onUse={handleUse}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </TabPane>
            <TabPane eventKey="my" id="my-templates">
              {loading && myTemplates.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" className="text-primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : myTemplates.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <TbUser size={64} className="mb-3 opacity-50" />
                  <p className="mb-0">No templates created yet</p>
                </div>
              ) : (
                <Row className="g-3">
                  {myTemplates.map((template) => (
                    <Col key={template.id} xs={12} sm={6} md={4} lg={3}>
                      <TemplateCard
                        template={template}
                        onPreview={handlePreview}
                        onUse={handleUse}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </TabPane>
          </TabContent>
        </TabContainer>
      </ComponentCard>

      <Modal show={showPreview} onHide={handleClosePreview} size="lg" centered>
        <ModalHeader>
          <ModalTitle>{previewTemplate?.title || 'Template Preview'}</ModalTitle>
          <button type="button" className="btn-close" onClick={handleClosePreview}></button>
        </ModalHeader>
        <ModalBody>
          <div className="border rounded p-3 bg-light" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
              {previewTemplate?.content || 'No content available'}
            </pre>
          </div>
        </ModalBody>
        <ModalFooter>
          <BootstrapButton variant="light" onClick={handleClosePreview}>
            Close
          </BootstrapButton>
          <BootstrapButton
            variant="primary"
            onClick={() => {
              if (previewTemplate) {
                handleUse(previewTemplate);
                handleClosePreview();
              }
            }}
          >
            Use Template
          </BootstrapButton>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default TemplatesList;

