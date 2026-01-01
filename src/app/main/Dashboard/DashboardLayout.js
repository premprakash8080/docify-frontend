import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
}));

const MainContent = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  width: '100%',
}));

function DashboardLayout() {
  return (
    <Root>
      <MainContent>
        <Outlet />
      </MainContent>
    </Root>
  );
}

export default DashboardLayout;

