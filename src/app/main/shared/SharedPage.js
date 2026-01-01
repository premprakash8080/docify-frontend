import FusePageSimple from '@fuse/core/FusePageSimple';
import Typography from '@mui/material/Typography';

function SharedPage() {
  return (
    <FusePageSimple
      content={
        <div className="flex flex-col items-center justify-center p-24 min-h-full">
          <Typography variant="h4" className="mb-16">
            Shared with me
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Shared with me page coming soon...
          </Typography>
        </div>
      }
    />
  );
}

export default SharedPage;

