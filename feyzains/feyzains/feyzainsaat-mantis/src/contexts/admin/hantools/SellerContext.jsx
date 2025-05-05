import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { sendApiRequest } from "services/network_service"; // API çağrıları için kullanılan servis

export const SellerContext = createContext();

const SellerProvider = ({ children }) => {
  const [sellers, setSellers] = useState([]); // Satıcılar
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata mesajı

  const sellersUrl = "core/sellers/"; // Tek bir API endpoint

  const fetchSellers = useCallback(async (date) => {
    setLoading(true);
    setError(null);
  
    try {
      // Satıcılar
      const res = await sendApiRequest({ url: sellersUrl, method: "GET" });
      if (res.response.status === 200) {
        setSellers(res.data || []);
      } else {
        setError("Satıcılar alınırken bir hata oluştu.");
        console.error("Failed to fetch supplier sellers:", res.response);
      }
    } catch (error) {
      setError("API çağrısı başarısız oldu.");
      console.error("Failed to fetch sellers:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  

  const createSeller = async (data) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: sellersUrl, method: "POST", body: data });
        if (res.response.status === 201) {
          setSellers((prevSellers) => [res.data.seller, ...prevSellers]);
          return { 
            success: true, 
            message: res.data.message,
            seller: res.data.seller 
          };
        } else {
          const errorMessage = res.data?.message || "Yeni satıcı eklenemedi.";
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage 
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Satıcı eklenirken bir hata oluştu.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    };
    
    // Satıcı Güncelle (PUT)
    const updateSeller = async (data) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: sellersUrl, method: "PUT", body: data });
        if (res.response.status === 200) {
          setSellers((prevSellers) =>
            prevSellers.map((seller) => (seller.id === data.id ? res.data.seller : seller))
          );
          return { 
            success: true, 
            message: res.data.message,
            seller: res.data.seller 
          };
        } else if (res.response.status === 400) {
          const errorMessage = res.data?.message || "Satıcı güncellenemedi.";
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage 
          };
        } else if (res.response.status === 404) {
          setError("Satıcı bulunamadı.");
          return { 
            success: false, 
            error: "Satıcı bulunamadı." 
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Satıcı güncellenirken bir hata oluştu.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    };

  const deleteSeller = async (id) => {
      setError(null);
      try {
        const res = await sendApiRequest({ url: sellersUrl, method: "DELETE", body: { id }  });
        console.log("Full API Response:", res);
        if (res.data?.success) {
          setSellers((prevSellers) => prevSellers.filter((seller) => seller.id !== id));
          return res.data;
        } else {
          setError("Satıcı silinemedi.");
          console.error("Failed to delete seller:", res.response);
          return { error: "Failed to delete seller" };
        }
      } catch (error) {
        setError("Satıcı silinirken bir hata oluştu.");
        console.error("Failed to delete seller:", error);
        return error;
      }
    };

  

  return (
    <SellerContext.Provider
      value={{
        sellers,
        loading,
        error,
        fetchSellers,
        createSeller,
        deleteSeller,
        updateSeller,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

SellerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SellerProvider;
