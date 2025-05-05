import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const GroupContext = createContext();

const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dataLoaded = useRef(false);

  const baseUrl = 'core/';
  const groupListUrl = 'group/';
  const groupDetailUrl = 'groups/';

  const fetchGroups = useCallback(async (forceRefresh = false) => {
    if (dataLoaded.current && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + groupListUrl,
        method: 'GET'
      });

      if (res.response.status === 200) {
        setGroups(res.data || []);
        dataLoaded.current = true;
      } else {
        setError('Gruplar alınırken bir hata oluştu.');
      }
    } catch (err) {
      console.error('fetchGroups error:', err);
      setError('API çağrısı başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addGroup = async (groupData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + groupListUrl,
        method: 'POST',
        body: groupData
      });

      if (res?.response?.status === 201) {
        // Başarılı bir şekilde eklendiğinde, listeyi güncelliyoruz
        setGroups((prev) => [...prev, res.data]);
        return { success: true, data: res.data };
      } else {
        setError('Grup eklenemedi.');
        return { success: false, error: 'Grup eklenemedi.' };
      }
    } catch (err) {
      console.error('addGroup error:', err);
      setError('Grup eklenirken hata oluştu.');
      return { success: false, error: 'Grup eklenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${groupDetailUrl}${id}/`,
        method: 'DELETE'
      });

      if (res?.response?.status === 204) {
        setGroups((prev) => prev.filter((gp) => gp.id !== id));
        return { success: true };
      } else {
        setError('Grup silinemedi.');
        return { success: false, error: 'Grup silinemedi.' };
      }
    } catch (err) {
      console.error('deleteGroup error:', err);
      setError('Grup silinirken hata oluştu.');
      return { success: false, error: 'Grup silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Eksik olan updateGroup fonksiyonunu ekliyoruz
  const updateGroup = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${groupDetailUrl}${id}/`,
        method: 'PUT',
        body: updatedData
      });

      if (res?.response?.status === 200 || res?.response?.status === 204) {
        setGroups((prev) => prev.map((gp) => (gp.id === id ? { ...gp, ...updatedData } : gp)));
        return { success: true };
      } else {
        setError('Grup güncellenemedi.');
        return { success: false, error: 'Grup güncellenemedi.' };
      }
    } catch (err) {
      console.error('updateGroup error:', err);
      setError('Grup güncellenirken hata oluştu.');
      return { success: false, error: 'Grup güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        fetchGroups,
        addGroup,
        deleteGroup,
        updateGroup // ✅ Buraya eklendi
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

GroupProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default GroupProvider;
