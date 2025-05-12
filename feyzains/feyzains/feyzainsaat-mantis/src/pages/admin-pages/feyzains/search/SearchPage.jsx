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
// import jsPDF from 'jspdf'; // jsPDF kütüphanesini import et
// import 'jspdf-autotable'; // jsPDF-AutoTable eklentisini import et
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

const SearchPage = () => {
  // Context
  const { searchs, loading, error, fetchSearchs } = useContext(PaymentEntryInvoiceContext);
  const { fetchUser } = useContext(AuthContext);

  // States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery3, setSearchQuery3] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sadece bir kez veri çekme - sonsuz döngüyü önlemek için bağımlılık dizisi doğru yapılandırıldı
  useEffect(() => {
    fetchSearchs();

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
  }, [fetchSearchs]); // fetchPayments'i bağımlılık olarak ekleyin

  // Fatura sayısını güncelleme
  useEffect(() => {
    if (searchs) {
      setSearchCount(searchs.length);
    }
  }, [searchs]);

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
    fetchSearchs(true); // Force refresh
  }, [fetchSearchs]);

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
      if (!searchs || searchs.length === 0) {
        toast.warning('Excel için fatura verisi bulunamadı!');
        return;
      }

      const data = searchs.map((paymentEntryInvoice) => ({
        Tarih: formatDate(paymentEntryInvoice.date),
        Şantiye: paymentEntryInvoice.worksite?.name || '-',
        Grup: paymentEntryInvoice.group?.name || '-',
        Şirket: paymentEntryInvoice.company?.name || '-',
        Müşteri: paymentEntryInvoice.customer?.name || '-',
        Banka: paymentEntryInvoice.bank || '-',
        'Çek No': paymentEntryInvoice.check_no || '-',
        'Çek Vade': paymentEntryInvoice.check_time ? formatDate(paymentEntryInvoice.check_time) : '-',
        Malzeme: paymentEntryInvoice.material || '-',
        Adet: paymentEntryInvoice.quantity || '-',
        'Birim Fiyatı': formatNumber(paymentEntryInvoice.unit_price),
        Tutar: formatNumber(paymentEntryInvoice.price),
        KDV: paymentEntryInvoice.tax || '-',
        Tevkifat: paymentEntryInvoice.withholding || '-',
        Alacak: paymentEntryInvoice.receivable || '-',
        'Borç Tutarı': formatNumber(paymentEntryInvoice.debt),
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
        { wch: 15 }, // Malzeme
        { wch: 12 }, // Adet
        { wch: 15 }, // Birim Fiyatı
        { wch: 15 }, // Tutar
        { wch: 20 }, // KDV
        { wch: 20 }, // Tevkifat
        { wch: 20 }, // Alacak
        { wch: 20 }, // Borç Tutarı
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
      XLSX.writeFile(workbook, 'Arama_Bolumu.xlsx');
      toast.success('Excel başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('Excel oluşturulurken hata oluştu.');
      console.error('Excel export hatası:', error);
    }
  };

  // const exportToPdf = () => {
  //   try {
  //     if (!paymentEntryInvoices || paymentEntryInvoices.length === 0) {
  //       toast.warning('PDF için arama verisi bulunamadı!');
  //       return;
  //     }

  //     const doc = new jsPDF('l', 'mm', 'a4'); // Yatay A4
  //     const margin = 10;
  //     const rowHeight = 10;
  //     const startY = 30;
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const today = new Date().toLocaleDateString('tr-TR');

  //     // Başlık
  //     doc.setFontSize(16);
  //     doc.setFont(undefined, 'bold');
  //     doc.text('Çek Listesi', margin, 15);

  //     // Tarih
  //     doc.setFontSize(10);
  //     doc.setFont(undefined, 'normal');
  //     doc.text(`Oluşturma Tarihi: ${today}`, margin, 22);

  //     const headers = [
  //       'Tarih',
  //       'Şantiye',
  //       'Grup',
  //       'Şirket',
  //       'Müşteri',
  //       'Banka',
  //       'Çek No',
  //       'Çek Vade',
  //       'Malzeme',
  //       'Adet',
  //       'Birim Fiyatı',
  //       'Tutar',
  //       'KDV',
  //       'Tevkifat',
  //       'Alacak',
  //       'Borç Tutarı'
  //     ];

  //     // Kolon genişlikleri - A4 yatay sayfaya sığacak şekilde dengelendi
  //     const columnWidths = [25, 30, 30, 35, 35, 30, 25, 25, 30, 20, 25, 25, 20, 20, 30, 30];

  //     const filteredData = filteredSearchs.map((entry) => [
  //       formatDate(entry.date),
  //       entry.worksite?.name || '-',
  //       entry.group?.name || '-',
  //       entry.company?.name || '-',
  //       entry.customer?.name || '-',
  //       entry.bank || '-',
  //       entry.check_no || '-',
  //       entry.check_time ? formatDate(entry.check_time) : '-',
  //       entry.material || '-',
  //       entry.quantity || '-',
  //       formatNumber(entry.unit_price),
  //       formatNumber(entry.price),
  //       entry.tax || '-',
  //       entry.withholding || '-',
  //       entry.receivable || '-',
  //       formatNumber(entry.debt)
  //     ]);

  //     let currentY = startY;

  //     const drawTableHeader = () => {
  //       let currentX = margin;
  //       doc.setFillColor(66, 66, 66);
  //       doc.setTextColor(255, 255, 255);
  //       doc.setFontSize(5);
  //       doc.setFont(undefined, 'bold');

  //       headers.forEach((title, i) => {
  //         doc.rect(currentX, currentY, columnWidths[i], rowHeight, 'F');
  //         const headerText = doc.splitTextToSize(title, columnWidths[i] - 2);
  //         doc.text(headerText, currentX + columnWidths[i] / 2, currentY + rowHeight / 2, {
  //           align: 'center',
  //           baseline: 'middle'
  //         });
  //         currentX += columnWidths[i];
  //       });

  //       currentY += rowHeight;
  //     };

  //     const drawTableRow = (row) => {
  //       if (currentY + rowHeight > doc.internal.pageSize.getHeight() - margin) {
  //         doc.addPage();
  //         currentY = margin;
  //         drawTableHeader();
  //       }

  //       let currentX = margin;
  //       doc.setFont(undefined, 'normal');
  //       doc.setFontSize(8);
  //       doc.setTextColor(0, 0, 0);

  //       row.forEach((cell, i) => {
  //         doc.rect(currentX, currentY, columnWidths[i], rowHeight);
  //         const textLines = doc.splitTextToSize(cell.toString(), columnWidths[i] - 2);
  //         doc.text(textLines, currentX + 1, currentY + 4); // Çok satırlı destek
  //         currentX += columnWidths[i];
  //       });

  //       currentY += rowHeight;
  //     };

  //     drawTableHeader();

  //     filteredData.forEach((row) => drawTableRow(row));

  //     doc.save('Arama_Bolumu.pdf');
  //     toast.success('PDF başarıyla oluşturuldu!');
  //   } catch (error) {
  //     toast.error('PDF oluşturulurken bir hata oluştu.');
  //     console.error('PDF export hatası:', error);
  //   }
  // };

  const filteredSearchs = useMemo(() => {
    if (!searchs) return [];

    const searchLower = (searchQuery3 || '').toLowerCase();

    return searchs.filter((paymentEntryInvoice) => {
      const worksiteName = paymentEntryInvoice?.worksite?.name?.toLowerCase() || '';
      const groupName = paymentEntryInvoice?.group?.name?.toLowerCase() || '';
      const companyName = paymentEntryInvoice?.company?.name?.toLowerCase() || '';
      const customerName = paymentEntryInvoice?.customer?.name?.toLowerCase() || '';
      const bank = (paymentEntryInvoice?.bank || '').toLowerCase();
      const material = (paymentEntryInvoice?.material || '').toLowerCase();
      const quantity = paymentEntryInvoice?.quantity?.toString() || '';
      const unitPrice = paymentEntryInvoice?.unit_price?.toString() || '';
      const price = paymentEntryInvoice?.price?.toString() || '';
      const tax = paymentEntryInvoice?.tax?.toString() || '';
      const withholding = paymentEntryInvoice?.withholding?.toString() || '';
      const receivable = paymentEntryInvoice?.receivable?.toString() || '';
      const debt = paymentEntryInvoice?.debt?.toString() || '';
      const createdBy = paymentEntryInvoice?.created_by?.username?.toLowerCase() || '';
      const date = paymentEntryInvoice?.date || '';

      return (
        worksiteName.includes(searchLower) ||
        groupName.includes(searchLower) ||
        companyName.includes(searchLower) ||
        customerName.includes(searchLower) ||
        bank.includes(searchLower) ||
        material.includes(searchLower) ||
        quantity.includes(searchLower) ||
        unitPrice.includes(searchLower) ||
        price.includes(searchLower) ||
        tax.includes(searchLower) ||
        withholding.includes(searchLower) ||
        receivable.includes(searchLower) ||
        debt.includes(searchLower) ||
        createdBy.includes(searchLower) ||
        date.includes(searchLower)
      );
    });
  }, [searchs, searchQuery3]);

  const visibleSearchRows = useMemo(() => {
    return filteredSearchs.sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredSearchs, order, orderBy, page, rowsPerPage]);

  // IMPORTANT: Using memoized props to pass to child components

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Arama Bölümü
        </Typography>
        <Box display="flex" alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Genel Ara..."
            value={searchQuery3}
            onChange={(e) => setSearchQuery3(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          {/* <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={exportToPdf} sx={{ ml: 2 }}>
            PDF'e Aktar
          </Button> */}
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
                  <TableCell>Tarih</TableCell>
                  <TableCell>Şantiye</TableCell>
                  <TableCell>Grup</TableCell>
                  <TableCell>Şirket</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Banka</TableCell>
                  <TableCell>Çek No</TableCell>
                  <TableCell>Çek Vade</TableCell>
                  <TableCell>Malzeme</TableCell>
                  <TableCell>Adet</TableCell>
                  <TableCell>Birim Fiyatı</TableCell>
                  <TableCell>Tutar</TableCell>
                  <TableCell>KDV</TableCell>
                  <TableCell>Tevkifat</TableCell>
                  <TableCell>Alacak</TableCell>
                  <TableCell>Borç</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleSearchRows.length > 0 ? (
                  visibleSearchRows.map((searchs) => (
                    <TableRow key={searchs.id}>
                      <TableCell>{formatDate(searchs.date)}</TableCell>
                      <TableCell>{searchs.worksite?.name || '-'}</TableCell>
                      <TableCell>{searchs.group?.name || '-'}</TableCell>
                      <TableCell>{searchs.company?.name || '-'}</TableCell>
                      <TableCell>{searchs.customer?.name || '-'}</TableCell>
                      <TableCell>{searchs.bank || '-'}</TableCell>
                      <TableCell>{searchs.check_no || '-'}</TableCell>
                      <TableCell>{formatDate(searchs.check_time)}</TableCell>
                      <TableCell>{searchs.material || '-'}</TableCell>
                      <TableCell>{searchs.quantity || '-'}</TableCell>
                      <TableCell>{formatNumber(searchs.unit_price)}</TableCell>
                      <TableCell>{formatNumber(searchs.price)}</TableCell>
                      <TableCell>{searchs.tax || '-'}</TableCell>
                      <TableCell>{searchs.withholding || '-'}</TableCell>
                      <TableCell>{formatNumber(searchs.receivable) || '-'}</TableCell>
                      <TableCell>{formatNumber(searchs.debt) || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <Typography variant="body1" py={2}>
                        {searchQuery3 ? 'Arama kriterlerinize uygun fatura kaydı bulunamadı.' : 'Henüz fatura kaydı bulunmamaktadır.'}
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
            count={filteredSearchs.length}
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

export default SearchPage;
