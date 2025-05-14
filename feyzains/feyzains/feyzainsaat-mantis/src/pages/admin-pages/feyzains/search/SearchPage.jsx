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
import FilterListIcon from '@mui/icons-material/FilterList';
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
import EditSearch from './EditSearch';
import ViewSearch from './ViewSearch';
import { AuthContext } from 'contexts/auth/AuthContext';
import * as XLSX from 'xlsx';

const formatDateLocal = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
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
  const { searchs, count, loading, error, fetchSearchs, deleteSearch } = useContext(PaymentEntryInvoiceContext);
  const { fetchUser } = useContext(AuthContext);
  const { fetchCompanies, companies } = useContext(CompanyContext);
  const { fetchWorksites, worksites } = useContext(WorksiteContext);
  const { fetchGroups, groups } = useContext(GroupContext);
  const { fetchCustomers, customers } = useContext(CustomerContext);

  const [searchWorsite, setSearchWorksite] = useState('');
  const [searchGroup, setSearchGroup] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchBank, setSearchBank] = useState('');
  const [searchCheckNo, setSearchCheckNo] = useState('');

  const [searchMaterial, setSearchMaterial] = useState('');
  const [searchQuantity, setSearchQuantity] = useState('');
  const [searchUnitPrice, setSearchUnitPrice] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [searchTax, setSearchTax] = useState('');
  const [searchWithholding, setSearchWithholding] = useState('');
  const [searchReceivable, setSearchReceivable] = useState('');
  const [searchDebt, setSearchDebt] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditSearchDialogOpen, setIsEditSearchDialogOpen] = useState(false);

  const [isViewSearchDialogOpen, setIsViewSearchDialogOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSearchId, setSelectedSearchId] = useState(null);

  const [searchQuery3, setSearchQuery3] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
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
    fetchSearchs({
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

  const handleEditSearchClick = (id) => {
    setSelectedSearchId(id);
    setIsEditSearchDialogOpen(true);
  };

  const handleViewSearchClick = (id) => {
    setSelectedSearchId(id);
    setIsViewSearchDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewSearchDialogOpen(false);
    setSelectedSearchId(null);
  };
  const handleCloseEditDialog = () => {
    setIsEditSearchDialogOpen(false);
    setSelectedSearchId(null);
  };

  const handleDeleteSearch = async (id) => {
    if (window.confirm('Bu Arama kaydını silmek istediğinizden emin misiniz?')) {
      try {
        const response = await deleteSearch(id);
        if (response && response.success) {
          toast.success('Arama kaydı başarıyla silindi');
          fetchSearchs({
            page: page,
            pageSize: rowsPerPage,
            orderBy: orderBy,
            order: order
          });
        } else {
          toast.error(response?.error || 'Arama kaydı silinemedi');
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
    const formattedStart = formatDateLocal(startDate);
    const formattedEnd = formatDateLocal(endDate);
    fetchSearchs({
      page: page,
      pageSize: rowsPerPage,
      orderBy: orderBy,
      order: order,
      worksite: searchWorsite,
      group: searchGroup,
      company: searchCompany,
      customer: searchCustomer,
      startDate: formattedStart,
      endDate: formattedEnd,
      bank: searchBank,
      check_no: searchCheckNo,
      material: searchMaterial,
      quantity: searchQuantity,
      unit_price: searchUnitPrice,
      price: searchPrice,
      tax: searchTax,
      withholding: searchWithholding,
      receivable: searchReceivable,
      debt: searchDebt
    });
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

  // PDF'e aktarma fonksiyonu
  const exportToPdf = () => {
    try {
      if (!searchs || searchs.length === 0) {
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
      doc.setFontSize(14);
      doc.text('Arama Kayıtları', 14, 15);

      // Tarih
      doc.setFontSize(9);
      const today = new Date().toLocaleDateString('tr-TR');
      doc.text(`Oluşturma Tarihi: ${today}`, 14, 22);

      // Tablo konfigürasyonu - Türkçe karakterli başlıklar
      const headers = [
        'Tarih',
        'Şantiye',
        'Grup',
        'Şirk.',
        'Müşt.',
        'Banka',
        'Çek No',
        'Vade',
        'Malzeme',
        'Adet',
        'Birim ₺',
        'Tutar',
        'KDV',
        'Tevk.',
        'Alacak',
        'Borç'
      ];
      const columnWidths = [27, 25, 45, 35, 35, 25, 20, 28, 25, 24, 20, 25, 20, 20, 25, 25]; // Kolon genişlikleri
      const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);
      const marginX = (doc.internal.pageSize.getWidth() - totalTableWidth) / 2;

      // Veri hazırlama
      const filteredData = searchs.map((paymentEntryInvoice) => [
        formatDate(paymentEntryInvoice.date),
        paymentEntryInvoice.worksite?.name || '-',
        paymentEntryInvoice.group?.name || '-',
        paymentEntryInvoice.company?.name || '-',
        paymentEntryInvoice.customer?.name || '-',
        paymentEntryInvoice.bank?.name || '-',
        paymentEntryInvoice.check_no || '-', // eklendi
        paymentEntryInvoice.check_time // eklendi
          ? formatDate(paymentEntryInvoice.check_time)
          : '-',
        paymentEntryInvoice.material || '-',
        paymentEntryInvoice.quantity || '-',
        formatNumber(paymentEntryInvoice.unit_price),
        formatNumber(paymentEntryInvoice.price),
        paymentEntryInvoice.tax || '-',
        paymentEntryInvoice.withholding || '-',
        formatNumber(paymentEntryInvoice.receivable) || '-',
        formatNumber(paymentEntryInvoice.debt) || '-' // eklendi
      ]);

      let currentY = 30;
      const cellHeight = 9;

      // ÖNEMLİ: Font kodlamasını UTF-8 olarak ayarla
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(7);

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
      doc.save('Arama_Kayıtları.pdf');
      toast.success('PDF başarıyla oluşturuldu!');
    } catch (error) {
      toast.error('PDF oluşturulurken hata oluştu.');
      console.error('PDF export hatası:', error);
    }
  };

  // IMPORTANT: Using memoized props to pass to child components

  const visibleSearchRows = useMemo(() => {
    return searchs.sort(getComparator(order, orderBy));
  }, [searchs, order, orderBy]);

  // IMPORTANT: Using memoized props to pass to child components
  const viewSearchProps = useMemo(
    () => ({
      open: isViewSearchDialogOpen,
      onClose: handleCloseViewDialog,
      searchId: selectedSearchId
    }),
    [isViewSearchDialogOpen, selectedSearchId]
  );

  const editSearchProps = useMemo(
    () => ({
      open: isEditSearchDialogOpen,
      onClose: handleCloseEditDialog,
      searchId: selectedSearchId
    }),
    [isEditSearchDialogOpen, selectedSearchId]
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
          ARAMA FİLTRELEME
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
                value={searchWorsite}
                onChange={(e) => setSearchWorksite(e.target.value)}
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
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
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
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
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
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
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
              <Typography variant="subtitle2">Banka</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Banka Ara..."
                value={searchBank}
                onChange={(e) => setSearchBank(e.target.value)}
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
              <Typography variant="subtitle2">Çek No</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Çek No Ara..."
                value={searchCheckNo}
                onChange={(e) => setSearchCheckNo(e.target.value)}
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
              <Typography variant="subtitle2">Malzeme</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Malzeme Ara..."
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
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
              <Typography variant="subtitle2">Adet</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Adet Ara..."
                value={searchQuantity}
                onChange={(e) => setSearchQuantity(e.target.value)}
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
              <Typography variant="subtitle2">Birim Fiyatı</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Birim Fiyat Ara..."
                value={searchUnitPrice}
                onChange={(e) => setSearchUnitPrice(e.target.value)}
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
              <Typography variant="subtitle2">Tutar</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Tutar Ara..."
                value={searchPrice}
                onChange={(e) => setSearchPrice(e.target.value)}
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
              <Typography variant="subtitle2">KDV</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="KDV Ara..."
                value={searchTax}
                onChange={(e) => setSearchTax(e.target.value)}
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
              <Typography variant="subtitle2">Tevkifat</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Tevkifat Ara..."
                value={searchWithholding}
                onChange={(e) => setSearchWithholding(e.target.value)}
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
              <Typography variant="subtitle2">Alacak</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Alacak Ara..."
                value={searchReceivable}
                onChange={(e) => setSearchReceivable(e.target.value)}
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
              <Typography variant="subtitle2">Borç</Typography>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Borç Ara..."
                value={searchDebt}
                onChange={(e) => setSearchDebt(e.target.value)}
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

            <Box display="flex" flexDirection="row" minWidth={200} gap={1}>
              <Box display="flex" flexDirection="column" gap={1} minWidth={400}>
                <Typography variant="subtitle2">Çek Vade</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                  <Box display="flex" gap={2}>
                    <DatePicker
                      label="Başlangıç"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{
                        textField: {
                          size: 'medium',
                          variant: 'outlined',
                          fullWidth: true
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
                          variant: 'outlined',
                          fullWidth: true
                        }
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </Box>
            </Box>
          </Box>

          {/* Sağ taraf: Filtrele butonu */}
          <Box display="flex" alignItems="flex-end">
            <Button
              variant="contained"
              size="medium"
              onClick={handleFilter}
              startIcon={<FilterListIcon />}
              sx={{
                backgroundColor: '#E99AC4',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#EA6560',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                },
                fontWeight: 'bold',
                px: 3,
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Filtrele
            </Button>
          </Box>
        </Box>
      </Paper>

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
          {isEditSearchDialogOpen && selectedSearchId && <EditSearch {...editSearchProps} />}

          {isViewSearchDialogOpen && selectedSearchId && <ViewSearch {...viewSearchProps} />}

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
                  <TableCell align="right">İşlemler</TableCell>
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
                      <TableCell align="right">
                        <Tooltip title="Detay">
                          <IconButton onClick={() => handleViewSearchClick(searchs.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip title="Düzenle">
                              <IconButton onClick={() => handleEditSearchClick(searchs.id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton onClick={() => handleDeleteSearch(searchs.id)}>
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

export default SearchPage;
