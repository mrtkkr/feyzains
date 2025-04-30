// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project import
import Profile from './Profile';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      <Box sx={{ flex: 1 }} />
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}
      

      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
