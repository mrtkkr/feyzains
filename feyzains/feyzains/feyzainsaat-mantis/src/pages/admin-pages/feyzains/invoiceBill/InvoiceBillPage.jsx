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
import axios from 'axios';
import { PUBLIC_URL } from '../../../../services/network_service';
import CreateInvoiceBill from './CreateInvoiceBill';
import EditInvoiceBill from './EditInvoiceBill';
import ViewInvoiceBill from './ViewInvoiceBill';
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

const InvoiceBillPage = () => {
  // Context
  const { paymentEntryInvoices, loading, error, fetchPaymentEntryInvoices, deletePaymentEntryInvoice } =
    useContext(PaymentEntryInvoiceContext);
  const { fetchUser } = useContext(AuthContext);

  // States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [isEditInvoiceDialogOpen, setIsEditInvoiceDialogOpen] = useState(false);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [isViewInvoiceDialogOpen, setIsViewInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery2, setSearchQuery2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sadece bir kez veri çekme - sonsuz döngüyü önlemek için bağımlılık dizisi doğru yapılandırıldı
  useEffect(() => {
    fetchPaymentEntryInvoices();

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
  }, [fetchPaymentEntryInvoices]); // fetchPayments'i bağımlılık olarak ekleyin

  // Fatura sayısını güncelleme
  useEffect(() => {
    if (paymentEntryInvoices) {
      setInvoiceCount(paymentEntryInvoices.length);
    }
  }, [paymentEntryInvoices]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewInvoiceClick = (id) => {
    setSelectedInvoiceId(id);
    setIsViewInvoiceDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
  };

  const handleEditInvoiceClick = (id) => {
    setSelectedInvoiceId(id);
    setIsEditInvoiceDialogOpen(true);
  };

  const handleEditInvoice = () => {
    setIsEditInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
    // Trigger a refresh only when needed
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Bu fatura kaydını silmek istediğinizden emin misiniz?')) {
      try {
        const response = await deletePaymentEntryInvoice(id);
        if (response && response.success) {
          toast.success('Fatura kaydı başarıyla silindi');
          // We don't need to fetch again as deletePayment updates the local state
        } else {
          toast.error(response?.error || 'Fatura kaydı silinemedi');
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

  const handleCreateDialogClose = () => {
    setIsCreateInvoiceDialogOpen(false);
    // Trigger a refresh only when needed
    setRefreshTrigger((prev) => prev + 1);
  };

  const refreshData = useCallback(() => {
    fetchPaymentEntryInvoices(true); // Force refresh
  }, [fetchPaymentEntryInvoices]);

  // Use the refresh trigger to control when to refresh data
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshData();
    }
  }, [refreshTrigger, refreshData]);

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

      toast.success('Fatura kayıtları başarıyla yüklendi!');
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
      if (!paymentEntryInvoices || paymentEntryInvoices.length === 0) {
        toast.warning('Excel için fatura verisi bulunamadı!');
        return;
      }

      const data = paymentEntryInvoices.map((paymentEntryInvoice) => ({
        Tarih: formatDate(paymentEntryInvoice.date),
        Şantiye: paymentEntryInvoice.worksite?.name || '-',
        Grup: paymentEntryInvoice.group?.name || '-',
        Şirket: paymentEntryInvoice.company?.name || '-',
        Müşteri: paymentEntryInvoice.customer?.name || '-',
        Malzeme: paymentEntryInvoice.material || '-',
        Adet: paymentEntryInvoice.quantity || '-',
        'Birim Fiyatı': formatNumber(paymentEntryInvoice.unit_price),
        Tutar: formatNumber(paymentEntryInvoice.price),
        KDV: paymentEntryInvoice.tax || '-',
        Tevkifat: paymentEntryInvoice.withholding || '-',
        Alacak: paymentEntryInvoice.receivable || '-',
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
        { wch: 15 }, // Malzeme
        { wch: 12 }, // Adet
        { wch: 15 }, // Birim Fiyatı
        { wch: 15 }, // Tutar
        { wch: 20 }, // KDV
        { wch: 20 }, // Tevkifat
        { wch: 25 } // Oluşturan
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

  const filteredInvoices = useMemo(() => {
    if (!paymentEntryInvoices) return [];

    const searchLower = (searchQuery2 || '').toLowerCase();

    return paymentEntryInvoices.filter((paymentEntryInvoice) => {
      const worksiteName = paymentEntryInvoice?.worksite?.name?.toLowerCase() || '';
      const groupName = paymentEntryInvoice?.group?.name?.toLowerCase() || '';
      const companyName = paymentEntryInvoice?.company?.name?.toLowerCase() || '';
      const customerName = paymentEntryInvoice?.customer?.name?.toLowerCase() || '';
      const material = (paymentEntryInvoice?.material || '').toLowerCase();
      const quantity = paymentEntryInvoice?.quantity?.toString() || '';
      const unitPrice = paymentEntryInvoice?.unit_price?.toString() || '';
      const price = paymentEntryInvoice?.price?.toString() || '';
      const tax = paymentEntryInvoice?.tax?.toString() || '';
      const withholding = paymentEntryInvoice?.withholding?.toString() || '';
      const receivable = paymentEntryInvoice?.receivable?.toString() || '';
      const createdBy = paymentEntryInvoice?.created_by?.username?.toLowerCase() || '';
      const date = paymentEntryInvoice?.date || '';

      return (
        worksiteName.includes(searchLower) ||
        groupName.includes(searchLower) ||
        companyName.includes(searchLower) ||
        customerName.includes(searchLower) ||
        material.includes(searchLower) ||
        quantity.includes(searchLower) ||
        unitPrice.includes(searchLower) ||
        price.includes(searchLower) ||
        tax.includes(searchLower) ||
        withholding.includes(searchLower) ||
        receivable.includes(searchLower) ||
        createdBy.includes(searchLower) ||
        date.includes(searchLower)
      );
    });
  }, [paymentEntryInvoices, searchQuery2]);

  const visibleInvoiceRows = useMemo(() => {
    return filteredInvoices.sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredInvoices, order, orderBy, page, rowsPerPage]);

  // IMPORTANT: Using memoized props to pass to child components
  const viewInvoiceProps = useMemo(
    () => ({
      open: isViewInvoiceDialogOpen,
      onClose: handleCloseViewDialog,
      invoiceId: selectedInvoiceId
    }),
    [isViewInvoiceDialogOpen, selectedInvoiceId]
  );

  const editInvoiceProps = useMemo(
    () => ({
      open: isEditInvoiceDialogOpen,
      onClose: handleEditInvoice,
      invoiceId: selectedInvoiceId
    }),
    [isEditInvoiceDialogOpen, selectedInvoiceId]
  );

  const createInvoiceProps = useMemo(
    () => ({
      open: isCreateInvoiceDialogOpen,
      onClose: handleCreateDialogClose
    }),
    [isCreateInvoiceDialogOpen]
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Fatura Kayıtları
        </Typography>
        <Box display="flex" alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Fatura Ara..."
            value={searchQuery2}
            onChange={(e) => setSearchQuery2(e.target.value)}
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
                onClick={() => setIsCreateInvoiceDialogOpen(true)}
                sx={{ ml: 2 }}
              >
                Fatura Ekle
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
          {isCreateInvoiceDialogOpen && <CreateInvoiceBill {...createInvoiceProps} />}

          {isEditInvoiceDialogOpen && selectedInvoiceId && <EditInvoiceBill {...editInvoiceProps} />}

          {isViewInvoiceDialogOpen && selectedInvoiceId && <ViewInvoiceBill {...viewInvoiceProps} />}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Şantiye</TableCell>
                  <TableCell>Grup</TableCell>
                  <TableCell>Şirket</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Malzeme</TableCell>
                  <TableCell>Adet</TableCell>
                  <TableCell>Birim Fiyatı</TableCell>
                  <TableCell>Tutar</TableCell>
                  <TableCell>KDV</TableCell>
                  <TableCell>Tevkifat</TableCell>
                  <TableCell>Alacak</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleInvoiceRows.filter((row) => row.type === 'invoice').length > 0 ? (
                  visibleInvoiceRows
                    .filter((row) => row.type === 'invoice')
                    .map((paymentEntryInvoices) => (
                      <TableRow key={paymentEntryInvoices.id}>
                        <TableCell>{formatDate(paymentEntryInvoices.date)}</TableCell>
                        <TableCell>{paymentEntryInvoices.worksite?.name || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.group?.name || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.company?.name || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.customer?.name || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.material || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.quantity || '-'}</TableCell>
                        <TableCell>{formatNumber(paymentEntryInvoices.unit_price)}</TableCell>
                        <TableCell>{formatNumber(paymentEntryInvoices.price)}</TableCell>
                        <TableCell>{paymentEntryInvoices.tax || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.withholding || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.receivable || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Detay">
                            <IconButton onClick={() => handleViewInvoiceClick(paymentEntryInvoices.id)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {isAdmin && (
                            <>
                              <Tooltip title="Düzenle">
                                <IconButton onClick={() => handleEditInvoiceClick(paymentEntryInvoices.id)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton onClick={() => handleDeleteInvoice(paymentEntryInvoices.id)}>
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
                    <TableCell colSpan={13} align="center">
                      <Typography variant="body1" py={2}>
                        {searchQuery2 ? 'Arama kriterlerinize uygun fatura kaydı bulunamadı.' : 'Henüz fatura kaydı bulunmamaktadır.'}
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
            count={filteredInvoices.length}
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

export default InvoiceBillPage;
