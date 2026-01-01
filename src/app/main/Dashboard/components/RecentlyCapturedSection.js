import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '24px',
}));

const SectionHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
}));

const ContentArea = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: '24px',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '16px',
  },
}));

const WebClipsArea = styled(Paper)(({ theme }) => ({
  minHeight: '200px',
  padding: '16px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const WebClipPrompt = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '24px',
}));

const ClipIcon = styled('div')(({ theme }) => ({
  width: '80px',
  height: '80px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: '50%',
}));

function RecentlyCapturedSection() {
  const [webClipFilter, setWebClipFilter] = useState('all');

  return (
    <Root>
      <SectionHeader>
        <div className="flex items-center space-x-16">
          <SectionTitle>Recently captured</SectionTitle>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="web-clips-filter-label">Web clips</InputLabel>
            <Select
              labelId="web-clips-filter-label"
              value={webClipFilter}
              label="Web clips"
              onChange={(e) => setWebClipFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        </div>
      </SectionHeader>

      <ContentArea>
        <WebClipsArea>
          <Typography variant="body2" color="text.secondary">
            No web clips yet
          </Typography>
        </WebClipsArea>

        <WebClipPrompt>
          <ClipIcon>
            <FuseSvgIcon size={48} color="warning">
              heroicons-outline:scissors
            </FuseSvgIcon>
          </ClipIcon>
          <Typography variant="body1" className="font-medium mb-8">
            Save useful information from the web.
          </Typography>
          <Button
            variant="contained"
            sx={(theme) => ({
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400],
              },
            })}
          >
            Clip web content
          </Button>
        </WebClipPrompt>

        <div />
      </ContentArea>
    </Root>
  );
}

export default RecentlyCapturedSection;

