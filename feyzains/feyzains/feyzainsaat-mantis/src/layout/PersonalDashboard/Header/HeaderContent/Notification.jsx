import React, { useRef, useState, useContext } from 'react';
import {
  Badge,
  IconButton,
  Popper,
  Paper,
  ClickAwayListener,
  Tooltip,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Typography,
  Box,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BellOutlined, CheckCircleOutlined, GiftOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import { NotificationContext } from 'contexts/auth/NotificationContext';
import { formatDate, formatTimeOnly } from 'utils/formatDate';
import AllNotificationsModal from './AllNotificationsModal';

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

export const getAvatar = (priority) => {
  switch (priority) {
    case 1:
      return <GiftOutlined />;
    case 2:
      return <MessageOutlined />;
    case 3:
      return <BellOutlined />;
    case 4:
      return <SettingOutlined />;
    default:
      return <BellOutlined />;
  }
};

export const getAvatarColor = (priority) => {
  switch (priority) {
    case 1:
      return { color: 'success.main', bgcolor: 'success.lighter' };
    case 2:
      return { color: 'grey.500', bgcolor: 'grey.200' };
    case 3:
      return { color: 'primary.main', bgcolor: 'primary.lighter' };
    case 4:
      return { color: 'error.main', bgcolor: 'error.lighter' };
    default:
      return { color: 'grey.500', bgcolor: 'grey.200' };
  }
};

export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const { notifications, setNotificationsAsRead } = useContext(NotificationContext);
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const displayedNotifications = notifications.slice(0, 5);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? 'grey.100' : 'transparent' }}
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notifications-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount} color="primary">
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
                      {unreadCount > 0 && (
                        <Tooltip title="Hepsini okundu olarak işaretle">
                          <IconButton color="success" size="small" onClick={setNotificationsAsRead}>
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
                    {displayedNotifications.length === 0 ? (
                      <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
                        <ListItemText primary="Yeni bildirim yok" />
                      </ListItemButton>
                    ) : (
                      displayedNotifications.map((notification) => (
                        <div key={notification.id}>
                          <ListItemButton selected={!notification.is_read}>
                            <ListItemAvatar>
                              <Avatar sx={getAvatarColor(notification.priority)}>{getAvatar(notification.priority)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6" fontWeight={notification.is_read ? '400' : '600'}>
                                  {notification.message}
                                </Typography>
                              }
                              secondary={formatDate(notification.created_at)}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {formatTimeOnly(notification.created_at)}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                          <Divider />
                        </div>
                      ))
                    )}

                    <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }} onClick={handleModalOpen}>
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="primary">
                            Hepsini Göster
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
      <AllNotificationsModal open={modalOpen} handleClose={handleModalClose} />
    </Box>
  );
}
