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
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { PaymentEntryInvoiceContext } from '../../../../contexts/admin/feyzains/PaymentEntryInvoiceContext';
import { sendApiRequest } from '../../../../services/network_service';

const EditSearch = ({ open, onClose, searchId }) => {
  const { updateSearch, getSearchById, loading } = useContext(PaymentEntryInvoiceContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  const [bank, setBank] = useState('');
  const [check_no, setCheck_no] = useState('');
  const [check_time, setCheck_time] = useState('');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);    // eski unit_price
  const [price, setPrice] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [withholdingRate, setWithholdingRate] = useState(0);
  const [withholdingAmount, setWithholdingAmount] = useState(0);
  const [debt, setDebt] = useState('');

   // en başa, import’ların altına:
 const KDV_RATES = [0, 1, 10, 18, 20];
 const WITHHOLDING_RATES = Array.from({ length: 10 }, (_, i) => ({
   value: i / 10,
   label: i === 0 ? '0' : `${i}/10`
 }));

 useEffect(() => {
   const qty = parseFloat(quantity) || 0;
   const unit = parseFloat(unitPrice) || 0;
   const base = qty * unit;
   setPrice(base);
   setTaxAmount((base * taxRate) / 100);
   setWithholdingAmount(taxAmount * withholdingRate);
 }, [quantity, unitPrice, taxRate, withholdingRate]);

  const formatDateToInput = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2); // Ay 0-indexli
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };
  // Validation errors
  const [errors, setErrors] = useState({});

  // Şantiyeleri, grupları, şirketleri ve müşterileri yükle
  useEffect(() => {
    if (open && searchId) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    console.log('loadData');
    setIsLoading(true);
    try {
      // // Master verileri yükle
      await Promise.all([loadWorksites(), loadGroups(), loadCompanies(), loadCustomers()]);
      // // Ödeme detaylarını yükle
      await loadPaymentDetails();
    } catch (error) {
      console.error('Veriler yüklenirken hata oluştu:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentDetails = async () => {
    try {
      const result = await getSearchById(searchId);

      if (result.success) {
        const bill = result.data;
        setDate(new Date(bill.date));
        setSelectedWorksite(bill.worksite.id);
        setSelectedGroup(bill.group.id);
        setSelectedCompany(bill.company.id);
        setSelectedCustomer(bill.customer.id);
        setBank(bill.bank);
        setCheck_no(bill.check_no);
        setCheck_time(bill.check_time);
        setMaterial(bill.material);
        setQuantity(bill.quantity);
        setUnitPrice(bill.unit_price);
        setPrice(bill.price);
        setTaxRate(parseFloat(bill.tax));
        setTaxAmount(bill.tax_amount);
        setWithholdingRate(parseFloat(bill.withholding));
        setWithholdingAmount(bill.withholding_amount);
        setDebt(bill.debt);
        console.log('searchDatabill', bill);
      } else {
        toast.error('Arama kaydı bulunamadı');
        onClose();
      }
    } catch (error) {
      console.error('Arama kaydı yüklenirken hata:', error);
      toast.error('Arama kaydı yüklenirken bir hata oluştu');
      onClose();
    }
  };

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const searchData = {
        date: date.toISOString(),
        worksite: selectedWorksite,
        group: selectedGroup,
        company: selectedCompany,
        customer: selectedCustomer,
        bank: bank,
        check_no: check_no,
        check_time: check_time,
        material: material,
        quantity: parseFloat(quantity),
        unit_price: parseFloat(unitPrice),
        price: parseFloat(price),
        tax: taxRate,
        tax_amount: taxAmount.toFixed(2),
        withholding: withholdingRate,
        withholding_amount: withholdingAmount.toFixed(2),
        receivable: (price + taxAmount - withholdingAmount).toFixed(2),
        debt: parseFloat(debt)
      };
      console.log('searchData', searchData);
      const result = await updateSearch(searchId, searchData);

      if (result.success) {
        toast.success('Arama kaydı başarıyla güncellendi');
        onClose();
      } else {
        toast.error(result.error || 'Arama kaydı güncellenemedi');
      }
    } catch (error) {
      console.error('Arama kaydı güncellenirken hata:', error);
      toast.error('Arama kaydı güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Arama Kaydını Düzenle</DialogTitle>
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
                value={bank != null ? bank : ''}
                onChange={(e) => setBank(e.target.value)}
                error={!!errors.bank}
                helperText={errors.bank}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Çek Numarası"
                fullWidth
                value={check_no != null ? check_no : ''}
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
                value={check_time ? formatDateToInput(check_time) : ''}
                onChange={(e) => {
                  const value = e.target.value || null;
                  setCheck_time(value);

                  if (errors.check_time) {
                    setErrors((prev) => ({ ...prev, check_time: undefined }));
                  }
                }}
                error={!!errors.check_time}
                helperText={errors.check_time}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Malzeme Adı"
                fullWidth
                value={material != null ? material : ''}
                onChange={(e) => setMaterial(e.target.value)}
                error={!!errors.material}
                helperText={errors.material}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Adet"
                fullWidth
                value={quantity != null ? quantity : ''}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Birim Fiyatı"
                fullWidth
                value={unitPrice != null ? unitPrice : ''}
                onChange={(e) => setUnitPrice(e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Tutar" fullWidth value={parseFloat(price).toFixed(2)} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>KDV (%)</InputLabel>
                <Select value={taxRate} onChange={(e) => setTaxRate(e.target.value)} label="KDV (%)">
                  {KDV_RATES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="KDV Tutarı" fullWidth value={parseFloat(taxAmount).toFixed(2)} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tevkifat</InputLabel>
                <Select value={withholdingRate} onChange={(e) => setWithholdingRate(e.target.value)} label="Tevkifat">
                  {WITHHOLDING_RATES.map((o) => (
                    <MenuItem key={o.label} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tevkifat Tutarı"
                fullWidth
                value={parseFloat(withholdingAmount).toFixed(2)}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Alacak Tutarı"
                fullWidth
                value={parseFloat(price + taxAmount - withholdingAmount).toFixed(2)}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Borç Tutarı"
                type="number"
                fullWidth
                value={debt != null ? debt : ''}
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
        <Button onClick={onClose} disabled={isSubmitting || loading || isLoading}>
          İptal
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isSubmitting || loading || isLoading}>
          {isSubmitting || loading ? <CircularProgress size={24} /> : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSearch;
