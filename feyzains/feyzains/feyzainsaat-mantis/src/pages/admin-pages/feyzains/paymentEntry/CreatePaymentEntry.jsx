import React, { useState, useContext, useEffect } from 'react';
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
  FormHelperText,
  Autocomplete
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { PaymentEntryInvoiceContext } from '../../../../contexts/admin/feyzains/PaymentEntryInvoiceContext';
import { sendApiRequest } from '../../../../services/network_service';

const CreatePaymentEntry = ({ open, onClose }) => {
  const { createPaymentEntryInvoice, loading } = useContext(PaymentEntryInvoiceContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form alanları için state'ler
  const [date, setDate] = useState(new Date());
  const [worksites, setWorksites] = useState([]);
  const [groups, setGroups] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedWorksite, setSelectedWorksite] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [debt, setDebt] = useState('');
  const [bank, setBank] = useState('');
  const [check_no, setCheck_no] = useState('');
  const [check_time, setCheck_time] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Şantiyeleri, grupları, Şirketleri ve müşterileri yükle
  useEffect(() => {
    if (open) {
      loadWorksites();
      loadGroups();
      loadCompanies();
      loadCustomers();
    }
  }, [open]);

  const loadWorksites = async () => {
    try {
      const res = await sendApiRequest({
        url: 'core/worksite/',
        method: 'GET'
      });
      if (res.response.status === 200) {
        setWorksites(res.data || []);
      }
    } catch (error) {
      console.error('Şantiyeler yüklenirken hata oluştu:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await sendApiRequest({
        url: 'core/group/',
        method: 'GET'
      });
      if (res.response.status === 200) {
        setGroups(res.data || []);
      }
    } catch (error) {
      console.error('Gruplar yüklenirken hata oluştu:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await sendApiRequest({
        url: 'core/company/',
        method: 'GET'
      });
      if (res.response.status === 200) {
        setCompanies(res.data || []);
      }
    } catch (error) {
      console.error('Şirketler yüklenirken hata oluştu:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await sendApiRequest({
        url: 'core/customer/',
        method: 'GET'
      });
      if (res.response.status === 200) {
        setCustomers(res.data || []);
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata oluştu:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!date) newErrors.date = 'Tarih gereklidir';
    if (!selectedWorksite) newErrors.worksite = 'Şantiye seçimi gereklidir';
    if (!selectedGroup) newErrors.group = 'Grup seçimi gereklidir';
    if (!selectedCompany) newErrors.company = 'Şirket seçimi gereklidir';
    if (!selectedCustomer) newErrors.customer = 'Müşteri seçimi gereklidir';
    if (!bank) newErrors.bank = 'Banka bilgisi gereklidir';
    if (!check_no) newErrors.check_no = 'Check Numarası bilgisi gereklidir';
    if (!check_time) newErrors.check_time = 'Check Vade bilgisi gereklidir';

    if (!debt) newErrors.debt = 'Borç tutarı gereklidir';
    else if (isNaN(debt) || parseFloat(debt) <= 0) newErrors.debt = 'Geçerli bir borç tutarı giriniz';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const paymentData = {
        date: date.toISOString(),
        worksite: selectedWorksite,
        group: selectedGroup,
        company: selectedCompany,
        customer: selectedCustomer,
        check_no: check_no,
        check_time: check_time,
        bank: bank,
        debt: parseFloat(debt)
      };

      const result = await createPaymentEntryInvoice(paymentData);

      if (result.success) {
        toast.success('Ödeme kaydı başarıyla oluşturuldu');
        resetForm();
        onClose();
      } else {
        toast.error(result.error || 'Ödeme kaydı oluşturulamadı');
      }
    } catch (error) {
      console.error('Ödeme kaydı oluşturulurken hata:', error);
      toast.error('Ödeme kaydı oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDate(new Date());
    setSelectedWorksite('');
    setSelectedGroup('');
    setSelectedCompany('');
    setSelectedCustomer('');
    setBank('');
    setCheck_no('');
    setCheck_time('');
    setDebt('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Yeni Ödeme Kaydı Oluştur</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <DatePicker
                label="Tarih"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth error={!!errors.date} helperText={errors.date} />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.worksite}>
              <InputLabel>Şantiye</InputLabel>
              <Select value={selectedWorksite} onChange={(e) => setSelectedWorksite(e.target.value)} label="Şantiye">
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
              <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} label="Grup">
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
              <Select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} label="Şirket">
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
              <Select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} label="Müşteri">
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
              onChange={(e) => setBank(e.target.value)}
              error={!!errors.bank}
              helperText={errors.bank}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Çek Numarası"
              fullWidth
              value={check_no}
              onChange={(e) => setCheck_no(e.target.value)}
              error={!!errors.check_no}
              helperText={errors.check_no}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Çek Vade"
              type="date"
              fullWidth
              value={check_time}
              onChange={(e) => setCheck_time(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors.check_time}
              helperText={errors.check_time}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Borç Tutarı"
              type="number"
              fullWidth
              value={debt}
              onChange={(e) => setDebt(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              error={!!errors.debt}
              helperText={errors.debt}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting || loading}>
          İptal
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isSubmitting || loading}>
          {isSubmitting || loading ? <CircularProgress size={24} /> : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePaymentEntry;
