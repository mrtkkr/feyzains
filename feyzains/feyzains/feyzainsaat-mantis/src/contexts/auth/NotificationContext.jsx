import React, { createContext, useState, useEffect } from 'react';
import { sendApiRequest } from '../../services/network_service.js';
import PropTypes from 'prop-types';

export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async ({ pageNumber = 0, pageSize = 10 } = {}) => {
    const apiUrl = 'notification/';
    const queryParams = {
      page_size: pageSize
    };

    if (pageNumber !== undefined) {
      queryParams.page = pageNumber + 1;
    }
    try {
      const res = await sendApiRequest({ url: apiUrl, method: 'GET', queryParams: queryParams });
      console.log('fetchNotifications', res);

      if (res.response.status === 200) {
        setNotifications(res.data.results);
      }
      return res;
    } catch (error) {
      console.error('Failed to fetch fetchNotifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  const setNotificationsAsRead = async () => {
    const apiUrl = 'set_notifications_as_read/';

    try {
      const res = await sendApiRequest({
        url: apiUrl,
        method: 'POST',
        body: { notification_ids: notifications.map((notification) => notification.id) }
      });
      console.log('setNotificationsAsRead', res);

      notifications.forEach((notification) => {
        notification.is_read = true;
      });

      if (res.response.status === 200) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to fetch setNotificationsAsRead:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications, setNotificationsAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = { children: PropTypes.node };

export default NotificationProvider;
