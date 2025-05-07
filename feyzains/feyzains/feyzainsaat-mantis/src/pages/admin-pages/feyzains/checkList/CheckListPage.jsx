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
import axios from 'axios';
import { PUBLIC_URL } from '../../../../services/network_service';
import jsPDF from 'jspdf'; // jsPDF kütüphanesini import et
import 'jspdf-autotable'; // jsPDF-AutoTable eklentisini import et
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
  const { paymentEntryInvoices, loading, error, fetchPaymentEntryInvoices } = useContext(PaymentEntryInvoiceContext);
  const { fetchUser } = useContext(AuthContext);

  // States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery4, setSearchQuery4] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [CheckListCount, setCheckListCount] = useState(0);
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
      setCheckListCount(paymentEntryInvoices.length);
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

  // Dosya seçildiğinde state'e kaydet
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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
      if (!paymentEntryInvoices || paymentEntryInvoices.length === 0) {
        toast.warning('PDF için çek verisi bulunamadı!');
        return;
      }

      // PDF oluşturma
      const doc = new jsPDF('l', 'mm', 'a4'); // Yatay (landscape) A4 boyutunda

      // Başlık ekle
      doc.setFontSize(16);
      doc.text('Çek Listesi', 14, 15);

      // Tarih ve sayfa bilgisi ekle
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('tr-TR');
      doc.text(`Oluşturma Tarihi: ${today}`, 14, 22);

      // Filtrelenen verileri PDF için hazırla
      const filteredData = filteredCheckLists
        .filter((item) => item.check_no)
        .map((item) => [
          item.bank || '-',
          item.company?.name || '-',
          item.customer?.name || '-',
          formatNumber(item.debt),
          item.check_no || '-',
          formatDate(item.check_time)
        ]);

      // Tabloyu manuel oluştur (autoTable kullanmadan)
      // Tablo başlıkları
      const headers = ['Grup', 'Şirket', 'Müşteri', 'Borç', 'Çek No', 'Çek Vade'];
      const columnWidths = [30, 40, 40, 30, 25, 25]; // mm cinsinden genişlikler

      // Tablo başlık ve içeriğini oluştur
      const startY = 30;
      const cellHeight = 10;
      let currentY = startY;

      // Tablo başlıklarını çiz
      doc.setFillColor(66, 66, 66);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');

      let currentX = 10;
      headers.forEach((header, i) => {
        doc.rect(currentX, currentY, columnWidths[i], cellHeight, 'F');
        doc.text(header, currentX + columnWidths[i] / 2, currentY + cellHeight / 2, { align: 'center', baseline: 'middle' });
        currentX += columnWidths[i];
      });

      // Tablo içeriğini çiz
      currentY += cellHeight;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);

      filteredData.forEach((row, rowIndex) => {
        if (currentY > 280) {
          // Sayfa sınırını kontrol et ve gerekirse yeni sayfa ekle
          doc.addPage();
          currentY = 20;
        }

        currentX = 10;
        row.forEach((cell, colIndex) => {
          doc.rect(currentX, currentY, columnWidths[colIndex], cellHeight);
          doc.text(cell.toString(), currentX + 2, currentY + cellHeight / 2, { baseline: 'middle' });
          currentX += columnWidths[colIndex];
        });

        currentY += cellHeight;
      });

      // PDF dosyasını indir
      doc.save('Cek_Listesi.pdf');
      toast.success('PDF başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('PDF oluşturulurken hata oluştu.');
      console.error('PDF export hatası:', error);
    }
  };

  const filteredCheckLists = useMemo(() => {
    if (!paymentEntryInvoices) return [];

    const searchLower = (searchQuery4 || '').toLowerCase();

    return paymentEntryInvoices.filter((paymentEntryInvoice) => {
      const companyName = paymentEntryInvoice?.company?.name?.toLowerCase() || '';
      const customerName = paymentEntryInvoice?.customer?.name?.toLowerCase() || '';
      const bank = (paymentEntryInvoice?.bank || '').toLowerCase();
      const checkNo = (paymentEntryInvoice?.check_no || '').toLowerCase();
      const checkTime = paymentEntryInvoice?.check_time ? formatDate(paymentEntryInvoice.check_time) : '';
      const debt = paymentEntryInvoice?.debt?.toString() || '';
      const createdBy = paymentEntryInvoice?.created_by?.username?.toLowerCase() || '';

      return (
        companyName.includes(searchLower) ||
        customerName.includes(searchLower) ||
        bank.includes(searchLower) ||
        checkNo.includes(searchLower) ||
        checkTime.includes(searchLower) ||
        debt.includes(searchLower) ||
        createdBy.includes(searchLower)
      );
    });
  }, [paymentEntryInvoices, searchQuery4]);

  const visibleCheckListRows = useMemo(() => {
    return filteredCheckLists.sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCheckLists, order, orderBy, page, rowsPerPage]);

  // IMPORTANT: Using memoized props to pass to child components

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Çek Listesi
        </Typography>
        <Box display="flex" alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Genel Ara..."
            value={searchQuery4}
            onChange={(e) => setSearchQuery4(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
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
                {visibleCheckListRows.filter((item) => item.check_no).length > 0 ? (
                  visibleCheckListRows
                    .filter((item) => item.check_no)
                    .map((paymentEntryInvoices) => (
                      <TableRow key={paymentEntryInvoices.id}>
                        <TableCell>{paymentEntryInvoices.bank || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.company?.name || '-'}</TableCell>
                        <TableCell>{paymentEntryInvoices.customer?.name || '-'}</TableCell>
                        <TableCell>{formatNumber(paymentEntryInvoices.debt)}</TableCell>
                        <TableCell>{paymentEntryInvoices.check_no || '-'}</TableCell>
                        <TableCell>{formatDate(paymentEntryInvoices.check_time)}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <Typography variant="body1" py={2}>
                        {searchQuery4 ? 'Arama kriterlerinize uygun fatura kaydı bulunamadı.' : 'Henüz fatura kaydı bulunmamaktadır.'}
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
            count={filteredCheckLists.length}
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
