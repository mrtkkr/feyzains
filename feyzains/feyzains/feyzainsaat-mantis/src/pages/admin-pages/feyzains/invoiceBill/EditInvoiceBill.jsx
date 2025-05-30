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

const EditInvoiceEntry = ({ open, onClose, invoiceId }) => {
  const { updateInvoice, getInvoiceById, loading } = useContext(PaymentEntryInvoiceContext);
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
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit_price, setUnit_price] = useState(0);
  const [price, setPrice] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [withholdingRate, setWithholdingRate] = useState(0);
  const [withholdingAmount, setWithholdingAmount] = useState(0);

  const KDV_RATES = [0, 1, 10, 18, 20];
  const WITHHOLDING_RATES = Array.from({ length: 10 }, (_, i) => ({
    value: i / 10,
    label: i === 0 ? '0' : `${i}/10`
  }));

  // Validation errors
  const [errors, setErrors] = useState({});

  // Şantiyeleri, grupları, şirketleri ve müşterileri yükle
  useEffect(() => {
    if (open && invoiceId) {
      loadData();
    }
  }, [open, invoiceId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Master verileri yükle
      await Promise.all([loadWorksites(), loadGroups(), loadCompanies(), loadCustomers()]);

      // Ödeme detaylarını yükle
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
      const result = await getInvoiceById(invoiceId);
      if (result.success) {
        const bill = result.data;
        setDate(new Date(bill.date));
        setSelectedWorksite(bill.worksite.id);
        setSelectedGroup(bill.group.id);
        setSelectedCompany(bill.company.id);
        setSelectedCustomer(bill.customer.id);
        setMaterial(bill.material);
        setQuantity(bill.quantity);
        setUnit_price(bill.unit_price);
        setInvoiceNo(bill.invoice_no);
        setPrice(bill.price);
        setTaxRate(parseFloat(bill.tax));
        setTaxAmount(bill.tax_amount);
        setWithholdingRate(parseFloat(bill.withholding));
        setWithholdingAmount(bill.withholding_amount);
      } else {
        toast.error('Fatura kaydı bulunamadı');
        onClose();
      }
    } catch (error) {
      console.error('Fatura kaydı yüklenirken hata:', error);
      toast.error('Fatura kaydı yüklenirken bir hata oluştu');
      onClose();
    }
  };

  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const unit = parseFloat(unit_price) || 0;
    const base = qty * unit;
    setPrice(base);
    setTaxAmount((base * taxRate) / 100);
    setWithholdingAmount(taxAmount * withholdingRate);
  }, [quantity, unit_price, taxRate, withholdingRate]);

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

    if (!invoiceNo) newErrors.invoiceNo = 'Fatura numarası gereklidir';
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
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const invoiceData = {
        invoice_no: invoiceNo,
        date: date.toISOString(),
        worksite: selectedWorksite,
        group: selectedGroup,
        company: selectedCompany,
        customer: selectedCustomer,
        material: material,
        quantity: parseFloat(quantity),
        unit_price: parseFloat(unit_price),
        price: parseFloat(price),
        tax: taxRate,
        tax_amount: taxAmount.toFixed(2),
        withholding: withholdingRate,
        withholding_amount: withholdingAmount.toFixed(2),
        receivable: (price + taxAmount - withholdingAmount).toFixed(2),
      };

      const result = await updateInvoice(invoiceId, invoiceData);

      if (result.success) {
        toast.success('Fatura kaydı başarıyla güncellendi');
        onClose();
      } else {
        toast.error(result.error || 'Fatura kaydı güncellenemedi');
      }
    } catch (error) {
      console.error('Fatura kaydı güncellenirken hata:', error);
      toast.error('Fatura kaydı güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Fatura Kaydını Düzenle</DialogTitle>
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
                label="Fatura No"
                fullWidth
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                error={!!errors.invoiceNo}
                helperText={errors.invoiceNo}
              />
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
                fullWidth
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Birim"
                fullWidth
                value={unit_price}
                onChange={(e) => setUnit_price(e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                error={!!errors.unit_price}
                helperText={errors.unit_price}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Tutar" fullWidth value={parseFloat(price).toFixed(2)} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
              <TextField label="KDV Tutarı" fullWidth value={parseFloat(taxAmount).toFixed(2)} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
              <TextField label="Tevkifat Tutarı" fullWidth value={parseFloat(withholdingAmount).toFixed(2)} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Alacak Tutarı"
                fullWidth
                value={(price + taxAmount - withholdingAmount).toFixed(2)}
                InputProps={{ readOnly: true }}
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

export default EditInvoiceEntry;
