import FusePageSimple from '@fuse/core/FusePageSimple';
import Typography from '@mui/material/Typography';

function SpacesPage() {
  return (
    <FusePageSimple
      content={
        <div className="flex flex-col items-center justify-center p-24 min-h-full">
          <Typography variant="h4" className="mb-16">
            Spaces
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Spaces page coming soon...
          </Typography>
        </div>
      }
    />
  );
}

export default SpacesPage;

