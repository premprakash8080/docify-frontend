import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import Input from '@mui/material/Input';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { lighten } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FileListItem from './FileListItem';
import { selectFiles, selectFilesLoading } from '../store/filesSlice';
import FuseLoading from '@fuse/core/FuseLoading';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import { uploadFile } from '../store/filesSlice';

function FilesList(props) {
  const dispatch = useDispatch();
  const files = useSelector(selectFiles);
  const loading = useSelector(selectFilesLoading);
  const [searchText, setSearchText] = useState('');

  const handleSearchText = (event) => {
    setSearchText(event.target.value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      dispatch(uploadFile(formData));
    }
  };

  const filteredFiles = useMemo(() => {
    if (searchText.length === 0) {
      return files;
    }
    return FuseUtils.filterArrayByString(files, searchText);
  }, [files, searchText]);

  // Move useMemo outside conditional - hooks must be called in same order every render
  const fileListContent = useMemo(() => {
    const container = {
      show: {
        transition: {
          staggerChildren: 0.05,
        },
      },
    };

    const item = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    };

    if (filteredFiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-24">
          <FuseSvgIcon className="icon-size-64 mb-16" color="disabled">
            heroicons-outline:document
          </FuseSvgIcon>
          <Typography variant="body2" color="text.secondary">
            No files found
          </Typography>
        </div>
      );
    }

    return (
      <motion.div
        className="flex flex-col shrink-0"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredFiles.map((file, index) => (
          <motion.div variants={item} key={file.id}>
            <FileListItem file={file} isLast={index === filteredFiles.length - 1} />
          </motion.div>
        ))}
      </motion.div>
    );
  }, [filteredFiles]);

  return (
    <div className="flex flex-col flex-auto h-full">
      <Box
        className="py-16 px-32 border-b-1"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <div className="flex flex-col gap-12 mb-16">
          <Typography className="font-semibold text-18">Files</Typography>
          <input
            accept="*/*"
            style={{ display: 'none' }}
            id="file-upload-button"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload-button">
            <Button
              variant="contained"
              component="span"
              size="small"
              startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
              fullWidth
            >
              Upload File
            </Button>
          </label>
        </div>
        <Paper className="flex p-4 items-center w-full px-16 py-4 border-1 h-40 rounded-full shadow-none">
          <FuseSvgIcon color="action" size={20}>
            heroicons-solid:search
          </FuseSvgIcon>
          <Input
            placeholder="Search files..."
            className="flex flex-1 px-8"
            disableUnderline
            fullWidth
            value={searchText}
            inputProps={{
              'aria-label': 'Search',
            }}
            onChange={handleSearchText}
          />
        </Paper>
      </Box>

      <FuseScrollbars className="overflow-y-auto flex-1">
        {loading && files.length === 0 ? (
          <div className="flex items-center justify-center p-24">
            <FuseLoading />
          </div>
        ) : (
          <List className="w-full">{fileListContent}</List>
        )}
      </FuseScrollbars>
    </div>
  );
}

export default FilesList;

