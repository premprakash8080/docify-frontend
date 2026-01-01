import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContext } from 'react';
import { FilesAppContext } from '../FilesApp';

const FilesFirstScreen = () => {
  const { setMainSidebarOpen } = useContext(FilesAppContext);

  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full p-24">
      <FuseSvgIcon className="icon-size-128 mb-16" color="disabled">
        heroicons-outline:document
      </FuseSvgIcon>
      <Typography
        className="hidden md:flex text-20 font-semibold tracking-tight text-secondary"
        color="text.secondary"
      >
        Select a file to preview
      </Typography>
      <Typography
        className="flex md:hidden text-16 font-medium tracking-tight text-secondary mt-8"
        color="text.secondary"
      >
        Select a file to preview
      </Typography>
    </div>
  );
};

export default FilesFirstScreen;

