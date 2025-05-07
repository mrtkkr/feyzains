import React, { createContext, useState } from 'react';
import { sendApiRequest } from '../../services/network_service.js';
import PropTypes from 'prop-types';
export const OrderContext = createContext();

const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [claims, setClaims] = useState([]);
  const order_list_url = 'order/list/';
  const claim_list_url = 'order/claim_list/';
  const order_detail_url = 'order/';
  const claim_detail_url = 'order/claim/';
  const order_change_status = 'order/change_status/';
  const api_orders_url = 'api/create_orders_with_celery/';
  const task_status_url = 'tasks/';
  const reject_claim_url = 'api/reject_claim/';
  const accept_claim_url = 'api/accept_claim/';

  const fetchOrders = async (pageNumber = 0, pageSize = 10, searchFilters) => {
    try {
      const updatedSearchFilters = Object.keys(searchFilters).reduce((acc, key) => {
        acc[key] = searchFilters[key] !== null && searchFilters[key] !== undefined ? searchFilters[key] : '';
        return acc;
      }, {});
      const queryParams = {
        ...updatedSearchFilters,
        page: pageNumber + 1,
        page_size: pageSize
      };
      const res = await sendApiRequest({ url: order_list_url, method: 'GET', queryParams: queryParams });
      if (res.response.ok) {
        setOrders((prevOrders) => {
          const newOrders = res.data.results;
          const existingOrders = prevOrders.orders || [];
          return {
            ...prevOrders,
            orders: pageNumber === 0 ? newOrders : [...existingOrders, ...newOrders],
            ordersCount: res.data.count
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };
  const fetchClaims = async (pageNumber = 0, pageSize = 10, searchFilters) => {
    try {
      const updatedSearchFilters = Object.keys(searchFilters).reduce((acc, key) => {
        acc[key] = searchFilters[key] !== null && searchFilters[key] !== undefined ? searchFilters[key] : '';
        return acc;
      }, {});
      const queryParams = {
        ...updatedSearchFilters,
        page: pageNumber + 1,
        page_size: pageSize
      };
      const res = await sendApiRequest({ url: claim_list_url, method: 'GET', queryParams: queryParams });
      if (res.response.ok) {
        setClaims((prevClaims) => {
          const newClaims = res.data.results;
          const existingClaims = prevClaims.claims || [];
          return {
            ...prevClaims,
            claims: pageNumber === 0 ? newClaims : [...existingClaims, ...newClaims],
            claimsCount: res.data.count
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    }
  };

  const fetchOrder = async (uuid) => {
    try {
      const res = await sendApiRequest({ url: order_detail_url + uuid + '/', method: 'GET' });
      return res;
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };
  const fetchClaim = async (uuid) => {
    try {
      const res = await sendApiRequest({ url: claim_detail_url + uuid + '/', method: 'GET' });
      return res;
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  const updateOrder = async (uuid, values) => {
    try {
      const res = await sendApiRequest({ url: order_detail_url + uuid + '/', method: 'PATCH', body: values });
      if (res.response.ok) {
        setOrders((prevOrders) => {
          const existingOrders = prevOrders.products || [];
          const updatedOrders = existingOrders.map((order) => {
            if (order.uuid === res.data.order.uuid) {
              return res.data.order;
            }
            return order;
          });
          return {
            ...prevOrders,
            orders: updatedOrders
          };
        });
      }
      return res;
    } catch (error) {
      console.error('Failed to fetch updateOrder:', error);
    }
  };
  const rejectClaim = async (values) => {
    try {
      const res = await sendApiRequest({ url: reject_claim_url, method: 'POST', body: values });
      return res;
    } catch (error) {
      console.error('Failed to fetch rejectClaim:', error);
    }
  };
  const acceptClaim = async (values) => {
    try {
      const res = await sendApiRequest({ url: accept_claim_url, method: 'POST', body: values });
      return res;
    } catch (error) {
      console.error('Failed to fetch acceptClaim:', error);
    }
  };
  const changeOrderStatus = async (uuid, status) => {
    try {
      const request_body = {
        order: uuid,
        status: status
      };
      const res = await sendApiRequest({ url: order_change_status, method: 'POST', body: request_body });
      return res;
    } catch (error) {
      console.error('Failed to fetch updateOrder:', error);
    }
  };
  const addOrder = async (values) => {
    try {
      const res = await sendApiRequest({ url: order_detail_url, method: 'POST', body: values });

      if (res.response.ok) {
        setOrders((prevOrders) => {
          return {
            ...prevOrders,
            orders: [res.data, ...prevOrders.orders]
          };
        });
      }
      return res;
    } catch (error) {
      console.error('Failed to fetch :', error);
    }
  };

  const fetchOrdersToBackend = async () => {
    try {
      const res = await sendApiRequest({ url: api_orders_url, method: 'POST' });
      return res;
    } catch (error) {
      console.error('Failed to fetchOrdersToBackend:', error);
    }
  };
  const fetchCeleryTaskStatus = async (task_id) => {
    try {
      const res = await sendApiRequest({ url: task_status_url + task_id + '/', method: 'GET' });
      return res;
    } catch (error) {
      console.error('Failed to fetchCeleryTaskStatus:', error);
    }
  };
  return (
    <OrderContext.Provider
      value={{
        orders,
        claims,
        fetchOrders,
        fetchClaims,
        fetchOrder,
        fetchClaim,
        addOrder,
        updateOrder,
        changeOrderStatus,
        fetchOrdersToBackend,
        fetchCeleryTaskStatus,
        rejectClaim,
        acceptClaim
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
OrderProvider.propTypes = { children: PropTypes.element };
export default OrderProvider;
