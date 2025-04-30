import { useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// Notification data
// const notifications = [
//   {
//     id: 1,
//     avatar: <GiftOutlined />,
//     avatarColor: { color: 'success.main', bgcolor: 'success.lighter' },
//     primaryText: "It's Cristina danny's birthday today.",
//     secondaryText: '2 min ago',
//     time: '3:00 AM',
//     selected: true
//   },
//   {
//     id: 2,
//     avatar: <MessageOutlined />,
//     avatarColor: { color: 'primary.main', bgcolor: 'primary.lighter' },
//     primaryText: 'Aida Burg commented your post.',
//     secondaryText: '5 August',
//     time: '6:00 PM',
//     selected: false
//   },
//   {
//     id: 3,
//     avatar: <SettingOutlined />,
//     avatarColor: { color: 'error.main', bgcolor: 'error.lighter' },
//     primaryText: 'Your Profile is Complete 60%',
//     secondaryText: '7 hours ago',
//     time: '2:45 PM',
//     selected: true
//   },
//   {
//     id: 4,
//     avatar: 'C',
//     avatarColor: { color: 'primary.main', bgcolor: 'primary.lighter' },
//     primaryText: 'Cristina Danny invited to join Meeting.',
//     secondaryText: 'Daily scrum meeting time',
//     time: '9:10 PM',
//     selected: false
//   }
// ];
const notifications = [];
// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [read, setRead] = useState(2);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconBackColorOpen = 'grey.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={read} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Bildirimler"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {read > 0 && (
                        <Tooltip title="Hepsini okundu olarak işaretle">
                          <IconButton color="success" size="small" onClick={() => setRead(0)}>
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length === 0 || notifications === undefined || notifications === null ? (
                      <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
                        <ListItemText primary="Yeni bildirim yok" />
                      </ListItemButton>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id}>
                          <ListItemButton selected={notification.selected}>
                            <ListItemAvatar>
                              <Avatar sx={notification.avatarColor}>{notification.avatar}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">{notification.primaryText}</Typography>}
                              secondary={notification.secondaryText}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {notification.time}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                          <Divider />
                        </div>
                      ))
                    )}

                    <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="primary">
                            Hepisini Göster
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
