import { Outlet } from 'react-router';

function DashboardLayout() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bs-body-bg, #fff)',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        width: '100%',
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;

