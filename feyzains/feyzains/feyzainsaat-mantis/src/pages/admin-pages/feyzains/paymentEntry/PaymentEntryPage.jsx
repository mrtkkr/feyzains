import React, { useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PaymentEntryInvoiceContext } from '../../../../contexts/admin/feyzains/PaymentEntryInvoiceContext';
import { CompanyContext } from 'contexts/admin/feyzains/CompanyContext';
import { WorksiteContext } from 'contexts/admin/feyzains/WorksiteContext';
import { GroupContext } from 'contexts/admin/feyzains/GroupContext';
import { CustomerContext } from 'contexts/admin/feyzains/CustomerContext';
import axios from 'axios';
import { PUBLIC_URL } from '../../../../services/network_service';
import CreatePaymentEntry from './CreatePaymentEntry';
import EditPaymentEntry from './EditPaymentEntry';
import ViewPaymentEntry from './ViewPaymentEntry';
import { AuthContext } from 'contexts/auth/AuthContext';
import * as XLSX from 'xlsx';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '-';
  return `${Number(number).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

const PaymentEntryPage = () => {
  // Context
  const { payments, count, loading, error, fetchPaymentEntry, deletePaymentEntry } = useContext(PaymentEntryInvoiceContext);
  const { fetchUser } = useContext(AuthContext);
  const { fetchCompanies, companies } = useContext(CompanyContext);
  const { fetchWorksites, worksites } = useContext(WorksiteContext);
  const { fetchGroups, groups } = useContext(GroupContext);
  const { fetchCustomers, customers } = useContext(CustomerContext);

  // States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] = useState(false);
  const [isViewPaymentDialogOpen, setIsViewPaymentDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paymentCount, setPaymentCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sadece bir kez veri çekme - sonsuz döngüyü önlemek için bağımlılık dizisi doğru yapılandırıldı
  useEffect(() => {
    // Kullanıcı bilgilerini al
    const initializeUser = async () => {
      try {
        const user = await fetchUser();
        if (user) {
          if (user.groups?.includes('Admin') || user.is_superuser) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      }
    };

    initializeUser();
  }, []); // fetchPayments'i bağımlılık olarak ekleyin

  useEffect(() => {
    fetchPaymentEntry({
      type: 'payment',
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order
    });
  }, [page, rowsPerPage, orderBy, order]);

  useEffect(() => {
    fetchCompanies();
    fetchWorksites();
    fetchGroups();
    fetchCustomers();
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    console.log('newPage', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditPaymentClick = (id) => {
    setSelectedPaymentId(id);
    setIsEditPaymentDialogOpen(true);
  };

  const handleViewPaymentClick = (id) => {
    setSelectedPaymentId(id);
    setIsViewPaymentDialogOpen(true);
  };

  const handleEditPayment = () => {
    setIsEditPaymentDialogOpen(false);
    setSelectedPaymentId(null);

    fetchPaymentEntry({
      type: 'payment',
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order
    });
  };

  const handleCreatePayment = (paymentId) => {
    setIsCreatePaymentDialogOpen(false);
    setSelectedPaymentId(paymentId);
    fetchPaymentEntry({
      type: 'payment',
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order
    });
  };

  const handleCreateDialogClose = () => {
    setIsCreatePaymentDialogOpen(false);
    setSelectedPaymentId(null);

    // Buraya fetch gelebilir
  };

  const handleCloseViewDialog = () => {
    setIsViewPaymentDialogOpen(false);
    setSelectedPaymentId(null);
  };

  const handleOpenEditDialog = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setIsEditPaymentDialogOpen(true);
  };
  // Dialog'u kapatmak için kullanılacak fonksiyon
  const handleCloseEditDialog = () => {
    setIsEditPaymentDialogOpen(false);
    setSelectedPaymentId(null);
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('Bu ödeme kaydını silmek istediğinizden emin misiniz?')) {
      try {
        const response = await deletePaymentEntry(id);
        if (response && response.success) {
          toast.success('Ödeme kaydı başarıyla silindi');
          fetchPaymentEntry({
            type: 'payment',
            page: page,
            pageSize: rowsPerPage,
            orderBy: orderBy,
            order: order
          });
        } else {
          toast.error(response?.error || 'Ödeme kaydı silinemedi');
        }
      } catch (error) {
        console.error('Silme işlemi sırasında hata:', error);
        toast.error('Silme işlemi başarısız');
      }
    }
  };

  // Dosya seçildiğinde state'e kaydet
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const importFromExcel = async () => {
    if (!selectedFile) {
      toast.warning('Lütfen bir Excel dosyası seçin!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Loading başlat
    setIsLoading(true);

    try {
      const response = await axios.post(`${PUBLIC_URL}/core/import-payments-excel/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Ödeme kayıtları başarıyla yüklendi!');
      setSelectedFile(null); // Dosyayı sıfırla

      // Dosya input elementini sıfırla
      const fileInput = document.getElementById('excel-upload');
      if (fileInput) {
        fileInput.value = '';
      }

      // Trigger a refresh after successful import
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error('Hata oluştu: ' + (error.response?.data?.message || error.message || 'Bilinmeyen bir hata'));
      console.error('Excel yükleme hatası: ', error);
    } finally {
      // İşlem bitince loading'i kapat
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      if (!payments || payments.length === 0) {
        toast.warning('Excel için ödeme verisi bulunamadı!');
        return;
      }

      const data = payments.map((paymentEntryInvoice) => ({
        Tarih: formatDate(paymentEntryInvoice.date),
        Şantiye: paymentEntryInvoice.worksite?.name || '-',
        Grup: paymentEntryInvoice.group?.name || '-',
        Şirket: paymentEntryInvoice.company?.name || '-',
        Müşteri: paymentEntryInvoice.customer?.name || '-',
        Banka: paymentEntryInvoice.bank || '-',
        'Çek No': paymentEntryInvoice.check_no || '-',
        'Çek Vade': paymentEntryInvoice.check_time ? formatDate(paymentEntryInvoice.check_time) : '-',
        'Borç Tutarı': formatNumber(paymentEntryInvoice.debt),
        'Oluşturma Tarihi': formatDate(paymentEntryInvoice.created_date),
        Oluşturan: paymentEntryInvoice.created_by?.username || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);

      // Kolon genişliklerini ayarla
      worksheet['!cols'] = [
        { wch: 12 }, // Tarih
        { wch: 20 }, // Şantiye
        { wch: 15 }, // Grup
        { wch: 20 }, // Şirket
        { wch: 20 }, // Müşteri
        { wch: 15 }, // Banka
        { wch: 15 }, // Check No
        { wch: 15 }, // Check Vade
        { wch: 15 }, // Borç Tutarı
        { wch: 25 }, // Oluşturma Tarihi
        { wch: 20 } // Oluşturan
      ];

      // Header'ı bold yapmak için manuel hücre formatı
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ödemeler');

      // Export işlemi
      XLSX.writeFile(workbook, 'Odeme_Listesi.xlsx');
      toast.success('Excel başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('Excel oluşturulurken hata oluştu.');
      console.error('Excel export hatası:', error);
    }
  };

  const visiblePaymentRows = useMemo(() => {
    return payments.sort(getComparator(order, orderBy));
  }, [payments, order, orderBy]);

  // IMPORTANT: Using memoized props to pass to child components
  const viewPaymentProps = useMemo(
    () => ({
      open: isViewPaymentDialogOpen,
      onClose: handleCloseViewDialog,
      paymentId: selectedPaymentId
    }),
    [isViewPaymentDialogOpen, selectedPaymentId]
  );

  // EditPaymentEntry için props
  const editPaymentProps = useMemo(
    () => ({
      open: isEditPaymentDialogOpen,
      onClose: handleCloseEditDialog,
      paymentId: selectedPaymentId
    }),
    [isEditPaymentDialogOpen, selectedPaymentId]
  );

  const createPaymentProps = useMemo(
    () => ({
      open: isCreatePaymentDialogOpen,
      onClose: handleCreateDialogClose
    }),
    [isCreatePaymentDialogOpen]
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Ödeme Kayıtları
        </Typography>
        <Box display="flex" alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Ödeme Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button variant="outlined" color="secondary" size="small" onClick={exportToExcel} sx={{ ml: 2 }}>
            Excel'e Aktar
          </Button>
          {isAdmin && (
            <>
              {/* <input type="file" accept=".xlsx" onChange={handleFileChange} style={{ display: 'none' }} id="excel-upload" /> */}
              {/* <label htmlFor="excel-upload">
                <Button variant="contained" component="span" color="primary" size="small" sx={{ ml: 2 }}>
                  Excel Seç
                </Button>
              </label> */}
              {/* <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                onClick={importFromExcel}
                sx={{ ml: 2 }}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? 'Yükleniyor...' : 'Excel Yükle'}
              </Button> */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setIsCreatePaymentDialogOpen(true)}
                sx={{ ml: 2 }}
              >
                Ödeme Ekle
              </Button>
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box bgcolor="error.light" p={2} borderRadius={1} mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          {/* Modal'ların koşullu renderlanması - Optimized with memoized props */}
          {isCreatePaymentDialogOpen && <CreatePaymentEntry {...createPaymentProps} />}

          {isEditPaymentDialogOpen && selectedPaymentId && <EditPaymentEntry {...editPaymentProps} />}

          {isViewPaymentDialogOpen && selectedPaymentId && <ViewPaymentEntry {...viewPaymentProps} />}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Şantiye</TableCell>
                  <TableCell>Grup</TableCell>
                  <TableCell>Şirket</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Banka</TableCell>
                  <TableCell>Çek No</TableCell>
                  <TableCell>Çek Vade</TableCell>
                  <TableCell>Borç</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visiblePaymentRows.length > 0 ? (
                  visiblePaymentRows.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>{payment.worksite?.name || '-'}</TableCell>
                      <TableCell>{payment.group?.name || '-'}</TableCell>
                      <TableCell>{payment.company?.name || '-'}</TableCell>
                      <TableCell>{payment.customer?.name || '-'}</TableCell>
                      <TableCell>{payment.bank || '-'}</TableCell>
                      <TableCell>{payment.check_no || '-'}</TableCell>
                      <TableCell>{formatDate(payment.check_time)}</TableCell>
                      <TableCell>{formatNumber(payment.debt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Detay">
                          <IconButton onClick={() => handleViewPaymentClick(payment.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip title="Düzenle">
                              <IconButton onClick={() => handleEditPaymentClick(payment.id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton type="button" onClick={() => handleDeletePayment(payment.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body1" py={2}>
                        {searchQuery ? 'Arama kriterlerinize uygun ödeme kaydı bulunamadı.' : 'Henüz ödeme kaydı bulunmamaktadır.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına kayıt:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </>
      )}
    </Box>
  );
};

export default PaymentEntryPage;
