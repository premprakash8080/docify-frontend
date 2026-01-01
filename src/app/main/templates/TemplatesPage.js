import FusePageSimple from '@fuse/core/FusePageSimple';
import Typography from '@mui/material/Typography';

function TemplatesPage() {
  return (
    <FusePageSimple
      content={
        <div className="flex flex-col items-center justify-center p-24 min-h-full">
          <Typography variant="h4" className="mb-16">
            Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Templates page coming soon...
          </Typography>
        </div>
      }
    />
  );
}

export default TemplatesPage;

