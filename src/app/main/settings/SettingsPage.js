import FusePageSimple from '@fuse/core/FusePageSimple';
import Typography from '@mui/material/Typography';

function SettingsPage() {
  return (
    <FusePageSimple
      content={
        <div className="flex flex-col items-center justify-center p-24 min-h-full">
          <Typography variant="h4" className="mb-16">
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Settings page coming soon...
          </Typography>
        </div>
      }
    />
  );
}

export default SettingsPage;

