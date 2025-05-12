import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { PaymentEntryInvoiceContext } from '../../../../contexts/admin/feyzains/PaymentEntryInvoiceContext';
import { AuthContext } from 'contexts/auth/AuthContext';

const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '-';
  return `${Number(number).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ₺`;
};

const ViewInvoiceEntry = ({ open, onClose, invoiceId }) => {
  const { getInvoiceById } = useContext(PaymentEntryInvoiceContext);
  const { fetchUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (open && invoiceId) {
      fetchInvoiceDetails();
      checkAdminStatus();
    }
  }, [open, invoiceId]);

  const checkAdminStatus = async () => {
    try {
      const user = await fetchUser();
      if (user) {
        setIsAdmin(user.groups.includes('Admin') || user.is_superuser);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata:', error);
    }
  };

  const fetchInvoiceDetails = async () => {
    setIsLoading(true);
    try {
      const result = await getInvoiceById(invoiceId);
      if (result.success) {
        setInvoice(result.data);
      }
    } catch (error) {
      console.error('Fatura kaydı yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const DetailItem = ({ label, value }) => (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid item xs={4} md={3}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}:
        </Typography>
      </Grid>
      <Grid item xs={8} md={9}>
        <Typography variant="body1">{value || '-'}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Fatura Kaydı Detayları</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : invoice ? (
          <Paper elevation={0} sx={{ p: 2 }}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Temel Bilgiler
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <DetailItem label="Tarih" value={formatDate(invoice.date)} />
              <DetailItem label="Şantiye" value={invoice.worksite.name} />
              <DetailItem label="Grup" value={invoice.group.name} />
              <DetailItem label="Şirket" value={invoice.company.name} />
              <DetailItem label="Müşteri" value={invoice.customer.name} />
            </Box>

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Ödeme Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <DetailItem label="Malzeme" value={invoice.material} />
              <DetailItem label="Adet" value={invoice.quantity} />
              <DetailItem label="Birim Fiyatı" value={formatNumber(invoice.unit_price)} />
              <DetailItem label="Tutar" value={formatNumber(invoice.price)} />
              <DetailItem label="Kdv" value={invoice.tax} />
              <DetailItem label="Tevkifat" value={invoice.withholding} />
              <DetailItem label="Alacak" value={formatNumber(invoice.receivable)} />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Sistem Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <DetailItem label="Oluşturulma Tarihi" value={formatDate(invoice.created_date)} />
              <DetailItem label="Oluşturan" value={invoice.created_by ? invoice.created_by.username : '-'} />
            </Box>

            {isAdmin && (
              <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
                <Typography variant="body2">
                  Admin yetkisiyle görüntülüyorsunuz. Düzenlemek için ana sayfadaki düzenle butonunu kullanabilirsiniz.
                </Typography>
              </Box>
            )}
          </Paper>
        ) : (
          <Box p={2} textAlign="center">
            <Typography variant="body1" color="error">
              Ödeme kaydı bulunamadı veya yüklenirken bir hata oluştu.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewInvoiceEntry;
