import PropTypes from 'prop-types';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { sendApiRequest } from '../../../services/network_service.js';

// Context oluşturma
export const InventoryContext = createContext();

const InventoryProvider = ({ children }) => {
  const [productEntries, setProductEntries] = useState([]); // Ürün girişleri listesi
  const [companies, setCompanies] = useState([]); // Firma listesi
  const [productSales, setProductSales] = useState([]); // Ürün girişleri listesi
  const [clients, setClients] = useState([]); // Müşteri listesi
  const [stock, setStock] = useState([]); // Stok listesi
  const [carryoverStock, setCarryoverStock] = useState([]); // Devir stok listesi
  const [carryoverDebt, setCarryoverDebt] = useState([]); // Devir borç listesi
  const [carryoverReceivable, setCarryoverReceivable] = useState([]); // Devir alacak listesi
  const [products, setProducts] = useState([]); // Ürün listesi
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const [error, setError] = useState(null); // Hata mesajı
  const productApiUrl = 'tasks/product_entry/'; // Ürün girişleri için API URL'si
  const companyApiUrl = 'tasks/companies/'; // Firmalar için API URL'si
  const salesApiUrl = 'tasks/product_sale/'; // Ürün satışları için API URL'si
  const clientApiUrl = 'tasks/clients/'; // Müşteriler için API URL'si
  const stockUrl = 'tasks/get_stock/'; // Stoklar için API URL'si
  const carryoverStockUrl = 'tasks/carryover_stock/'; // Devir stoklar için API URL'si
  const carryoverDebtUrl = 'tasks/carryover_debt/'; // Devir borçlar için API URL'si
  const carryoverReceivableUrl = 'tasks/carryover_receivable/'; // Devir alacaklar için API URL'si
  const debtApiUrl = 'tasks/debts/'; // Borçlar için API URL'si
  const productUrl = 'tasks/get_products/'; // Ürünler için API URL'si
  // Ürün Girişlerini Fetch Etme (GET)
  const fetchProductEntries = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: `${productApiUrl}?date=${date}`, method: 'GET' });
      if (res.response.status === 200) {
        setProductEntries(res.data || []); // Gelen ürün girişlerini listeye ata
      } else {
        setError(res.data.message || 'Ürün girişleri alınırken bir hata oluştu.');
        console.error('Failed to fetch product entries:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch product entries:', error);
    } finally {
      setLoading(false);
    }
  }, [productApiUrl]);


  // Ürün Satışlarını Fetch Etme (GET)
  const fetchProductSales = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: `${salesApiUrl}?date=${date}`, method: 'GET' });
      if (res.response.status === 200) {
        setProductSales(res.data || []); // Gelen satışları listeye ata
      } else {
        setError('Satışlar alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch product sales:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch product sales:', error);
    } finally {
      setLoading(false);
    }
  }, [salesApiUrl]);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: stockUrl, method: 'GET' });
      if (res.response.status === 200) {
        setStock(res.data || []); // Gelen ürün girişlerini listeye ata
      } else {
        setError('Stoklar alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch stock:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  }, [stockUrl]);

  const fetchProducts = useCallback(async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url:`${productUrl}?company=${companyId}`, method: 'GET'});
      if (res.response.status === 200) {
        setProducts(res.data || []); // Gelen ürünleri listeye ata
      } else {
        setError('Ürünler alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch products:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [productUrl]);
  
  // Firmaları Fetch Etme (GET)
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: companyApiUrl, method: 'GET' });
      if (res.response.status === 200) {
        setCompanies(res.data || []); // Gelen firmaları listeye ata
      } else {
        setError('Firmalar alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch companies:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  }, [companyApiUrl]);

  // Müşterileri Fetch Etme (GET)
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: clientApiUrl, method: 'GET' });
      if (res.response.status === 200) {
        setClients(res.data || []); // Gelen müşterileri listeye ata
      } else {
        setError('Müşteriler alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch clients:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  }, [clientApiUrl]);


  // Yeni Ürün Girişi Ekleme (POST)
  const addProductEntry = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: productApiUrl, method: 'POST', body: data });
      if (res.response.status === 200 || res.response.status === 201) {
        setProductEntries((prevEntries) => [res.data, ...prevEntries]); // Yeni kaydı listeye ekle
        await fetchStock(); // Stok bilgisini güncelle
        return { success: true, data: res.data }; // Eklenen kaydı döndür
      } else {
        const errorMessage = `Ürün girişi eklenemedi. ${res.data.message}`;
        setError(errorMessage);
        console.error('Failed to add product entry:', res.response);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Yeni ürün girişi eklenirken bir hata oluştu.';
      setError(errorMessage);
      console.error('Failed to add product entry:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Ürün Girişi Güncelleme (PUT)
  const editProductEntry = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: productApiUrl, method: 'PUT', body: data });
      if (res.response.status === 200) {
        setProductEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === data.id ? res.data : entry))
        ); // Güncellenen kaydı listeye ekle
        await fetchStock(); // Stok bilgisini güncelle
        return { success: true, data: res.data }; // Güncellenen kaydı döndür
      } else {
        const errorMessage = `Ürün girişi güncellenemedi. ${res.data.message}`;
        setError(errorMessage);
        console.error('Failed to edit product entry:', res.data.message);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Ürün girişi güncellenirken bir hata oluştu.';
      setError(errorMessage);
      console.error('Failed to edit product entry:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Ürün Girişi Silme (DELETE)
  const deleteProductEntry = async (id, date) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: productApiUrl, method: 'DELETE', body: { id, date } });
      if (res.response.status === 200) {
        setProductEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id)); // Listeden sil
        await fetchStock(); // Stok bilgisini güncelle
        return { success: true }; // Başarı durumunda true döndür
      } else {
        const errorMessage = `Ürün girişi silinemedi. ${res.data.message}`;
        setError(errorMessage);
        console.error('Failed to delete product entry:', res.response);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Ürün girişi silinirken bir hata oluştu.';
      setError(errorMessage);
      console.error('Failed to delete product entry:', error.message);
      return { success: false, error: errorMessage };
    }
  };

  // Yeni Satış Ekleme (POST)
  const addProductSale = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: salesApiUrl, method: 'POST', body: data });
      if (res.response.status === 200 || res.response.status === 201) {
        setProductSales((prevSales) => [res.data, ...prevSales]); // Yeni kaydı listeye ekle
        await fetchStock(); // Stok bilgisini güncelle
        return { success: true, data: res.data }; // Eklenen kaydı döndür
      } else {
        const errorMessage = `Ürün satışı eklenemedi. ${res.data.message}`;
        setError(errorMessage);
        console.error('Failed to add product sale:', res.response);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Yeni satış eklenirken bir hata oluştu.';
      setError(errorMessage);
      console.error('Failed to add product sale:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Satış Güncelleme (PUT)
  const editProductSale = async (data) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: salesApiUrl, method: 'PUT', body: data });
      if (res.response.status === 200) {
        setProductSales((prevSales) =>
          prevSales.map((sale) => (sale.id === data.id ? res.data : sale))
        ); // Güncellenen kaydı listeye ekle
        await fetchStock(); // Stok bilgisini güncelle
        return { success: true, data: res.data }; // Güncellenen kaydı döndür
      } else {
        const errorMessage = `Ürün satışı güncellenemedi. ${res.data.message}`;
        setError(errorMessage);
        console.error('Failed to edit product sale:', res.data.message);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Satış güncellenirken bir hata oluştu.';
      setError(errorMessage);
      console.error('Failed to edit product sale:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Satış Silme (DELETE)
  const deleteProductSale = async (id, date) => {
    setError(null);
    try {
      const res = await sendApiRequest({ url: salesApiUrl, method: 'DELETE', body: { id, date } });
      if (res.response.status === 200) {
        setProductSales((prevSales) => prevSales.filter((sale) => sale.id !== id)); // Listeden sil
        await fetchStock(); // Stok bilgisini güncelle
        return { success: true }; // Başarı durumunda true döndür
      } else {
        const errorMessage = `Ürün satışı silinemedi. ${res.data.message}`;
        setError(errorMessage);
        console.error('Failed to delete product sale:', res.response);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Satış silinirken bir hata oluştu.';
      setError(errorMessage);
      console.error('Failed to delete product sale:', error);
      return { success: false, error: errorMessage };
    }
  };

  const fetchCarryoverStock = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: `${carryoverStockUrl}?date=${date}`, method: 'GET' });
      if (res.response.status === 200) {
        setCarryoverStock(res.data || []); // Gelen ürün girişlerini listeye ata
      } else {
        setError('Stoklar alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch stock:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  }, [carryoverStockUrl]);

  const fetchCarryoverDebt = useCallback(async (company_id, date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: `${carryoverDebtUrl}?date=${date}&company_id=${company_id}`, method: 'GET' });
      if (res.response.status === 200) {
        setCarryoverDebt(res.data || []); // Gelen ürün girişlerini listeye ata
      } else {
        setError('Stoklar alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch stock:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  }, [carryoverDebtUrl]);

  const fetchCarryoverReceivable = useCallback(async (client_id, date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({ url: `${carryoverReceivableUrl}?date=${date}&client_id=${client_id}`, method: 'GET' });
      if (res.response.status === 200) {
        setCarryoverReceivable(res.data || []); // Gelen ürün girişlerini listeye ata
      } else {
        setError('Stoklar alınırken bir hata oluştu.' || res.data.message);
        console.error('Failed to fetch stock:', res.response);
      }
    } catch (error) {
      setError('API çağrısı başarısız oldu.');
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  }, [carryoverReceivableUrl]);

  // Component yüklendiğinde verileri fetch et
  useEffect(() => {
    fetchCompanies();
    fetchClients();
    fetchStock();
  }, [fetchCompanies, fetchClients, fetchStock]);

  // Sağlayıcıya değerler ekleme
  return (
    <InventoryContext.Provider
      value={{
        productEntries,
        productSales,
        companies,
        clients,
        stock,
        carryoverStock,
        carryoverDebt,
        carryoverReceivable,
        products,
        loading,
        error,
        fetchProductEntries,
        fetchProductSales,
        fetchCompanies,
        fetchClients,
        fetchStock,
        fetchProducts,
        fetchCarryoverDebt,
        fetchCarryoverStock,
        fetchCarryoverReceivable,
        addProductEntry,
        addProductSale,
        editProductEntry,
        editProductSale,
        deleteProductEntry,
        deleteProductSale,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// PropTypes kontrolü
InventoryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default InventoryProvider;
