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

const CreateInvoiceEntry = ({ open, onClose }) => {
  const { createInvoice, loading, fetchInvoice } = useContext(PaymentEntryInvoiceContext);
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
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit_price, setUnit_price] = useState('');
  const [price, setPrice] = useState('');
  const [tax, setTax] = useState('');
  const [withholding, setWithholding] = useState('');
  const [receivable, setReceivable] = useState('');

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
    if (!material) newErrors.material = 'Malzeme adı gereklidir';
    if (!quantity) newErrors.quantity = 'Miktar gereklidir';
    else if (isNaN(quantity) || parseFloat(quantity) <= 0) newErrors.quantity = 'Geçerli bir miktar giriniz';
    if (!unit_price) newErrors.unit_price = 'Birim fiyat gereklidir';
    else if (isNaN(unit_price) || parseFloat(unit_price) <= 0) newErrors.unit_price = 'Geçerli bir birim fiyat giriniz';
    if (!price) newErrors.price = 'Toplam fiyat gereklidir';
    else if (isNaN(price) || parseFloat(price) <= 0) newErrors.price = 'Geçerli bir toplam fiyat giriniz';
    if (!tax) newErrors.tax = 'KDV oranı gereklidir';
    else if (isNaN(tax) || parseFloat(tax) < 0) newErrors.tax = 'Geçerli bir KDV oranı giriniz';
    if (!withholding) newErrors.withholding = 'Stopaj oranı gereklidir';
    else if (isNaN(withholding) || parseFloat(withholding) < 0) newErrors.withholding = 'Geçerli bir stopaj oranı giriniz';
    if (!receivable) newErrors.receivable = 'Alacak tutarı gereklidir';
    else if (isNaN(receivable) || parseFloat(receivable) < 0) newErrors.receivable = 'Geçerli bir alacak tutarı giriniz';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const invoiceData = {
        date: date.toISOString(),
        worksite: selectedWorksite,
        group: selectedGroup,
        company: selectedCompany,
        customer: selectedCustomer,
        material: material,
        quantity: parseFloat(quantity),
        unit_price: parseFloat(unit_price),
        price: parseFloat(price),
        tax: parseFloat(tax),
        withholding: parseFloat(withholding),
        receivable: parseFloat(receivable),
        type: 'invoice'
      };

      const result = await createInvoice(invoiceData);

      if (result.success) {
        toast.success('Fatura kaydı başarıyla oluşturuldu');
        fetchInvoice({
          type: 'invoice',
          page: 0,
          pageSize: 10,
          orderBy: 'date',
          order: 'desc'
        });
        resetForm();
        onClose();
      } else {
        toast.error(result.error || 'Fatura kaydı oluşturulamadı');
      }
    } catch (error) {
      console.error('Fatura kaydı oluşturulurken hata:', error);
      toast.error('Fatura kaydı oluşturulurken bir hata oluştu');
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
    setMaterial('');
    setQuantity('');
    setUnit_price('');
    setPrice('');
    setTax('');
    setWithholding('');
    setReceivable('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Yeni Fatura Kaydı Oluştur</DialogTitle>
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
              label="Malzeme Adı"
              fullWidth
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              error={!!errors.material}
              helperText={errors.material}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Adet"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Birim Fiyat"
              type="number"
              fullWidth
              value={unit_price}
              onChange={(e) => setUnit_price(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              error={!!errors.unit_price}
              helperText={errors.unit_price}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Tutar"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              error={!!errors.price}
              helperText={errors.price}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="KDV Oranı"
              type="number"
              fullWidth
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              error={!!errors.tax}
              helperText={errors.tax}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Tevkifat Oranı"
              type="number"
              fullWidth
              value={withholding}
              onChange={(e) => setWithholding(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              error={!!errors.withholding}
              helperText={errors.withholding}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Alacak Tutarı"
              type="number"
              fullWidth
              value={receivable}
              onChange={(e) => setReceivable(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              error={!!errors.receivable}
              helperText={errors.receivable}
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

export default CreateInvoiceEntry;
