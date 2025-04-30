// PanelContext.jsx
import React, { createContext, useState } from "react";
import { sendApiRequest } from "../../services/network_service.js";

export const PanelContext = createContext();

const userApiUrl = "users/"; 

export const PanelProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [taxRate, setTaxRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kullanıcıları Getir (GET)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: userApiUrl, method: "GET" });
      if (res.response.status === 200) {
        setUsers(res.data);
      } else {
        setError("Kullanıcılar getirilemedi.");
        console.error("Failed to fetch users:", res.response);
      }
    } catch (error) {
      setError("Kullanıcılar getirilirken bir hata oluştu.");
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı Ekle (POST)
const createUser = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: userApiUrl, method: "POST", body: data });
      if (res.response.status === 201) {
        setUsers((prevUsers) => [res.data.user, ...prevUsers]);
        return { 
          success: true, 
          message: res.data.message,
          user: res.data.user 
        };
      } else {
        const errorMessage = res.data?.message || "Yeni kullanıcı eklenemedi.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Kullanıcı eklenirken bir hata oluştu.";
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };
  
  // Kullanıcı Güncelle (PUT)
  const updateUser = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: userApiUrl, method: "PUT", body: data });
      if (res.response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === data.id ? res.data.user : user))
        );
        return { 
          success: true, 
          message: res.data.message,
          user: res.data.user 
        };
      } else if (res.response.status === 400) {
        const errorMessage = res.data?.message || "Kullanıcı güncellenemedi.";
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage 
        };
      } else if (res.response.status === 404) {
        setError("Kullanıcı bulunamadı.");
        return { 
          success: false, 
          error: "Kullanıcı bulunamadı." 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Kullanıcı güncellenirken bir hata oluştu.";
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Kullanıcı Sil (DELETE)
  const deleteUser = async (id) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: userApiUrl, method: "DELETE", body: { id }  });
      console.log("Full API Response:", res);
      if (res.data?.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        return res.data;
      } else {
        setError("Kullanıcı silinemedi.");
        console.error("Failed to delete user:", res.response);
        return { error: "Failed to delete user" };
      }
    } catch (error) {
      setError("Kullanıcı silinirken bir hata oluştu.");
      console.error("Failed to delete user:", error);
      return error;
    }
  };

  


  return (
    <PanelContext.Provider
      value={{
        users,
        taxRate,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        
      }}
    >
      {children}
    </PanelContext.Provider>
  );
};

export default PanelProvider;
