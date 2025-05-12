import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { PaymentEntryInvoiceContext } from '../../../../contexts/admin/feyzains/PaymentEntryInvoiceContext';
import { sendApiRequest } from '../../../../services/network_service';

const EditPaymentEntry = ({ open, onClose, paymentId }) => {
  // Component referansları
  const isMounted = useRef(true);
  const dataLoaded = useRef(false);

  // Context
  const { updatePaymentEntry, getPaymentEntryById } = useContext(PaymentEntryInvoiceContext);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [date, setDate] = useState(null);
  const [worksiteId, setWorksiteId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [bank, setBank] = useState('');
  const [checkNo, setCheckNo] = useState('');
  const [checkTime, setCheckTime] = useState('');
  const [debt, setDebt] = useState('');

  // Master data
  const [worksites, setWorksites] = useState([]);
  const [groups, setGroups] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Dialog açıldığında veri yüklemeyi başlat
  useEffect(() => {
    // Component mount olduğunda referansı ayarla
    isMounted.current = true;

    if (open && paymentId && !dataLoaded.current) {
      fetchAllData();
    }

    // Component unmount olduğunda temizlik yap
    return () => {
      isMounted.current = false;

      // Dialog kapandığında veri yükleme durumunu sıfırla
      if (!open) {
        dataLoaded.current = false;
        resetForm();
      }
    };
  }, [open, paymentId]);

  // Formu sıfırla
  const resetForm = () => {
    setDate(null);
    setWorksiteId('');
    setGroupId('');
    setCompanyId('');
    setCustomerId('');
    setBank('');
    setCheckNo('');
    setCheckTime('');
    setDebt('');
    setErrors({});
  };

  // Tüm verileri yükle
  const fetchAllData = async () => {
    if (!isMounted.current) return;

    setIsLoading(true);

    try {
      // Önce master verileri yükle
      await Promise.all([fetchWorksites(), fetchGroups(), fetchCompanies(), fetchCustomers()]);

      // Sonra ödeme detaylarını yükle
      if (isMounted.current && paymentId) {
        await fetchPaymentDetails();
      }

      dataLoaded.current = true;
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      if (isMounted.current) {
        toast.error('Veriler yüklenirken bir hata oluştu');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Şantiyeleri yükle
  const fetchWorksites = async () => {
    try {
      const response = await sendApiRequest({
        url: 'core/worksite/',
        method: 'GET'
      });

      if (response && response.response && response.response.status === 200 && isMounted.current) {
        setWorksites(response.data || []);
      }
    } catch (error) {
      console.error('Şantiyeler yüklenirken hata:', error);
    }
  };

  // Grupları yükle
  const fetchGroups = async () => {
    try {
      const response = await sendApiRequest({
        url: 'core/group/',
        method: 'GET'
      });

      if (response && response.response && response.response.status === 200 && isMounted.current) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error('Gruplar yüklenirken hata:', error);
    }
  };

  // Şirketleri yükle
  const fetchCompanies = async () => {
    try {
      const response = await sendApiRequest({
        url: 'core/company/',
        method: 'GET'
      });

      if (response && response.response && response.response.status === 200 && isMounted.current) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      console.error('Şirketler yüklenirken hata:', error);
    }
  };

  // Müşterileri yükle
  const fetchCustomers = async () => {
    try {
      const response = await sendApiRequest({
        url: 'core/customer/',
        method: 'GET'
      });

      if (response && response.response && response.response.status === 200 && isMounted.current) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    }
  };

  // Ödeme detaylarını yükle
  const fetchPaymentDetails = async () => {
    try {
      const result = await getPaymentEntryById(paymentId);

      if (result && result.success && result.data && isMounted.current) {
        const payment = result.data;

        // Tarihi ayarla
        const paymentDate = payment.date ? new Date(payment.date) : new Date();
        setDate(paymentDate);

        // İlişkili alanları ayarla
        setWorksiteId(payment.worksite && payment.worksite.id ? payment.worksite.id : '');
        setGroupId(payment.group && payment.group.id ? payment.group.id : '');
        setCompanyId(payment.company && payment.company.id ? payment.company.id : '');
        setCustomerId(payment.customer && payment.customer.id ? payment.customer.id : '');

        // Diğer alanları ayarla
        setBank(payment.bank || '');
        setCheckNo(payment.check_no || '');

        // Check time için format düzeltmesi
        if (payment.check_time) {
          try {
            const checkDate = new Date(payment.check_time);
            const formattedDate = checkDate.toISOString().split('T')[0];
            setCheckTime(formattedDate);
          } catch (e) {
            console.error('Check time formatı dönüştürülürken hata:', e);
            setCheckTime('');
          }
        } else {
          setCheckTime('');
        }

        // Borç tutarını ayarla
        setDebt(payment.debt ? payment.debt.toString() : '');
      } else if (isMounted.current) {
        toast.error('Ödeme kaydı bulunamadı veya yüklenemedi');
        handleCancel();
      }
    } catch (error) {
      console.error('Ödeme detayları yüklenirken hata:', error);
      if (isMounted.current) {
        toast.error('Ödeme detayları yüklenirken bir hata oluştu');
        handleCancel();
      }
    }
  };

  // Form doğrulaması
  const validateForm = () => {
    const newErrors = {};

    if (!date) newErrors.date = 'Tarih gereklidir';
    if (!worksiteId) newErrors.worksite = 'Şantiye seçimi gereklidir';
    if (!groupId) newErrors.group = 'Grup seçimi gereklidir';
    if (!companyId) newErrors.company = 'Şirket seçimi gereklidir';
    if (!customerId) newErrors.customer = 'Müşteri seçimi gereklidir';
    if (!bank) newErrors.bank = 'Banka bilgisi gereklidir';
    if (!checkNo) newErrors.checkNo = 'Çek No gereklidir';
    if (!checkTime) newErrors.checkTime = 'Çek Vade Tarihi gereklidir';
    if (!debt) newErrors.debt = 'Borç tutarı gereklidir';
    else if (isNaN(debt) || parseFloat(debt) <= 0) newErrors.debt = 'Geçerli bir borç tutarı giriniz';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Ödeme verilerini hazırla
      const paymentData = {
        date: date instanceof Date ? date.toISOString() : new Date().toISOString(),
        worksite: worksiteId,
        group: groupId,
        company: companyId,
        customer: customerId,
        bank: bank,
        check_no: checkNo,
        check_time: checkTime,
        debt: parseFloat(debt)
      };

      // Ödeme kaydını güncelle
      const result = await updatePaymentEntry(paymentId, paymentData);

      if (result && result.success) {
        toast.success('Ödeme kaydı başarıyla güncellendi');

        // Parent componente güncelleme yapıldığını bildir
        onClose(true);
      } else {
        toast.error(result?.error || 'Ödeme kaydı güncellenemedi');
      }
    } catch (error) {
      console.error('Ödeme kaydı güncellenirken hata:', error);
      toast.error('Ödeme kaydı güncellenirken bir hata oluştu');
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  // İptal işlemi
  const handleCancel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (typeof onClose === 'function') {
      onClose(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>Ödeme Kaydını Düzenle</DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DatePicker
                  label="Tarih"
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: undefined }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.worksite}>
                <InputLabel>Şantiye</InputLabel>
                <Select
                  value={worksiteId}
                  onChange={(e) => {
                    setWorksiteId(e.target.value);
                    if (errors.worksite) {
                      setErrors((prev) => ({ ...prev, worksite: undefined }));
                    }
                  }}
                  label="Şantiye"
                >
                  {worksites.map((worksite) => (
                    <MenuItem key={worksite.id} value={worksite.id}>
                      {worksite.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.worksite && <FormHelperText>{errors.worksite}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.group}>
                <InputLabel>Grup</InputLabel>
                <Select
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value);
                    if (errors.group) {
                      setErrors((prev) => ({ ...prev, group: undefined }));
                    }
                  }}
                  label="Grup"
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.group && <FormHelperText>{errors.group}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.company}>
                <InputLabel>Şirket</InputLabel>
                <Select
                  value={companyId}
                  onChange={(e) => {
                    setCompanyId(e.target.value);
                    if (errors.company) {
                      setErrors((prev) => ({ ...prev, company: undefined }));
                    }
                  }}
                  label="Şirket"
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.company && <FormHelperText>{errors.company}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.customer}>
                <InputLabel>Müşteri</InputLabel>
                <Select
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    if (errors.customer) {
                      setErrors((prev) => ({ ...prev, customer: undefined }));
                    }
                  }}
                  label="Müşteri"
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.customer && <FormHelperText>{errors.customer}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Banka"
                fullWidth
                value={bank}
                onChange={(e) => {
                  setBank(e.target.value);
                  if (errors.bank) {
                    setErrors((prev) => ({ ...prev, bank: undefined }));
                  }
                }}
                error={!!errors.bank}
                helperText={errors.bank}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Çek No"
                fullWidth
                value={checkNo}
                onChange={(e) => {
                  setCheckNo(e.target.value);
                  if (errors.checkNo) {
                    setErrors((prev) => ({ ...prev, checkNo: undefined }));
                  }
                }}
                error={!!errors.checkNo}
                helperText={errors.checkNo}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Çek Vade"
                type="date"
                fullWidth
                value={checkTime}
                onChange={(e) => {
                  setCheckTime(e.target.value);
                  if (errors.checkTime) {
                    setErrors((prev) => ({ ...prev, checkTime: undefined }));
                  }
                }}
                error={!!errors.checkTime}
                helperText={errors.checkTime}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Borç Tutarı"
                type="number"
                fullWidth
                value={debt}
                onChange={(e) => {
                  setDebt(e.target.value);
                  if (errors.debt) {
                    setErrors((prev) => ({ ...prev, debt: undefined }));
                  }
                }}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                error={!!errors.debt}
                helperText={errors.debt}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} type="button" disabled={isSubmitting || isLoading}>
          İptal
        </Button>
        <Button type="submit" color="primary" variant="contained" disabled={isSubmitting || isLoading}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPaymentEntry;
