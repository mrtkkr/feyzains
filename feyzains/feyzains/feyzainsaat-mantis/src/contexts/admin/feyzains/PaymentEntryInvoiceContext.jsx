import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { sendApiRequest } from 'services/network_service'; // API çağrıları için kullanılan servis

export const PaymentEntryInvoiceContext = createContext();

const PaymentEntryInvoiceProvider = ({ children }) => {
  const [paymentEntryInvoices, setPaymentEntryInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [count, setCount] = useState(0); // toplam kayıt sayısı
  const [searchs, setSearchs] = useState([]);
  const [error, setError] = useState(null);
  // Add a flag to track whether data has been loaded
  const dataLoaded = useRef(false);
  const dataLoadedPayment = useRef(false);
  const dataLoadedInvoices = useRef(false);

  const baseUrl = 'core/';
  const paymentEntryListUrl = 'payment_entry/';
  const invoiceListUrl = 'invoice/';
  const paymentEntryDetailUrl = 'payment_entries/';
  const invoiceDetailUrl = 'invoices/';
  const checklistUrl = 'checklist/';
  const searchListUrl = 'search_page/';
  const searchDetailUrl = 'search_pages/';

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0]; // '2026-05-10' gibi
  };
  const formatDate2 = (date) => {
    if (!date) return null;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    // Zaman dilimi farkı ile uğraşmamak için UTC olarak alın:
    return `${year}-${month}-${day}`;
  };

  const fetchInvoice = useCallback(
    async ({
      type = 'invoice',
      page = 0,
      pageSize = 10,
      orderBy = 'invoice_time',
      order = 'desc',
      worksite = '',
      group = '',
      company = '',
      customer = ''
    } = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = {
          page: page + 1, // Django'da sayfalar 1-indexli
          page_size: pageSize,
          order_by: orderBy,
          order: order
        };
        if (worksite) queryParams.worksite = worksite;
        if (group) queryParams.group = group;
        if (company) queryParams.company = company;
        if (customer) queryParams.customer = customer;

        const res = await sendApiRequest({
          url: baseUrl + invoiceListUrl,
          method: 'GET',
          queryParams
        });

        if (res.response.status === 200) {
          setInvoices(res.data.results || []);
          setCount(res.data.count || 0); // toplam kayıt sayısı
          setPaymentEntryInvoices(res.data || []);
        } else {
          setError('Faturalar alınırken bir hata oluştu.');
        }
      } catch (error) {
        console.error('fetchInvoice error:', error);
        setError('API çağrısı başarısız oldu.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchPaymentEntry = useCallback(
    async ({
      type = 'payment',
      page = 0,
      pageSize = 10,
      orderBy = 'payment_time',
      order = 'desc',
      worksite = '',
      group = '',
      company = '',
      customer = ''
    }) => {
      // Skip fetching if data is already loaded and forceRefresh is false
      setLoading(true);
      setError(null);
      try {
        const queryParams = {
          type: type, // Add the type parameter to the request
          page: page + 1, // Django'da sayfalar 1-indexli
          pageSize: pageSize,
          order_by: orderBy,
          order: order
        };

        if (worksite) queryParams.worksite = worksite;
        if (group) queryParams.group = group;
        if (company) queryParams.company = company;
        if (customer) queryParams.customer = customer;

        const res = await sendApiRequest({
          url: baseUrl + paymentEntryListUrl,
          method: 'GET',
          queryParams
        });

        if (res.response.status === 200) {
          setPayments(res.data.results || []);
          setCount(res.data.count || 0); // toplam kayıt sayısı
          setPaymentEntryInvoices(res.data || []);
        } else {
          setError('Ödeme Girişi veya Faturalar alınırken bir hata oluştu.');
        }
      } catch (error) {
        console.error('fetchPaymentEntryInvoices error:', error);
        setError('API çağrısı başarısız oldu.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchChecklists = useCallback(
    async ({
      startDate = null,
      endDate = null,
      page = 0,
      pageSize = 10,
      orderBy = 'check_time',
      order = 'desc',
      company = '',
      customer = ''
    } = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = {
          page: page + 1, // Django'da sayfalar 1-indexli
          page_size: pageSize,
          order_by: orderBy,
          order: order
        };

        if (startDate) queryParams.start_date = formatDate(startDate);
        if (endDate) queryParams.end_date = formatDate(endDate);
        if (company) queryParams.company = company;
        if (customer) queryParams.customer = customer;

        const res = await sendApiRequest({
          url: baseUrl + checklistUrl,
          method: 'GET',
          queryParams
        });

        if (res.response.status === 200) {
          setChecklists(res.data.results || []);
          setCount(res.data.count || 0); // toplam kayıt sayısı
          dataLoaded.current = true;
        } else {
          setError('Çek Listesi alınırken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Check list API hatası:', error);
        setError('API çağrısı başarısız oldu.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSearchs = useCallback(
    async ({
      page = 0,
      pageSize = 10,
      order_by = 'date',
      order = 'desc',
      worksite = '',
      group = '',
      company = '',
      customer = '',
      startDate = null,
      endDate = null,
      bank = '',
      check_no = '',
      material = '',
      quantity = '',
      unit_price = '',
      price = '',
      tax = '',
      withholding = '',
      receivable = '',
      debt = ''
    }) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = {
          page: page + 1, // Django'da sayfalar 1-indexli
          page_size: pageSize,
          order_by: order_by,
          order: order
        };
        // Log the date parameters specifically for debugging
        console.log('Date parameters to be sent:', {
          startDate,
          endDate
        });

        // Sadece dolu olanları ekle
        if (startDate) queryParams.start_date = formatDate2(startDate);
        if (endDate) queryParams.end_date = formatDate2(endDate);
        if (worksite) queryParams.worksite = worksite;
        if (group) queryParams.group = group;
        if (company) queryParams.company = company;
        if (customer) queryParams.customer = customer;
        if (bank) queryParams.bank = bank;
        if (check_no) queryParams.check_no = check_no;
        if (material) queryParams.material = material;
        if (quantity) queryParams.quantity = quantity;
        if (unit_price) queryParams.unit_price = unit_price;
        if (price) queryParams.price = price;
        if (tax) queryParams.tax = tax;
        if (withholding) queryParams.withholding = withholding;
        if (receivable) queryParams.receivable = receivable;
        if (debt) queryParams.debt = debt;

        // Müşteriler
        const res = await sendApiRequest({ url: baseUrl + searchListUrl, method: 'GET', queryParams });
        // Başarıyla gelen yanıtı logla
        console.log('API Response:', res);
        if (res.response.status === 200) {
          setSearchs(res.data.results || []);
          setCount(res.data.count || 0); // toplam kayıt sayısı
          setPaymentEntryInvoices(res.data || []);
        } else {
          setError('Arama sayfası alınırken bir hata oluştu.');
          console.error('Failed to fetch supplier checkLists:', res.response);
        }
      } catch (error) {
        setError('API çağrısı başarısız oldu.');
        console.error('Failed to fetch checkList:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createInvoice = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + invoiceListUrl,
        method: 'POST',
        body: data
      });
      if (res.response.status === 201) {
        setInvoices((prev) => [res.data, ...prev]);
        return { success: true, data: res.data };
      } else {
        setError('Fatura oluşturulamadı.');
        return { success: false, error: 'Fatura oluşturulamadı.' };
      }
    } catch (err) {
      console.error('createInvoice error:', err);
      setError('Fatura oluşturulurken hata oluştu.');
      return { success: false, error: 'Fatura oluşturulurken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const createPaymentEntry = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: baseUrl + paymentEntryListUrl,
        method: 'POST',
        body: data
      });
      if (res.response.status === 201) {
        console.log('Odeme oluşturuldu:', res.data);
        setPayments((prev) => [res.data, ...prev]);
        // setPaymentEntryInvoices(res.data || []);
        return { success: true, data: res.data };
      } else {
        setError('Ödeme oluşturulamadı.');
        return { success: false, error: 'Ödeme veya Fatura oluşturulamadı.' };
      }
    } catch (err) {
      console.error('createPaymentEntry error:', err);
      setError('Ödeme oluşturulurken hata oluştu.');
      return { success: false, error: 'Ödeme oluşturulurken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${invoiceDetailUrl}${id}/`,
        method: 'PUT',
        body: data
      });
      if (res.response.status === 200) {
        // Update the payment in the local state to avoid refetching
        setInvoices((prev) => prev.map((invoices) => (invoices.id === id ? res.data : invoices)));
        return { success: true, data: res.data };
      } else {
        setError('Fatura güncellenemedi.');
        return { success: false, error: 'Fatura güncellenemedi.' };
      }
    } catch (err) {
      console.error('updatePaymentEntryInvoice error:', err);
      setError('Fatura güncellenirken hata oluştu.');
      return { success: false, error: 'Fatura güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentEntry = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentEntryDetailUrl}${id}/`,
        method: 'PUT',
        body: data
      });
      if (res.response.status === 200) {
        // Update the payment in the local state to avoid refetching
        setPayments((prev) => prev.map((payments) => (payments.id === id ? res.data : payments)));
        return { success: true, data: res.data };
      } else {
        setError('Ödeme güncellenemedi.');
        return { success: false, error: 'Ödeme güncellenemedi.' };
      }
    } catch (err) {
      console.error('updatePaymentEntryInvoice error:', err);
      setError('Ödeme güncellenirken hata oluştu.');
      return { success: false, error: 'Ödeme güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const updateSearch = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${searchDetailUrl}${id}/`,
        method: 'PUT',
        body: data
      });
      if (res.response.status === 200) {
        // Update the payment in the local state to avoid refetching
        setSearchs((prev) => prev.map((searchs) => (searchs.id === id ? res.data : searchs)));
        return { success: true, data: res.data };
      } else {
        setError('Arama güncellenemedi.');
        return { success: false, error: 'Fatura güncellenemedi.' };
      }
    } catch (err) {
      console.error('updateSearch error:', err);
      setError('Arama güncellenirken hata oluştu.');
      return { success: false, error: 'Arama güncellenirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${invoiceDetailUrl}${id}/`,
        method: 'DELETE'
      });

      // Eğer res.response varsa ve status 204 ise işlem başarılı
      if (res?.response?.status === 204) {
        setInvoices((prev) => prev.filter((invoices) => invoices.id !== id));
        return { success: true };
      } else {
        const errorMessage = res?.response?.data?.detail || 'Ödeme veya Fatura silinemedi.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('deletePaymentEntryInvoice error:', err);
      setError('Ödeme veya Fatura silinirken hata oluştu.');
      return { success: false, error: 'Ödeme veya Fatura silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentEntry = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentEntryDetailUrl}${id}/`,
        method: 'DELETE'
      });

      // Eğer res.response varsa ve status 204 ise işlem başarılı
      if (res?.response?.status === 204) {
        setPayments((prev) => prev.filter((invoices) => invoices.id !== id));
        return { success: true };
      } else {
        const errorMessage = res?.response?.data?.detail || 'Ödeme silinemedi silinemedi.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('deletePaymentEntry error:', err);
      setError('Ödeme silinirken hata oluştu.');
      return { success: false, error: 'Ödeme silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteSearch = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${searchDetailUrl}${id}/`,
        method: 'DELETE'
      });

      // Eğer res.response varsa ve status 204 ise işlem başarılı
      if (res?.response?.status === 204) {
        setSearchs((prev) => prev.filter((searchs) => searchs.id !== id));
        return { success: true };
      } else {
        const errorMessage = res?.response?.data?.detail || 'Arama silinemedi.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('deleteSearch error:', err);
      setError('Arama silinirken hata oluştu.');
      return { success: false, error: 'Arama silinirken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceById = async (id) => {
    // First check if we have the payment in local state
    const localPaymentEntryInvoicet = invoices.find((paymentEntryInvoices) => paymentEntryInvoices.id === id);
    if (localPaymentEntryInvoicet) {
      return { success: true, data: localPaymentEntryInvoicet };
    }

    // If not found in local state, fetch from API
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${invoiceDetailUrl}${id}/`,
        method: 'GET'
      });
      if (res.response.status === 200) {
        return { success: true, data: res.data };
      } else {
        setError('Fatura bulunamadı.');
        return { success: false, error: 'Fatura bulunamadı.' };
      }
    } catch (err) {
      console.error('getInvoiceById error:', err);
      setError('Fatura bilgileri alınırken hata oluştu.');
      return { success: false, error: 'Fatura bilgileri alınırken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const getPaymentEntryById = async (id) => {
    // First check if we have the payment in local state

    console.log('getPaymentEntryById id:', id);
    const localPaymentEntryInvoicet = payments.find((paymentEntryInvoices) => paymentEntryInvoices.id === id);
    if (localPaymentEntryInvoicet) {
      return { success: true, data: localPaymentEntryInvoicet };
    }

    // If not found in local state, fetch from API
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${paymentEntryDetailUrl}${id}/`,
        method: 'GET'
      });
      if (res.response.status === 200) {
        return { success: true, data: res.data };
      } else {
        setError('Ödeme bulunamadı.');
        return { success: false, error: 'Ödeme bulunamadı.' };
      }
    } catch (err) {
      console.error('getPaymentEntryById error:', err);
      setError('Ödeme bilgileri alınırken hata oluştu.');
      return { success: false, error: 'Ödeme bilgileri alınırken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  const getSearchById = async (id) => {
    // First check if we have the payment in local state
    const localPaymentEntryInvoicet = searchs.find((paymentEntryInvoices) => paymentEntryInvoices.id === id);
    if (localPaymentEntryInvoicet) {
      return { success: true, data: localPaymentEntryInvoicet };
    }

    // If not found in local state, fetch from API
    setLoading(true);
    setError(null);
    try {
      const res = await sendApiRequest({
        url: `${baseUrl}${searchDetailUrl}${id}/`,
        method: 'GET'
      });

      if (res.response.status === 200) {
        return { success: true, data: res.data };
      } else {
        setError('Arama bulunamadı.');
        return { success: false, error: 'Arama bulunamadı.' };
      }
    } catch (err) {
      console.error('getSearchById error:', err);
      setError('Arama bilgileri alınırken hata oluştu.');
      return { success: false, error: 'Arama bilgileri alınırken hata oluştu.' };
    } finally {
      setLoading(false);
    }
  };

  //   const fetchOrders = async ({
  //     page = 1,
  //     pageSize = 10,
  //     search = "",
  //     seller = "",
  //     customer = "",
  //     paymentType = "",
  //     startDate = "",
  //     endDate = "",
  //     hourRange = "",
  //   } = {}) => { // defaults added here to prevent undefined
  //     setLoading(true);
  //     setError(null);

  //     const params = new URLSearchParams();
  //     params.append("page", page || 1);  // page defaulted to 1 if undefined
  //     params.append("page_size", pageSize || 10);  // page_size defaulted to 10 if undefined
  //     if (search) params.append("search", search);
  //     if (seller) params.append("seller", seller);
  //     if (customer) params.append("customer", customer);
  //     if (paymentType) params.append("payment_type", paymentType);
  //     if (startDate && endDate) {
  //       params.append("start_date", new Date(startDate).toISOString());
  //       params.append("end_date", new Date(endDate).toISOString());
  //     }
  //     if (hourRange) params.append("hour_range", hourRange);

  //     try {
  //       const res = await sendApiRequest({
  //         url: core/orders/?${params.toString()},
  //         method: "GET",
  //       });

  //       if (res.response.status === 200) {
  //         setOrders(res.data.results || []);
  //         setOrderCount(res.data.count || 0);
  //       } else {
  //         setError("Siparişler alınırken bir hata oluştu.");
  //       }
  //     } catch (error) {
  //       setError("API çağrısı başarısız oldu.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <PaymentEntryInvoiceContext.Provider
      value={{
        paymentEntryInvoices,
        payments,
        invoices,
        checklists,
        searchs,
        loading,
        error,
        count,
        fetchInvoice,
        fetchPaymentEntry,
        fetchChecklists,
        fetchSearchs,
        createInvoice,
        createPaymentEntry,
        updateInvoice,
        updatePaymentEntry,
        updateSearch,
        deleteSearch,
        deleteInvoice,
        deletePaymentEntry,
        getInvoiceById,
        getPaymentEntryById,
        getSearchById
      }}
    >
      {children}
    </PaymentEntryInvoiceContext.Provider>
  );
};

PaymentEntryInvoiceProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default PaymentEntryInvoiceProvider;
