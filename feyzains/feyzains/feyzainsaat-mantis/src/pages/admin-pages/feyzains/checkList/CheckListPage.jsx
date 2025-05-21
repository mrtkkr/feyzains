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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import { PaymentEntryInvoiceContext } from '../../../../contexts/admin/feyzains/PaymentEntryInvoiceContext';
import { CustomerContext } from 'contexts/admin/feyzains/CustomerContext';
import { CompanyContext } from 'contexts/admin/feyzains/CompanyContext';
import axios from 'axios';
import { PUBLIC_URL } from '../../../../services/network_service';
import jsPDF from 'jspdf'; // jsPDF kütüphanesini import et
import 'jspdf-autotable'; // jsPDF-AutoTable eklentisini import et
import robotoBase64 from '../fonts/roboto-base64'; // bu dosyayı sen oluşturacaksın
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

const CheckListPage = () => {
  // Context
  const { paymentEntryInvoices, count, checklists, loading, error, fetchChecklists, fetchPaymentEntryInvoices } =
    useContext(PaymentEntryInvoiceContext);

  const { customers, fetchCustomers } = useContext(CustomerContext);
  const { companies, fetchCompanies } = useContext(CompanyContext);

  const { fetchUser } = useContext(AuthContext);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('check_time');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [checklistFilters, setChecklistFilters] = useState({
    startDate: null,
    endDate: null,
    company: '',
    customer: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery4, setSearchQuery4] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [CheckListCount, setCheckListCount] = useState(0);
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
  }, []);

  useEffect(() => {
    fetchChecklists({
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order,
      ...checklistFilters
    });
  }, [page, rowsPerPage, orderBy, order, checklistFilters]);

  useEffect(() => {
    fetchCompanies();
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

  // Dosya seçildiğinde state'e kaydet
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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

  const handleFilter = () => {
    const formattedStart = startDate?.toISOString().split('T')[0];
    const formattedEnd = endDate?.toISOString().split('T')[0];

    const newFilters = {
      startDate: formattedStart,
      endDate: formattedEnd,
      company: companySearch,
      customer: customerSearch
    };

    setChecklistFilters(newFilters); // Sadece filtreleri güncelle
    setPage(0); // Sayfayı sıfırla
  };

  const exportToExcel = async () => {
    try {
      if (!checklists || checklists.length === 0) {
        toast.warning('Excel için fatura verisi bulunamadı!');
        return;
      }

      const data = checklists.map((paymentEntryInvoice) => ({
        Banka: paymentEntryInvoice.bank || '-',
        Şirket: paymentEntryInvoice.company?.name || '-',
        Müşteri: paymentEntryInvoice.customer?.name || '-',
        Borç: formatNumber(paymentEntryInvoice.debt) || '-',
        'Çek No': paymentEntryInvoice.check_no || '-',
        'Çek Vade': paymentEntryInvoice.check_time ? formatDate(paymentEntryInvoice.check_time) : '-',
        Oluşturan: paymentEntryInvoice.created_by?.username || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);

      // Kolon genişliklerini ayarla
      worksheet['!cols'] = [
        { wch: 20 }, // Banka
        { wch: 20 }, // Şirket
        { wch: 20 }, // Müşteri
        { wch: 20 }, // Borç Tutarı
        { wch: 15 }, // Check No
        { wch: 15 }, // Check Vade
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
      XLSX.writeFile(workbook, 'Cek_Listesi.xlsx');
      toast.success('Excel başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('Excel oluşturulurken hata oluştu.');
      console.error('Excel export hatası:', error);
    }
  };

  // PDF'e aktarma fonksiyonu
  const exportToPdf = () => {
    try {
      if (!checklists || checklists.length === 0) {
        toast.warning('PDF için çek verisi bulunamadı!');
        return;
      }

      // PDF oluştur
      const doc = new jsPDF('l', 'mm', 'a4');

      // Roboto fontunu ekleyelim - Türkçe karakterleri destekler
      doc.addFileToVFS('Roboto-Regular.ttf', robotoBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto');

      // PDF başlığı
      doc.setFontSize(16);
      doc.text('Çek Listesi', 14, 15);

      // Tarih
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('tr-TR');
      doc.text(`Oluşturma Tarihi: ${today}`, 14, 22);

      // Tablo konfigürasyonu - Türkçe karakterli başlıklar
      const headers = ['Grup', 'Şirket', 'Müşteri', 'Borç', 'Çek No', 'Çek Vade'];
      const columnWidths = [35, 45, 45, 30, 30, 30];
      const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);
      const marginX = (doc.internal.pageSize.getWidth() - totalTableWidth) / 2;

      // Veri hazırlama
      const filteredData = checklists
        .filter((item) => item.check_no)
        .map((item) => [
          item.bank || '-',
          item.company?.name || '-',
          item.customer?.name || '-',
          formatNumber(item.debt),
          item.check_no || '-',
          formatDate(item.check_time)
        ]);

      let currentY = 30;
      const cellHeight = 10;

      // ÖNEMLİ: Font kodlamasını UTF-8 olarak ayarla
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(10);

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
      doc.save('Cek_Listesi.pdf');
      toast.success('PDF başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('PDF oluşturulurken hata oluştu.');
      console.error('PDF export hatası:', error);
    }
  };

  const visibleCheckListRows = useMemo(() => {
    return checklists.sort(getComparator(order, orderBy));
  }, [checklists, order, orderBy]);

  // IMPORTANT: Using memoized props to pass to child components

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          p={2}
          sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 1 }}
        >
          {/* Arama Alanları */}
          <Box display="flex" alignItems="center" gap={2} sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
            <TextField
              variant="outlined"
              size="medium"
              placeholder="Şirket Ara..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              variant="outlined"
              size="medium"
              placeholder="Müşteri Ara..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Tarih Filtreleri */}
          <Box display="flex" alignItems="center" gap={2} sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
              <DatePicker
                label="Başlangıç"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    size: 'medium',
                    variant: 'outlined'
                  }
                }}
              />
              <DatePicker
                label="Bitiş"
                value={endDate}
                minDate={startDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    size: 'medium',
                    variant: 'outlined'
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                size="medium"
                onClick={handleFilter}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Filtrele
              </Button>
            </LocalizationProvider>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mx={2}>
          <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={exportToPdf} sx={{ ml: 2 }}>
            PDF'e Aktar
          </Button>
          <Button variant="outlined" color="secondary" size="small" onClick={exportToExcel} sx={{ ml: 2 }}>
            Excel'e Aktar
          </Button>
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Grup</TableCell>
                  <TableCell>Şirket</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Borç</TableCell>
                  <TableCell>Çek No</TableCell>
                  <TableCell>Çek Vade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleCheckListRows.length > 0 ? (
                  visibleCheckListRows.map((checklists) => (
                    <TableRow key={checklists.id}>
                      <TableCell>{checklists.bank || '-'}</TableCell>
                      <TableCell>{checklists.company?.name || '-'}</TableCell>
                      <TableCell>{checklists.customer?.name || '-'}</TableCell>
                      <TableCell>{formatNumber(checklists.debt)}</TableCell>
                      <TableCell>{checklists.check_no || '-'}</TableCell>
                      <TableCell>{formatDate(checklists.check_time)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    {/* <TableCell colSpan={13} align="center">
                      <Typography variant="body1" py={2}>
                        {searchQuery4 ? 'Arama kriterlerinize uygun fatura kaydı bulunamadı.' : 'Henüz Çek listesi bulunmamaktadır.'}
                      </Typography>
                    </TableCell> */}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={count} // Artık burada context'teki count kullanılıyor
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

export default CheckListPage;
