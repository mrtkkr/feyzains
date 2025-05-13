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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // PDF ikonu ekle
import { PaymentEntryInvoiceContext } from '../../../../contexts/admin/feyzains/PaymentEntryInvoiceContext';
import { CompanyContext } from '../../../../contexts/admin/feyzains/CompanyContext';
import { WorksiteContext } from '../../../../contexts/admin/feyzains/WorksiteContext';
import { GroupContext } from '../../../../contexts/admin/feyzains/GroupContext';
import { CustomerContext } from '../../../../contexts/admin/feyzains/CustomerContext';
import axios from 'axios';
import { PUBLIC_URL } from '../../../../services/network_service';
import jsPDF from 'jspdf'; // jsPDF kütüphanesini import et
import 'jspdf-autotable'; // jsPDF-AutoTable eklentisini import et
import robotoBase64 from '../fonts/roboto-base64';
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
  const { invoices, count, loading, error, fetchInvoice, deleteInvoice } = useContext(PaymentEntryInvoiceContext);
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
  const [isEditInvoiceDialogOpen, setIsEditInvoiceDialogOpen] = useState(false);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [isViewInvoiceDialogOpen, setIsViewInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [searchQuery3, setSearchQuery3] = useState('');
  const [searchQuery4, setSearchQuery4] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);
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
    fetchInvoice({
      type: 'invoice',
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order
    });
  }, [page, rowsPerPage, orderBy, order]);
  // Fatura sayısını güncelleme

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

  const handleEditInvoiceClick = (id) => {
    setSelectedInvoiceId(id);
    setIsEditInvoiceDialogOpen(true);
  };

  const handleViewInvoiceClick = (id) => {
    setSelectedInvoiceId(id);
    setIsViewInvoiceDialogOpen(true);
  };

  const handleEditInvoice = () => {
    setIsEditInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);

    fetchInvoice({
      type: 'invoice',
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order
    });
  };

  const handleCreateInvoice = (invoiceId) => {
    setIsCreateInvoiceDialogOpen(false);
    setSelectedInvoiceId(invoiceId);
    fetchInvoice({
      type: 'invoice',
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order
    });
  };

  const handleCreateDialogClose = () => {
    setIsCreateInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
    // Trigger a refresh only when needed
  };

  const handleCloseViewDialog = () => {
    setIsViewInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
  };
  const handleCloseEditDialog = () => {
    setIsEditInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
  };

  // const handleEditInvoice = () => {
  //   setIsEditInvoiceDialogOpen(false);
  //   setSelectedInvoiceId(null);
  // };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Bu fatura kaydını silmek istediğinizden emin misiniz?')) {
      try {
        const response = await deleteInvoice(id);
        if (response && response.success) {
          toast.success('Fatura kaydı başarıyla silindi');
          fetchInvoice({
            type: 'invoice',
            page: page,
            pageSize: rowsPerPage,
            orderBy: orderBy,
            order: order
          });
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

  const handleFilter = () => {
    fetchInvoice({
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order,
      worksite: searchQuery1,
      group: searchQuery2,
      company: searchQuery3,
      customer: searchQuery4
    });
  };

  // Use the refresh trigger to control when to refresh data

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
      if (!invoices || invoices.length === 0) {
        toast.warning('Excel için fatura verisi bulunamadı!');
        return;
      }

      const data = invoices.map((paymentEntryInvoice) => ({
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
      XLSX.writeFile(workbook, 'Fatura_Kayıtları.xlsx');
      toast.success('Excel başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('Excel oluşturulurken hata oluştu.');
      console.error('Excel export hatası:', error);
    }
  };

  // PDF'e aktarma fonksiyonu
  const exportToPdf = () => {
    try {
      if (!invoices || invoices.length === 0) {
        toast.warning('PDF için fatura verisi bulunamadı!');
        return;
      }

      // PDF oluştur
      const doc = new jsPDF('l', 'mm', 'a3');

      // Roboto fontunu ekleyelim - Türkçe karakterleri destekler
      doc.addFileToVFS('Roboto-Regular.ttf', robotoBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto');

      // PDF başlığı
      doc.setFontSize(16);
      doc.text('Fatura Kayıtları', 14, 15);

      // Tarih
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('tr-TR');
      doc.text(`Oluşturma Tarihi: ${today}`, 14, 22);

      // Tablo konfigürasyonu - Türkçe karakterli başlıklar
      const headers = [
        'Tarih',
        'Şantiye',
        'Grup',
        'Şirket',
        'Müşteri',
        'Malzeme',
        'Adet',
        'Birim Fiyatı',
        'Tutar',
        'KDV',
        'Tevkifat',
        'Alacak'
      ];
      const columnWidths = [30, 50, 50, 50, 50, 30, 20, 25, 25, 20, 20, 25]; // Kolon genişlikleri
      const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);
      const marginX = (doc.internal.pageSize.getWidth() - totalTableWidth) / 2;

      // Veri hazırlama
      const filteredData = invoices.map((paymentEntryInvoice) => [
        formatDate(paymentEntryInvoice.date),
        paymentEntryInvoice.worksite?.name || '-',
        paymentEntryInvoice.group?.name || '-',
        paymentEntryInvoice.company?.name || '-',
        paymentEntryInvoice.customer?.name || '-',
        paymentEntryInvoice.material || '-',
        paymentEntryInvoice.quantity || '-',
        formatNumber(paymentEntryInvoice.unit_price),
        formatNumber(paymentEntryInvoice.price),
        paymentEntryInvoice.tax || '-',
        paymentEntryInvoice.withholding || '-',
        formatNumber(paymentEntryInvoice.receivable) || '-'
      ]);

      let currentY = 30;
      const cellHeight = 10;

      // ÖNEMLİ: Font kodlamasını UTF-8 olarak ayarla
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8);

      // Başlıklar
      doc.setFillColor(66, 66, 66);
      doc.setTextColor(255, 255, 255);

      // İki adımda çizim yaklaşımı
      // 1. Adım: Kutuları çiz
      let currentX = marginX;
      headers.forEach((header, i) => {
        doc.rect(currentX, currentY, columnWidths[i], cellHeight, 'F');
        currentX += columnWidths[i];
      });

      // 2. Adım: Metinleri yaz - autoEncode özelliğini true yapıyoruz
      currentX = marginX;
      headers.forEach((header, i) => {
        // PDF-lib için metin kodlaması ve konumlandırma ayarları
        doc.text(header, currentX + 4, currentY + 7, {
          charSpace: 0,
          lineHeightFactor: 1,
          maxWidth: columnWidths[i] - 8,
          align: 'left'
        });
        currentX += columnWidths[i];
      });

      // Satır verisi
      currentY += cellHeight;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);

      filteredData.forEach((row) => {
        // Yeni sayfa kontrolü
        if (currentY + cellHeight > doc.internal.pageSize.getHeight() - 10) {
          doc.addPage();
          currentY = 20;

          // Yeni sayfadaki başlıklar
          currentX = marginX;

          // Kutuları çiz
          doc.setFillColor(66, 66, 66);
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          headers.forEach((header, i) => {
            doc.rect(currentX, currentY, columnWidths[i], cellHeight, 'F');
            currentX += columnWidths[i];
          });

          // Metinleri yaz
          currentX = marginX;
          headers.forEach((header, i) => {
            doc.text(header, currentX + 4, currentY + 7, {
              charSpace: 0,
              lineHeightFactor: 1,
              maxWidth: columnWidths[i] - 8,
              align: 'left'
            });
            currentX += columnWidths[i];
          });

          currentY += cellHeight;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);
        }

        // Hücre kutuları
        currentX = marginX;
        row.forEach((cell, i) => {
          doc.rect(currentX, currentY, columnWidths[i], cellHeight);
          currentX += columnWidths[i];
        });

        // Hücre metinleri
        currentX = marginX;
        row.forEach((cell, i) => {
          doc.text(cell.toString(), currentX + 4, currentY + 7, {
            charSpace: 0,
            lineHeightFactor: 1,
            maxWidth: columnWidths[i] - 8,
            align: 'left'
          });
          currentX += columnWidths[i];
        });

        currentY += cellHeight;
      });

      // PDF'i kaydet
      doc.save('Fatura_Kayıtları.pdf');
      toast.success('PDF başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('PDF oluşturulurken hata oluştu.');
      console.error('PDF export hatası:', error);
    }
  };

  const visibleInvoiceRows = useMemo(() => {
    return invoices.sort(getComparator(order, orderBy));
  }, [invoices, order, orderBy]);

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
      onClose: handleCloseEditDialog,
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
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            letterSpacing: 0.5,
            mb: 3
          }}
        >
          FATURA FİLTRELEME
        </Typography>

        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
          {/* Sol taraf: Filtre alanları */}
          <Box display="flex" flexWrap="wrap" gap={8}>
            <Box display="flex" flexDirection="column" minWidth={200} gap={1}>
              <Typography variant="subtitle2">Şantiye</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Şantiye Ara..."
                value={searchQuery1}
                onChange={(e) => setSearchQuery1(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                fullWidth
              />
            </Box>

            <Box display="flex" flexDirection="column" minWidth={200} gap={1}>
              <Typography variant="subtitle2">Grup</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Grup Ara..."
                value={searchQuery2}
                onChange={(e) => setSearchQuery2(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                fullWidth
              />
            </Box>

            <Box display="flex" flexDirection="column" minWidth={200} gap={1}>
              <Typography variant="subtitle2">Şirket</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Şirket Ara..."
                value={searchQuery3}
                onChange={(e) => setSearchQuery3(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                fullWidth
              />
            </Box>

            <Box display="flex" flexDirection="column" minWidth={200} gap={1}>
              <Typography variant="subtitle2">Müşteri</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Müşteri Ara..."
                value={searchQuery4}
                onChange={(e) => setSearchQuery4(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                fullWidth
              />
            </Box>
          </Box>

          {/* Sağ taraf: Filtrele butonu */}
          <Box display="flex" alignItems="flex-end">
            <Button
              variant="contained"
              size="medium"
              onClick={handleFilter}
              sx={{
                backgroundColor: '#f5a623', // özel bir turuncu tonu
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#d48806'
                },
                fontWeight: 'bold',
                px: 3,
                borderRadius: 2
              }}
            >
              Filtrele
            </Button>
          </Box>
        </Box>
      </Paper>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <Typography variant="h5" component="h1">
            Fatura Kayıtları
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={exportToPdf} sx={{ ml: 2 }}>
            PDF'e Aktar
          </Button>
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
                {visibleInvoiceRows.length > 0 ? (
                  visibleInvoiceRows.map((invoices) => (
                    <TableRow key={invoices.id}>
                      <TableCell>{formatDate(invoices.date)}</TableCell>
                      <TableCell>{invoices.worksite?.name || '-'}</TableCell>
                      <TableCell>{invoices.group?.name || '-'}</TableCell>
                      <TableCell>{invoices.company?.name || '-'}</TableCell>
                      <TableCell>{invoices.customer?.name || '-'}</TableCell>
                      <TableCell>{invoices.material || '-'}</TableCell>
                      <TableCell>{invoices.quantity || '-'}</TableCell>
                      <TableCell>{formatNumber(invoices.unit_price)}</TableCell>
                      <TableCell>{formatNumber(invoices.price)}</TableCell>
                      <TableCell>{invoices.tax || '-'}</TableCell>
                      <TableCell>{invoices.withholding || '-'}</TableCell>
                      <TableCell>{formatNumber(invoices.receivable) || '-'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Detay">
                          <IconButton onClick={() => handleViewInvoiceClick(invoices.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip title="Düzenle">
                              <IconButton onClick={() => handleEditInvoiceClick(invoices.id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton onClick={() => handleDeleteInvoice(invoices.id)}>
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

export default InvoiceBillPage;
