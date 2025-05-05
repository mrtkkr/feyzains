import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const WorksiteContext = createContext();

const WorksiteProvider = ({ children }) => {
  const [worksites, setWorksites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dataLoaded = useRef(false);

  const baseUrl = 'core/';
  const worksiteListUrl = 'worksite/';
  const worksiteDetailUrl = 'worksites/';

  const fetchWorksites = useCallback(async (forceRefresh = false) => {
    if (dataLoaded.current && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + worksiteListUrl,
        method: 'GET'
      });

      if (res.response.status === 200) {
        setWorksites(res.data || []);
        dataLoaded.current = true;
      } else {
        setError('Şantiyeler alınırken bir hata oluştu.');
      }
    } catch (err) {
      console.error('fetchWorksites error:', err);
      setError('API çağrısı başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorksite = async (worksiteData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + worksiteListUrl,
        method: 'POST',
        body: worksiteData
      });

      if (res?.response?.status === 201) {
        // Başarılı bir şekilde eklendiğinde, listeyi güncelliyoruz
        setWorksites((prev) => [...prev, res.data]);
        return { success: true, data: res.data };
      } else {
        setError('İşyeri eklenemedi.');
        return { success: false, error: 'İşyeri eklenemedi.' };
      }
    } catch (err) {
      console.error('addWorksite error:', err);
      setError('İşyeri eklenirken hata oluştu.');
      return { success: false, error: 'İşyeri eklenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteWorksite = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${worksiteDetailUrl}${id}/`,
        method: 'DELETE'
      });

      if (res?.response?.status === 204) {
        setWorksites((prev) => prev.filter((ws) => ws.id !== id));
        return { success: true };
      } else {
        setError('Şantiye silinemedi.');
        return { success: false, error: 'Şantiye silinemedi.' };
      }
    } catch (err) {
      console.error('deleteWorksite error:', err);
      setError('Şantiye silinirken hata oluştu.');
      return { success: false, error: 'Şantiye silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Eksik olan updateWorksite fonksiyonunu ekliyoruz
  const updateWorksite = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${worksiteDetailUrl}${id}/`,
        method: 'PUT',
        body: updatedData
      });

      if (res?.response?.status === 200 || res?.response?.status === 204) {
        setWorksites((prev) => prev.map((ws) => (ws.id === id ? { ...ws, ...updatedData } : ws)));
        return { success: true };
      } else {
        setError('Şantiye güncellenemedi.');
        return { success: false, error: 'Şantiye güncellenemedi.' };
      }
    } catch (err) {
      console.error('updateWorksite error:', err);
      setError('Şantiye güncellenirken hata oluştu.');
      return { success: false, error: 'Şantiye güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorksiteContext.Provider
      value={{
        worksites,
        loading,
        error,
        fetchWorksites,
        addWorksite,
        deleteWorksite,
        updateWorksite // ✅ Buraya eklendi
      }}
    >
      {children}
    </WorksiteContext.Provider>
  );
};

WorksiteProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default WorksiteProvider;
