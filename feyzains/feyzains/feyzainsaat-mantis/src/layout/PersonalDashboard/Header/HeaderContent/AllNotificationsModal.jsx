import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Pagination
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { NotificationContext } from 'contexts/auth/NotificationContext';
import { formatDate, formatTimeOnly } from 'utils/formatDate';
import { getAvatar, getAvatarColor } from './Notification';
import PropTypes from 'prop-types';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflow: 'auto'
};

const AllNotificationsModal = ({ open, handleClose }) => {
  const { fetchNotifications } = useContext(NotificationContext);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadNotifications = async () => {
      const res = await fetchNotifications({ pageNumber: page - 1, pageSize: 5 });
      if (res.response.status === 200) {
        setNotifications(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 5));
      }
    };

    if (open) {
      loadNotifications();
    }
  }, [open, page]);
  AllNotificationsModal.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Tüm Bildirimler</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {notifications.map((notification) => (
            <div key={notification.id}>
              <ListItemButton selected={!notification.is_read}>
                <ListItemAvatar>
                  <Avatar sx={getAvatarColor(notification.priority)}>{getAvatar(notification.priority)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="h6">{notification.message}</Typography>}
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
          ))}
        </List>
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Box>
      </Box>
    </Modal>
  );
};

export default AllNotificationsModal;
