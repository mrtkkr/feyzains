import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { sendApiRequest } from "services/network_service"; // API çağrıları için kullanılan servis

export const WarehouseContext = createContext();

const WarehouseProvider = ({ children }) => {
  const [warehouses, setWarehouses] = useState([]); // Depocular
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata mesajı

  const warehousesUrl = "core/warehouses/"; // Tek bir API endpoint

  const fetchWarehouses = useCallback(async (date) => {
    setLoading(true);
    setError(null);
  
    try {
      // Depocular
      const res = await sendApiRequest({ url: warehousesUrl, method: "GET" });
      if (res.response.status === 200) {
        setWarehouses(res.data || []);
      } else {
        setError("Depocular alınırken bir hata oluştu.");
        console.error("Failed to fetch warehouses:", res.response);
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch warehouses:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  

  const createWarehouse = async (data) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: warehousesUrl, method: "POST", body: data });
        if (res.response.status === 201) {
          setWarehouses((prevWarehouses) => [res.data.warehouse, ...prevWarehouses]);
          return { 
            success: true, 
            message: res.data.message,
            warehouse: res.data.warehouse 
          };
        } else {
          const errorMessage = res.data?.message || "Yeni depocu eklenemedi.";
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage 
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Depocu eklenirken bir hata oluştu.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    };
    
    // Depocu Güncelle (PUT)
    const updateWarehouse = async (data) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: warehousesUrl, method: "PUT", body: data });
        if (res.response.status === 200) {
          setWarehouses((prevWarehouses) =>
            prevWarehouses.map((warehouse) => (warehouse.id === data.id ? res.data.warehouse : warehouse))
          );
          return { 
            success: true, 
            message: res.data.message,
            warehouse: res.data.warehouse 
          };
        } else if (res.response.status === 400) {
          const errorMessage = res.data?.message || "Depocu güncellenemedi.";
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage 
          };
        } else if (res.response.status === 404) {
          setError("Depocu bulunamadı.");
          return { 
            success: false, 
            error: "Depocu bulunamadı." 
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Depocu güncellenirken bir hata oluştu.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    };

  const deleteWarehouse = async (id) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: warehousesUrl, method: "DELETE", body: { id }  });
        console.log("Full API Response:", res);
        if (res.data?.success) {
          setWarehouses((prevWarehouses) => prevWarehouses.filter((warehouse) => warehouse.id !== id));
          return res.data;
        } else {
          setError("Depocu silinemedi.");
          console.error("Failed to delete warehouse:", res.response);
          return { error: "Failed to delete warehouse" };
        }
      } catch (error) {
        setError("Depocu silinirken bir hata oluştu.");
        console.error("Failed to delete warehouse:", error);
        return error;
      }
    };

  

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        loading,
        error,
        fetchWarehouses,
        createWarehouse,
        deleteWarehouse,
        updateWarehouse,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

WarehouseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default WarehouseProvider;
