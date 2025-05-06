import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const PersonalContext = createContext();

const PersonalProvider = ({ children }) => {
  const [personals, setPersonals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dataLoaded = useRef(false);

  const baseUrl = 'core/';
  const personalListUrl = 'personal/';
  const personalDetailUrl = 'personals/';

  const fetchPersonals = useCallback(async (forceRefresh = false) => {
    if (dataLoaded.current && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + personalListUrl,
        method: 'GET'
      });

      if (res.response.status === 200) {
        setPersonals(res.data || []);
        dataLoaded.current = true;
      } else {
        setError('Personeller alınırken bir hata oluştu.');
      }
    } catch (err) {
      console.error('fetchPersonals error:', err);
      setError('API çağrısı başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPersonal = async (personalData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + personalListUrl,
        method: 'POST',
        body: personalData
      });

      if (res?.response?.status === 201) {
        // Başarılı bir şekilde eklendiğinde, listeyi güncelliyoruz
        setPersonals((prev) => [...prev, res.data]);
        return { success: true, data: res.data };
      } else {
        setError('Personel eklenemedi.');
        return { success: false, error: 'Personel eklenemedi.' };
      }
    } catch (err) {
      console.error('addPersonal error:', err);
      setError('Personel eklenirken hata oluştu.');
      return { success: false, error: 'Personel eklenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deletePersonal = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${personalDetailUrl}${id}/`,
        method: 'DELETE'
      });

      if (res?.response?.status === 204) {
        setPersonals((prev) => prev.filter((ps) => ps.id !== id));
        return { success: true };
      } else {
        setError('Personel silinemedi.');
        return { success: false, error: 'Personel silinemedi.' };
      }
    } catch (err) {
      console.error('deletePersonal error:', err);
      setError('Personel silinirken hata oluştu.');
      return { success: false, error: 'Personel silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Eksik olan updateCompany fonksiyonunu ekliyoruz
  const updatePersonal = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${personalDetailUrl}${id}/`,
        method: 'PUT',
        body: updatedData
      });

      if (res?.response?.status === 200 || res?.response?.status === 204) {
        setPersonals((prev) => prev.map((ps) => (ps.id === id ? { ...ps, ...updatedData } : ps)));
        return { success: true };
      } else {
        setError('Personel güncellenemedi.');
        return { success: false, error: 'Personel güncellenemedi.' };
      }
    } catch (err) {
      console.error('updatePersonel error:', err);
      setError('Personel güncellenirken hata oluştu.');
      return { success: false, error: 'Personel güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <PersonalContext.Provider
      value={{
        personals,
        loading,
        error,
        fetchPersonals,
        addPersonal,
        deletePersonal,
        updatePersonal // ✅ Buraya eklendi
      }}
    >
      {children}
    </PersonalContext.Provider>
  );
};

PersonalProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default PersonalProvider;
