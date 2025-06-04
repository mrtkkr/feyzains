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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  CircularProgress,
  ListItemText,
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
import { flexbox } from '@mui/system';
import ExcelJS from 'exceljs';

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
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  const [searchFilters, setSearchFilters] = useState({
    startDate: null,
    endDate: null,
    worksite: '',
    group: '',
    company: '',
    customer: '',
    customer_ids: [], // Çoklu seçim için
    bank: '',
    check_no: '',
    material: '',
    quantity: '',
    unit_price: '',
    price: '',
    tax: '',
    withholding: '',
    receivable: '',
    debt: ''
  });

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
  const [selectedCustomers, setSelectedCustomers] = useState([]); // Seçili müşteri ID'leri
  const [selectOpen, setSelectOpen] = useState(false); // Select açık/kapalı durumu

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
      order: order,
      ...searchFilters
    });
  }, [page, rowsPerPage, orderBy, order, searchFilters]);

  useEffect(() => {
    fetchCompanies();
    fetchWorksites();
    fetchGroups();
    fetchCustomers();
  }, []);

  const handleCustomerToggle = (customerId) => {
    setSelectedCustomers((prev) => {
      const isSelected = prev.includes(customerId);
      if (isSelected) {
        // Seçiliyse kaldır
        return prev.filter((id) => id !== customerId);
      } else {
        // Seçili değilse ekle
        return [...prev, customerId];
      }
    });
  };

  

  // Seçimi temizleme fonksiyonu (isteğe bağlı)
  const clearSelection = () => {
    setSelectedCustomers([]);
  };

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
    const formattedStart = startDate?.toISOString().split('T')[0];
    const formattedEnd = endDate?.toISOString().split('T')[0];

    const newFilters = {
      startDate: formattedStart,
      endDate: formattedEnd,
      worksite: searchWorsite,
      group: searchGroup,
      company: searchCompany,
      customer: searchCustomer,
      customer_ids: selectedCustomers, // Çoklu seçim için
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
    };

    setSearchFilters(newFilters); // filtreleri güncelle
    setPage(0); // sayfayı sıfırla
  };
  const handleHideClick = () => {
    const formattedStart = startDate?.toISOString().split('T')[0];
    const formattedEnd = endDate?.toISOString().split('T')[0];

    const newFilters = {
      startDate: formattedStart,
      endDate: formattedEnd,
      worksite: searchWorsite,
      group: searchGroup,
      company: searchCompany || selectedCompany, // Öncelik manuel girilende, yoksa seçilende
      customer: searchCustomer,
      customer_ids: selectedCustomers, // Çoklu seçim için
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
    };

    setSearchFilters(newFilters);
    setPage(0); // Sayfayı sıfırla
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

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ödemeler');

      let currentRow = 1;

      // Sütun tanımları
      const baseColumns = [
        { header: 'Tarih', key: 'tarih', width: 12 },
        { header: 'Şantiye', key: 'santiye', width: 20 },
        { header: 'Grup', key: 'grup', width: 15 },
        { header: 'Şirket', key: 'sirket', width: 20 },
        { header: 'Müşteri', key: 'musteri', width: 20 },
        { header: 'Banka', key: 'banka', width: 15 },
        { header: 'Çek No', key: 'cekNo', width: 15 },
        { header: 'Çek Vade', key: 'cekVade', width: 15 },
        { header: 'Malzeme', key: 'malzeme', width: 15 },
        { header: 'Adet', key: 'adet', width: 12 },
        { header: 'Birim Fiyatı', key: 'birimFiyati', width: 15 },
        { header: 'Tutar', key: 'tutar', width: 15 },
        { header: 'KDV', key: 'kdv', width: 20 },
        { header: 'Tevkifat', key: 'tevkifat', width: 20 },
        { header: 'Alacak', key: 'alacak', width: 20 },
        { header: 'Borç Tutarı', key: 'borcTutari', width: 20 },
        { header: 'Oluşturan', key: 'olusturan', width: 25 }
      ];

      const filteredColumns = baseColumns.filter((col) => {
        if (selectedCompany && col.key === 'sirket') return false;
        if (selectedCustomer && col.key === 'musteri') return false;
        return true;
      });

      // Sütun genişliklerini manuel ayarla
      filteredColumns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = col.width;
      });

      // Şirket ve Müşteri Bilgileri Üste Yazılır
      if (selectedCompany || selectedCustomer) {
        if (selectedCompany) {
          worksheet.getCell(`A${currentRow}`).value = `Seçilen Şirket: ${selectedCompany}`;
          currentRow++;
        }
        if (selectedCustomer) {
          worksheet.getCell(`A${currentRow}`).value = `Seçilen Müşteri: ${selectedCustomer}`;
          currentRow++;
        }
        currentRow++; // boşluk satırı

        // Manuel başlık satırı ekle
        worksheet.getRow(currentRow).values = filteredColumns.map((col) => col.header);
        worksheet.getRow(currentRow).font = { bold: true };
        currentRow++;
      } else {
        // Seçim yoksa normal başlık ekle
        worksheet.getRow(currentRow).values = filteredColumns.map((col) => col.header);
        worksheet.getRow(currentRow).font = { bold: true };
        currentRow++;
      }

      // Verileri ekle
      searchs.forEach((entry) => {
        const rowValues = [];

        filteredColumns.forEach((col) => {
          switch (col.key) {
            case 'tarih':
              rowValues.push(formatDate(entry.date));
              break;
            case 'santiye':
              rowValues.push(entry.worksite?.name || '-');
              break;
            case 'grup':
              rowValues.push(entry.group?.name || '-');
              break;
            case 'sirket':
              rowValues.push(entry.company?.name || '-');
              break;
            case 'musteri':
              rowValues.push(entry.customer?.name || '-');
              break;
            case 'banka':
              rowValues.push(entry.bank || '-');
              break;
            case 'cekNo':
              rowValues.push(entry.check_no || '-');
              break;
            case 'cekVade':
              rowValues.push(entry.check_time ? formatDate(entry.check_time) : '-');
              break;
            case 'malzeme':
              rowValues.push(entry.material || '-');
              break;
            case 'adet':
              rowValues.push(entry.quantity || '-');
              break;
            case 'birimFiyati':
              rowValues.push(formatNumber(entry.unit_price));
              break;
            case 'tutar':
              rowValues.push(formatNumber(entry.price));
              break;
            case 'kdv':
              rowValues.push(entry.tax || '-');
              break;
            case 'tevkifat':
              rowValues.push(entry.withholding || '-');
              break;
            case 'alacak':
              rowValues.push(formatNumber(entry.receivable));
              break;
            case 'borcTutari':
              rowValues.push(formatNumber(entry.debt));
              break;
            case 'olusturan':
              rowValues.push(entry.created_by?.username || '-');
              break;
            default:
              rowValues.push('-');
          }
        });

        worksheet.getRow(currentRow).values = rowValues;
        currentRow++;
      });

      let difference = totalDebt - totalReceivable;
      let balanceStatus = '';

      if (difference < 0) {
        balanceStatus = 'A'; // Alacak
        difference = Math.abs(difference);
      } else if (difference > 0) {
        balanceStatus = 'B'; // Borç
        difference = Math.abs(difference);
      } else {
        balanceStatus = ''; // Eşit
      }

      const formattedDebt = formatNumber(totalDebt);
      const formattedDifference = formatNumber(difference);

      const bakiyeCellText = `Bakiye: ${formattedDifference} (${balanceStatus})`;

      // Toplam satırı
      const totalRowValues = [];
      filteredColumns.forEach((col) => {
        switch (col.key) {
          case 'birimFiyati':
            totalRowValues.push('TOPLAM:');
            break;
          case 'tutar':
            totalRowValues.push(formatNumber(totalPrice));
            break;
          case 'alacak':
            totalRowValues.push(formatNumber(totalReceivable));
            break;
          case 'borcTutari':
            totalRowValues.push(formatNumber(totalDebt));
            break;
          case 'olusturan':
            totalRowValues.push(bakiyeCellText);
          default:
            totalRowValues.push('');
        }
      });

      const totalRow = worksheet.getRow(currentRow);
      totalRow.values = totalRowValues;
      totalRow.font = { bold: true };
      totalRow.alignment = { horizontal: 'center' };


      // Excel dosyasını oluştur ve indir
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Arama_Bolumu.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);

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

      let currentY = 29;

      // Şirket ve Müşteri Bilgileri
      if (selectedCompany || selectedCustomer) {
        if (selectedCompany) {
          doc.text(`Seçilen Şirket: ${selectedCompany}`, 14, currentY);
          currentY += 7;
        }
        if (selectedCustomer) {
          doc.text(`Seçilen Müşteri: ${selectedCustomer}`, 14, currentY);
          currentY += 7;
        }
        currentY += 3; // boşluk
      }

      // Tablo konfigürasyonu - filtrelenmiş başlıklar
      const baseHeaders = [
        { title: 'Tarih', key: 'tarih', width: 27 },
        { title: 'Şantiye', key: 'santiye', width: 25 },
        { title: 'Grup', key: 'grup', width: 45 },
        { title: 'Şirk.', key: 'sirket', width: 35 },
        { title: 'Müşt.', key: 'musteri', width: 35 },
        { title: 'Banka', key: 'banka', width: 25 },
        { title: 'Çek No', key: 'cekNo', width: 20 },
        { title: 'Vade', key: 'cekVade', width: 28 },
        { title: 'Malzeme', key: 'malzeme', width: 25 },
        { title: 'Adet', key: 'adet', width: 24 },
        { title: 'Birim ₺', key: 'birimFiyati', width: 20 },
        { title: 'Tutar', key: 'tutar', width: 25 },
        { title: 'KDV', key: 'kdv', width: 20 },
        { title: 'Tevk.', key: 'tevkifat', width: 20 },
        { title: 'Alacak', key: 'alacak', width: 25 },
        { title: 'Borç', key: 'borcTutari', width: 25 }
      ];

      // Seçilen şirket/müşteriye göre başlıkları filtrele
      const filteredHeaders = baseHeaders.filter((header) => {
        if (selectedCompany && header.key === 'sirket') return false;
        if (selectedCustomer && header.key === 'musteri') return false;
        return true;
      });

      const headers = filteredHeaders.map((h) => h.title);
      const columnWidths = filteredHeaders.map((h) => h.width);
      const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);
      const marginX = (doc.internal.pageSize.getWidth() - totalTableWidth) / 2;

      // Veri hazırlama - filtrelenmiş
      const filteredData = searchs.map((paymentEntryInvoice) => {
        const rowData = [];

        filteredHeaders.forEach((header) => {
          switch (header.key) {
            case 'tarih':
              rowData.push(formatDate(paymentEntryInvoice.date));
              break;
            case 'santiye':
              rowData.push(paymentEntryInvoice.worksite?.name || '-');
              break;
            case 'grup':
              rowData.push(paymentEntryInvoice.group?.name || '-');
              break;
            case 'sirket':
              rowData.push(paymentEntryInvoice.company?.name || '-');
              break;
            case 'musteri':
              rowData.push(paymentEntryInvoice.customer?.name || '-');
              break;
            case 'banka':
              rowData.push(paymentEntryInvoice.bank?.name || '-');
              break;
            case 'cekNo':
              rowData.push(paymentEntryInvoice.check_no || '-');
              break;
            case 'cekVade':
              rowData.push(paymentEntryInvoice.check_time ? formatDate(paymentEntryInvoice.check_time) : '-');
              break;
            case 'malzeme':
              rowData.push(paymentEntryInvoice.material || '-');
              break;
            case 'adet':
              rowData.push(paymentEntryInvoice.quantity || '-');
              break;
            case 'birimFiyati':
              rowData.push(formatNumber(paymentEntryInvoice.unit_price));
              break;
            case 'tutar':
              rowData.push(formatNumber(paymentEntryInvoice.price));
              break;
            case 'kdv':
              rowData.push(paymentEntryInvoice.tax || '-');
              break;
            case 'tevkifat':
              rowData.push(paymentEntryInvoice.withholding || '-');
              break;
            case 'alacak':
              rowData.push(formatNumber(paymentEntryInvoice.receivable) || '-');
              break;
            case 'borcTutari':
              rowData.push(formatNumber(paymentEntryInvoice.debt) || '-');
              break;
            default:
              rowData.push('-');
          }
        });

        return rowData;
      });

      const cellHeight = 12;

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

      // Toplamları hesapla
      let totalPrice = 0;
      let totalReceivable = 0;
      let totalDebt = 0;

      searchs.forEach((entry) => {
        totalPrice += Number(entry.price) || 0;
        totalReceivable += Number(entry.receivable) || 0;
        totalDebt += Number(entry.debt) || 0;
      });

      let differance = totalDebt - totalReceivable;
      let balanceStatus = '';

      if (differance < 0) {
        balanceStatus = 'A'; // Alacak
        differance = Math.abs(differance);
      } else if(differance > 0) {
        balanceStatus = 'B'; // Borç
        differance = Math.abs(differance);
      }
      else {
        balanceStatus = ''; // Eşit
      }

      const formattedDebt = formatNumber(totalDebt);
      const formattedDifference = formatNumber(differance);

      const borcCellText = `${formattedDebt}\nBakiye:\n${formattedDifference} (${balanceStatus})`;



      // "Toplam" satırı ekle - filtrelenmiş
      currentX = marginX;
      const totalRow = [];

      filteredHeaders.forEach((header, i) => {
        switch (header.key) {
          case 'tutar':
            totalRow.push(formatNumber(totalPrice));
            break;
          case 'alacak':
            totalRow.push(formatNumber(totalReceivable));
            break;
          case 'borcTutari':
            totalRow.push(borcCellText);
            break;
          case 'tarih':
            totalRow.push('TOPLAM');
            break;
          default:
            totalRow.push('');
        }
      });


      // Kutuları çiz
      doc.setFontStyle?.('bold'); // Eski sürümde varsa
      doc.setFontSize(9);
      totalRow.forEach((cell, i) => {
        if (filteredHeaders[i].key === 'borcTutari') {
          // Çok satırlı metin için:
          const lines = cell.split('\n');
          lines.forEach((line, index) => {
            doc.text(line, currentX + 4, currentY + 7 + index * 7, {
              charSpace: 0,
              lineHeightFactor: 1,
              maxWidth: columnWidths[i] - 8,
              align: 'left'
            });
          });
        } else {
          // Normal tek satırlı metin
          doc.text(cell.toString(), currentX + 4, currentY + 7, {
            charSpace: 0,
            lineHeightFactor: 1,
            maxWidth: columnWidths[i] - 8,
            align: 'left'
          });
        }
        currentX += columnWidths[i];
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
  const totalPrice = visibleSearchRows.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalReceivable = visibleSearchRows.reduce((sum, item) => sum + (Number(item.receivable) || 0), 0);
  const totalDebt = visibleSearchRows.reduce((sum, item) => sum + (Number(item.debt) || 0), 0);
  const balance = totalDebt - totalReceivable;
  let balanceStatus = '';
  if (balance < 0) {
    balanceStatus = 'A';
  }
  else if (balance > 0) {
    balanceStatus = 'B';
  } 
  else {
    balanceStatus = '';
  }

  return (
    <>
      <Box display="flex">
        <Box sx={{ flexGrow: 1, p: 3, width: '87%' }}>
          {/* burda selectedCompany && de olmalı */}
          {selectedCompany && (
            <Box mb={2} p={2} borderRadius={2}>
              <Typography
                sx={{
                  fontSize: '1.75rem', // Daha büyük font
                  fontWeight: 'bold', // Kalın yazı
                  color: '#1565c0',
                  letterSpacing: '0.1rem', // Harfler arası mesafe
                  mb: 0.5
                }}
              >
                <span style={{ color: '#0d47a1' }}>{selectedCompany}</span>
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Arama Kayıtları
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Şirket Seç</InputLabel>
                  <Select value={selectedCompany} label="Şirket Seç" onChange={(e) => setSelectedCompany(e.target.value)}>
                    <MenuItem value="">Tümü</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.name}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel></InputLabel>
                  <Select
                    multiple
                    value={selectedCustomers}
                    onChange={(e) => setSelectedCustomers(e.target.value)}
                    label="Müşteri Seç"
                    displayEmpty
                    open={selectOpen}
                    onOpen={() => setSelectOpen(true)}
                    onClose={() => setSelectOpen(false)}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: '200px' // 3 müşteri yüksekliği kadar
                        }
                      }
                    }}
                    renderValue={() => {
                      if (selectedCustomers.length === 0) {
                        return 'Müşteri Seçin';
                      }
                      return `${selectedCustomers.length} müşteri seçildi`;
                    }}
                  >
                    {customers.map((customer) => {
                      // Balance değeri string gelebilir, önce Number() ile sayıya çeviriyoruz:
                      const balanceNum = Number(customer.balance || 0);
                      // Negatif işareti kaldırmak için Math.abs():
                      const absBalance = Math.abs(balanceNum);
                      // "₺1.234,56" formatı:
                      const formattedBalance = absBalance.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      });
                      // Backend'den gelen balance_status: 'A', 'B' veya '0'
                      const status = customer.balance_status === 'A' ? 'A' : customer.balance_status === 'B' ? 'B' : '';

                      return (
                        <MenuItem
                          key={customer.id}
                          value={customer.id}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCustomerToggle(customer.id);
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            paddingRight: '16px'
                          }}
                        >
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleCustomerToggle(customer.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <ListItemText primary={`${customer.name} – ${formattedBalance} ${status}`} style={{ marginLeft: '8px' }} />
                        </MenuItem>
                      );
                    })}

                    {/* Filtrele Butonu */}
                    <MenuItem
                      style={{
                        backgroundColor: '#f5f5f5',
                        borderTop: '1px solid #e0e0e0',
                        justifyContent: 'center',
                        marginTop: '8px'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilter();
                        setSelectOpen(false);
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilter();
                          setSelectOpen(false);
                        }}
                      >
                        Filtrele
                      </Button>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Box display="flex" justifyContent="center">
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={handleHideClick} // Butona bir event varsa burada kullanılabilir
                    sx={{ fontWeight: 'bold', width: '100%' }}
                  >
                    Filtrele
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={12} md={4}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={exportToPdf}>
                    PDF'e Aktar
                  </Button>
                  <Button variant="outlined" color="secondary" size="small" onClick={exportToExcel}>
                    Excel'e Aktar
                  </Button>
                </Box>
              </Grid>
            </Grid>
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
                      {(!selectedCustomer && selectedCustomers.length != 1 ) && <TableCell>Müşteri</TableCell>}
                      {!selectedCompany && <TableCell>Şirket</TableCell>}

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
                          {(!selectedCustomer && selectedCustomers.length != 1) && <TableCell>{searchs.customer?.name || '-'}</TableCell>}
                          {!selectedCompany && <TableCell>{searchs.company?.name || '-'}</TableCell>}
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
                    {visibleSearchRows.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={11 - [selectedCompany, selectedCustomer].filter((item) => item !== '').length}
                          sx={{ fontWeight: 'bold' }}
                        ></TableCell>

                        {/* Tutar */}
                        <TableCell sx={{ fontWeight: 'bold' }}>Toplam Tutar:</TableCell>

                        {/* KDV ve Tevkifat */}
                        <TableCell />
                        <TableCell />

                        {/* Alacak */}
                        <TableCell sx={{ fontWeight: 'bold' }}>Toplam Alacak:</TableCell>

                        {/* Borç */}
                        <TableCell sx={{ fontWeight: 'bold' }}>Toplam Borç:</TableCell>

                        {/* İşlemler */}
                        <TableCell sx={{ fontWeight: 'bold' }}>Bakiye:</TableCell>
                      </TableRow>
                    )}

                    {visibleSearchRows.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={11 - [selectedCompany, selectedCustomer].filter((item) => item !== '').length}
                          sx={{ fontWeight: 'bold' }}
                        ></TableCell>

                        {/* Tutar */}
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatNumber(totalPrice)}</TableCell>

                        {/* KDV ve Tevkifat */}
                        <TableCell />
                        <TableCell />

                        {/* Alacak */}
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatNumber(totalReceivable)}</TableCell>

                        {/* Borç */}
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatNumber(totalDebt)}</TableCell>

                        {/* İşlemler */}
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {formatNumber(Math.abs(balance)) + ' ' + balanceStatus} 
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10]}
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
        <Box sx={{ width: '13%' }}>
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
              <Box display="flex" flexWrap="wrap" gap={2}>
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

                <Box display="flex" flexDirection="column" minWidth={200} gap={1}>
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
        </Box>
      </Box>
    </>
  );
};

export default SearchPage;
