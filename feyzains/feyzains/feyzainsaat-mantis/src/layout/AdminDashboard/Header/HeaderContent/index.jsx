// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project import
import Search from './Search';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {/* {!downLG && <Search />} */}
      {!downLG && <Box sx={{ flexGrow: 1 }} />} {/* Placeholder for Search */}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}
      {/* <IconButton
        component={Link}
        target="_blank"
        disableRipple
        color="secondary"
        title="Backend"
        sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
      >
        <GithubOutlined />
      </IconButton> */}
      <Notification />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
