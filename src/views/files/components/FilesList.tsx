import { useMemo, useState, type ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { TbPlus, TbSearch, TbFileText } from 'react-icons/tb';
import SimpleBar from 'simplebar-react';
import FileListItem from './FileListItem';
import { selectFiles, selectFilesLoading } from '../store/filesSlice';
import { uploadFile } from '../store/filesSlice';
import type { AppDispatch } from '@/store/types';

// Simple filter function to replace FuseUtils
const filterArrayByString = (array: any[], searchText: string): any[] => {
  if (!searchText) return array;
  const lowerSearch = searchText.toLowerCase();
  return array.filter((item) => {
    const filename = (item.filename || item.name || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    return filename.includes(lowerSearch) || description.includes(lowerSearch);
  });
};

function FilesList() {
  const dispatch: AppDispatch = useDispatch();
  const files = useSelector(selectFiles);
  const loading = useSelector(selectFilesLoading);
  const [searchText, setSearchText] = useState('');

  const handleSearchText = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      dispatch(uploadFile(formData));
      // Reset input
      event.target.value = '';
    }
  };

  const filteredFiles = useMemo(() => {
    if (searchText.length === 0) {
      return files;
    }
    return filterArrayByString(files, searchText);
  }, [files, searchText]);

  return (
    <div className="d-flex flex-column h-100">
      <div
        className="py-4 px-4 border-bottom"
        style={{
          backgroundColor: 'var(--bs-light)',
        }}
      >
        <div className="d-flex flex-column gap-3 mb-4">
          <h5 className="fw-semibold mb-0" style={{ fontSize: '18px' }}>
            Files
          </h5>
          <input
            accept="*/*"
            style={{ display: 'none' }}
            id="file-upload-button"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload-button" className="w-100">
            <Button variant="primary" size="sm" className="w-100" as="span">
              <TbPlus className="me-1" size={16} />
              Upload File
            </Button>
          </label>
        </div>
        <InputGroup className="rounded-pill border" style={{ height: '40px' }}>
          <InputGroup.Text className="bg-transparent border-0">
            <TbSearch size={20} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search files..."
            className="border-0 bg-transparent"
            value={searchText}
            onChange={handleSearchText}
            style={{ fontSize: '14px' }}
          />
        </InputGroup>
      </div>

      <SimpleBar className="flex-fill">
        {loading && files.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center p-5">
            <div className="mb-4" style={{ fontSize: '64px', color: 'var(--bs-secondary)' }}>
              <TbFileText />
            </div>
            <p className="text-muted mb-0">No files found</p>
          </div>
        ) : (
          <ListGroup variant="flush" className="w-100">
            {filteredFiles.map((file, index) => (
              <FileListItem
                key={file.id}
                file={file}
                isLast={index === filteredFiles.length - 1}
              />
            ))}
          </ListGroup>
        )}
      </SimpleBar>
    </div>
  );
}

export default FilesList;

