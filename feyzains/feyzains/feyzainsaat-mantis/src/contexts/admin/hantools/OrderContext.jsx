import React, { createContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { sendApiRequest } from "services/network_service"; // API çağrıları için kullanılan servis

export const OrderContext = createContext();

const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata mesajı

  const ordersUrl = "core/orders/";
  const notesUrl = "core/notes/";

  // const fetchOrders = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  
  //   try {
  //     const res = await sendApiRequest({ url: ordersUrl, method: "GET" });
  //     if (res.response.status === 200) {
  //       setOrders(res.data || []);
  //     } else {
  //       setError("Siparişler alınırken bir hata oluştu.");
  //       console.error("Failed to fetch supplier orders:", res.response);
  //     }
  //   } catch (error) {
  //     setError("API çağrısı başarısız oldu.");
  //     console.error("Failed to fetch orders:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const fetchOrders = async ({
    page = 1, 
    pageSize = 10, 
    search = "", 
    seller = "", 
    customer = "", 
    paymentType = "", 
    startDate = "", 
    endDate = "",
    hourRange = "", 
  } = {}) => { // defaults added here to prevent undefined
    setLoading(true);
    setError(null);
  
    const params = new URLSearchParams();
    params.append("page", page || 1);  // page defaulted to 1 if undefined
    params.append("page_size", pageSize || 10);  // page_size defaulted to 10 if undefined
    if (search) params.append("search", search);
    if (seller) params.append("seller", seller);
    if (customer) params.append("customer", customer);
    if (paymentType) params.append("payment_type", paymentType);
    if (startDate && endDate) {
      params.append("start_date", new Date(startDate).toISOString());
      params.append("end_date", new Date(endDate).toISOString());
    }
    if (hourRange) params.append("hour_range", hourRange);
  
    
    try {
      const res = await sendApiRequest({
        url: `core/orders/?${params.toString()}`,
        method: "GET",
      });
  
      if (res.response.status === 200) {
        setOrders(res.data.results || []);
        setOrderCount(res.data.count || 0);
      } else {
        setError("Siparişler alınırken bir hata oluştu.");
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };
  

  const fetchNotes = useCallback(async (order_id) => {
    setLoading(true);
    setError(null);

    try {
        const res = await sendApiRequest({ url: `${notesUrl}?order_id=${order_id}`, method: "GET" });
        if (res.response.status === 200) {
        setNotes(res.data || []);
        } else {
        setError("Notları alırken bir hata oluştu");
        console.error("Failed to fetch notes:", res.response);
        }
    } catch (error) {
        setError("API çağrısı başarısız oldu.");
        console.error("Failed to fetch notes:", error);
    } finally {
        setLoading(false);
    }
  }, []);
  

  const createOrder = async (data) => {
      setError(null);
      try {
      const res = await sendApiRequest({ url: ordersUrl, method: "POST", body: data });
      if (res.response.status === 201) {
          setOrders((prevOrders) => [res.data.order, ...prevOrders]);
          return { 
          success: true, 
          message: res.data.message,
          order: res.data.order,
          };
      } else {
          const errorMessage = res.data?.message || "Yeni sipariş oluşturulamadı.";
          setError(errorMessage);
          return { 
          success: false, 
          error: errorMessage 
          };
      }
      } catch (error) {
      const errorMessage = error.response?.data?.message || "Sipariş eklenirken bir hata oluştu.";
      setError(errorMessage);
      return { 
          success: false, 
          error: errorMessage 
      };
      }
  };

  const createNote = async (data) => {
    setError(null);
    try {
    const res = await sendApiRequest({ url: notesUrl, method: "POST", body: data });
    if (res.response.status === 201) {
        setNotes((prevOrders) => [res.data.order, ...prevOrders]);
        return { 
        success: true, 
        message: res.data.message,
        order: res.data.order 
        };
    } else {
        const errorMessage = res.data?.message || "Yeni not eklenemedi.";
        setError(errorMessage);
        return { 
        success: false, 
        error: errorMessage 
        };
    }
    } catch (error) {
    const errorMessage = error.response?.data?.message || "Not eklenirken bir hata oluştu.";
    setError(errorMessage);
    return { 
        success: false, 
        error: errorMessage 
    };
    }
};
    
  // Sipariş Güncelle (PUT)
  const updateOrder = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: ordersUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === data.id ? res.data.order : order))
        );
        return { 
          success: true, 
          message: res.data.message,
          order: res.data.order 
        };
      } else if (res.response.status === 400) {
        const errorMessage = res.data?.message || "Sipariş güncellenemedi.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      } else if (res.response.status === 404) {
        setError("Sipariş bulunamadı.");
        return { 
          success: false, 
          error: "Sipariş bulunamadı." 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Sipariş güncellenirken bir hata oluştu.";
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const deleteOrder = async (id) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: ordersUrl, method: "DELETE", body: { id }  });
        console.log("Full API Response:", res);
        if (res.data?.success) {
          setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
          return res.data;
        } else {
          setError("Sipariş silinemedi.");
          console.error("Failed to delete order:", res.response);
          return { error: "Failed to delete order" };
        }
      } catch (error) {
        setError("Sipariş silinirken bir hata oluştu.");
        console.error("Failed to delete order:", error);
        return error;
      }
  };

  const cancelOrder = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: ordersUrl, method: "PUT", body: data  });
      console.log("Full API Response:", res);
      if (res.data?.success) {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== data.id));
        return res.data;
      } else {
        setError("Sipariş silinemedi.");
        console.error("Failed to delete order:", res.response);
        return res.data;
      }
    } catch (error) {
      setError("Sipariş silinirken bir hata oluştu.");
      console.error("Failed to delete order:", error);
      return error;
    }
  };

  

  return (
    <OrderContext.Provider
      value={{
        orders,
        orderCount,
        notes,
        loading,
        error,
        fetchOrders,
        fetchNotes,
        createOrder,
        createNote,
        deleteOrder,
        updateOrder,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

OrderProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default OrderProvider;
