import React, { useContext, useState, useMemo, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { AuthContext } from 'contexts/auth/AuthContext';
import { OrderContext } from "contexts/admin/OrderContext";
import { SellerContext } from "contexts/admin/SellerContext";
import { CustomerContext } from "contexts/admin/CustomerContext";
import EditOrderPage from "./EditOrderPage";
import ViewOrderPage from "./ViewOrderPage";
import CreateOrderPage from "./CreateOrderPage";
import * as XLSX from "xlsx";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignWarehousePopup from "./AssignWarehousePopup";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { generateInvoicePDF } from "../../../utils/invoiceGenerator";



const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("tr-TR", options);
  };
  
  const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) return "-";
    return `${Number(number).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  

const OrdersPage = () => {

const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todayEnd = new Date();
todayEnd.setHours(23, 59, 59, 999);
// Context
const {
    orders,
    orderCount,
    fetchOrders,
    deleteOrder,
    cancelOrder,
    updateOrder,
  } = useContext(OrderContext)
const { sellers, fetchSellers } = useContext(SellerContext);
const { customers, fetchCustomers } = useContext(CustomerContext);
const { fetchUser } = useContext(AuthContext);    
const [order, setOrder] = useState("desc");
const [orderBy, setOrderBy] = useState("creation_date");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = useState(false);
const [isViewOrderDialogOpen, setIsViewOrderDialogOpen] = useState(false);
const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false);
const [selectedOrderId, setSelectedOrderId] = useState(null);
const [searchQuery, setSearchQuery] = useState("");
const [isAdmin, setIsAdmin] = useState(false);
const [isWarehouse, setIsWarehouse] = useState(false);
const [isWarehouseManager, setIsWarehouseManager] = useState(false);
const [userId, setUserId] = useState("");
const [filterSeller, setFilterSeller] = useState("");
const [filterCustomer, setFilterCustomer] = useState("");
const [filterPaymentType, setFilterPaymentType] = useState("");
const [filterDateRange, setFilterDateRange] = useState([todayStart, todayEnd]);
const [showCalendar, setShowCalendar] = useState(false);
const [selectedOrderForWarehouse, setSelectedOrderForWarehouse] = useState(null);
const [isAssignWarehouseOpen, setIsAssignWarehouseOpen] = useState(false);
const [hourRange, setHourRange] = useState(""); // "", "1", "3", "6", "12"





useEffect(() => {
  const initializeUser = async () => {
    const user = await fetchUser();

    if (user) {
      console.log('user', user);
      setUserId(user.id)
      if (user.groups.includes('Admin') || user.is_superuser) {
        setIsAdmin(true)
      }
      else if (user.groups.includes('Warehouse')){
        if(user.is_warehouse_manager){
          setIsWarehouseManager(true)
        }
        else{
          setIsWarehouse(true)
        }
      }
    }
  };

  initializeUser();
}, []);

useEffect(() => {
  fetchOrders({
    page: page + 1, // Sayfa numarasını 1 artırıyoruz çünkü API genellikle 1'den başlar
    pageSize: rowsPerPage, // Her sayfada gösterilecek satır sayısı
    search: searchQuery,  // Arama sorgusu
    seller: filterSeller, // Satıcı filtresi
    customer: filterCustomer, // Müşteri filtresi
    paymentType: filterPaymentType, // Ödeme türü filtresi
    startDate: filterDateRange[0], // Başlangıç tarihi filtresi
    endDate: filterDateRange[1], // Bitiş tarihi filtresi
    hourRange: hourRange, // Saat aralığı filtresi
  });
}, [page, rowsPerPage, searchQuery, filterSeller, filterCustomer, filterPaymentType, filterDateRange]);



useEffect(() => {
  fetchSellers();
  fetchCustomers();
}, []);


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    console.log("newPage", newPage)
    setPage(newPage); // Yeni sayfa numarasını kaydet
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Yeni satır sayısını kaydet
    setPage(0); // Sayfa numarasını sıfırlıyoruz çünkü satır sayısı değişti
  };

  
  const handleEditOrderClick = (id) => {
    setSelectedOrderId(id);
    setIsEditOrderDialogOpen(true);
  };

  const handleViewOrderClick = (id) => {
    setSelectedOrderId(id);
    setIsViewOrderDialogOpen(true);
  };

  const handleEditOrder = () => {
    setIsEditOrderDialogOpen(false);
    setSelectedOrderId(null);
    fetchOrders({
      page: page + 1, // Sayfa numarasını 1 artırıyoruz çünkü API genellikle 1'den başlar
      pageSize: rowsPerPage, // Her sayfada gösterilecek satır sayısı
      search: searchQuery,  // Arama sorgusu
      seller: filterSeller, // Satıcı filtresi
      customer: filterCustomer, // Müşteri filtresi
      paymentType: filterPaymentType, // Ödeme türü filtresi
      startDate: filterDateRange[0], // Başlangıç tarihi filtresi
      endDate: filterDateRange[1], // Bitiş tarihi filtresi
      hourRange: hourRange, // Saat aralığı filtresi
    });
  };

  const handleViewOrder = () => {
    setIsViewOrderDialogOpen(false);
    setSelectedOrderId(null);
    fetchOrders({
      page: page + 1, // Sayfa numarasını 1 artırıyoruz çünkü API genellikle 1'den başlar
      pageSize: rowsPerPage, // Her sayfada gösterilecek satır sayısı
      search: searchQuery,  // Arama sorgusu
      seller: filterSeller, // Satıcı filtresi
      customer: filterCustomer, // Müşteri filtresi
      paymentType: filterPaymentType, // Ödeme türü filtresi
      startDate: filterDateRange[0], // Başlangıç tarihi filtresi
      endDate: filterDateRange[1], // Bitiş tarihi filtresi
      hourRange: hourRange, // Saat aralığı filtresi
    });
  };


  const handleCreateOrder = () => {
    setIsCreateOrderDialogOpen(false)
    fetchOrders({
      page: page + 1, // Sayfa numarasını 1 artırıyoruz çünkü API genellikle 1'den başlar
      pageSize: rowsPerPage, // Her sayfada gösterilecek satır sayısı
      search: searchQuery,  // Arama sorgusu
      seller: filterSeller, // Satıcı filtresi
      customer: filterCustomer, // Müşteri filtresi
      paymentType: filterPaymentType, // Ödeme türü filtresi
      startDate: filterDateRange[0], // Başlangıç tarihi filtresi
      endDate: filterDateRange[1], // Bitiş tarihi filtresi
      hourRange: hourRange, // Saat aralığı filtresi
    });
  };

  const handleAssignWarehouse = () => {
    setIsAssignWarehouseOpen(false);
    setSelectedOrderForWarehouse(null);
    fetchOrders({
      page: page + 1, // Sayfa numarasını 1 artırıyoruz çünkü API genellikle 1'den başlar
      pageSize: rowsPerPage, // Her sayfada gösterilecek satır sayısı
      search: searchQuery,  // Arama sorgusu
      seller: filterSeller, // Satıcı filtresi
      customer: filterCustomer, // Müşteri filtresi
      paymentType: filterPaymentType, // Ödeme türü filtresi
      startDate: filterDateRange[0], // Başlangıç tarihi filtresi
      endDate: filterDateRange[1], // Bitiş tarihi filtresi
      hourRange: hourRange, // Saat aralığı filtresi
    });
  };
  
  const handleDeleteOrder = async (id) => {
    if (window.confirm("Bu siparişi silmek istediğinizden emin misiniz?")) {
      const response = await deleteOrder(id);
      if (response.success) {
        toast.success("Sipariş başarıyla silindi");
        fetchOrders({
          page: page + 1, // Sayfa numarasını 1 artırıyoruz çünkü API genellikle 1'den başlar
          pageSize: rowsPerPage, // Her sayfada gösterilecek satır sayısı
          search: searchQuery,  // Arama sorgusu
          seller: filterSeller, // Satıcı filtresi
          customer: filterCustomer, // Müşteri filtresi
          paymentType: filterPaymentType, // Ödeme türü filtresi
          startDate: filterDateRange[0], // Başlangıç tarihi filtresi
          endDate: filterDateRange[1], // Bitiş tarihi filtresi
          hourRange: hourRange, // Saat aralığı filtresi
        });
      } else {
        toast.error(response.error || "Sipariş silinemedi");
      }
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) {
      let cancelData = {
        id: id,
        type: "cancel",
      };
      const response = await cancelOrder(cancelData);
      console.log(response)
      if (response.success) {
        toast.success("Sipariş iptal edildi.");
        fetchOrders({
          page: page + 1, // Sayfa numarasını 1 artırıyoruz çünkü API genellikle 1'den başlar
          pageSize: rowsPerPage, // Her sayfada gösterilecek satır sayısı
          search: searchQuery,  // Arama sorgusu
          seller: filterSeller, // Satıcı filtresi
          customer: filterCustomer, // Müşteri filtresi
          paymentType: filterPaymentType, // Ödeme türü filtresi
          startDate: filterDateRange[0], // Başlangıç tarihi filtresi
          endDate: filterDateRange[1], // Bitiş tarihi filtresi
          hourRange: hourRange, // Saat aralığı filtresi
        });
      } else {
        toast.error(response.message || "Sipariş iptal edilemedi.");
      }
    }
  };


  const handleAssignWarehouseClick= (order) => {
    setSelectedOrderForWarehouse(order);
    setIsAssignWarehouseOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrder({ id: orderId, status: newStatus, type: "status" });
    if (res.success) {
      toast.success("Durum güncellendi");
      fetchOrders();
    } else {
      toast.error("Durum güncellenemedi");
    }
  };

  const exportAllOrdersToExcel = async () => {
    try {
      if (!filteredOrders || filteredOrders.length === 0) {
        toast.warning("Excel için filtrelenmiş sipariş verisi bulunamadı!");
        return;
      }
      console.log("order is: ", filteredOrders)
      const data = filteredOrders.map((order) => ({
        "TARİH": formatDate(order.creation_date),
        "SATICI": `${order.seller?.user?.first_name || ""} ${order.seller?.user?.last_name || ""}`,
        "ÖDEME YÖNTEMİ": order.payment_type,
        "ÜRÜN KODLARI": order.order_products
          ?.slice(0, 3)
          .map((op) => op.product?.code)
          .filter(Boolean)
          .join(", "),
        "ÇIKAN ÜRÜN KODLARI": order.order_products
          ?.flatMap((op) =>
            op.extracted_products?.map((ep) => ep.product?.code) || []
          )
          .filter(Boolean)
          .slice(0, 3) // sadece ilk 3 tanesini al
          .join(", "),
        "ÜRÜNLER": order.order_products
          ?.slice(0, 3)
          .map((op) => op.product?.name)
          .filter(Boolean)
          .join(", "),
        "ÇIKAN ÜRÜNLER": order.order_products
          ?.flatMap((op) =>
            op.extracted_products?.map((ep) => ep.product?.name) || []
          )
          .filter(Boolean)
          .slice(0, 3) // sadece ilk 3 tanesini al
          .join(", "),
        "KONSİNYELER": order.order_products
          ?.slice(0, 3)
          .map((op) => formatNumber(op.product?.consignment))
          .filter(Boolean)
          .join(" - "),
        "ÇIKAN KONSİNYELER": order.order_products
          ?.flatMap((op) =>
            op.extracted_products?.map((ep) => ep.product?.consignment) || []
          )
          .filter(Boolean)
          .slice(0, 3) // sadece ilk 3 tanesini al
          .join(", "),
        "TUTAR": formatNumber(order.price),
        "DURUM": order.status,
        "MUSTERI": order.customer?.name || "",
        "MUSTERI TELEFON": order.customer?.phone || "",
        "MUSTERI İL": order.customer?.city || "",
        "MUSTERI İLÇE": order.customer?.district || "",
        "MUSTERI ADRES": order.customer?.address || "",
        "VERGİ NO": order.customer?.tax_number || "",
        "VERGİ DAİRESİ": order.customer?.tax_office || "",
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(data);
  
      worksheet["!cols"] = [
        { wch: 15 }, // TARİH
        { wch: 25 }, // SATICI
        { wch: 20 }, // ÖDEME YÖNTEMİ
        { wch: 50 }, // ÜRÜN KODLARI
        { wch: 50 }, // ÇIKAN ÜRÜN KODLARI
        { wch: 140 }, // ÜRÜNLER
        { wch: 140 }, // ÇIKAN ÜRÜNLER
        { wch: 50 }, // KONSİNYELER
        { wch: 50 }, // ÇIKAN KONSİNYELER
        { wch: 15 }, // TUTAR
        { wch: 20 }, // DURUM
        { wch: 25 }, // MUSTERI
        { wch: 25 }, // MUSTERI TELEFON
        { wch: 15 }, // İL
        { wch: 20 }, // İLÇE
        { wch: 70 }, // ADRES
        { wch: 20 }, // VERGİ NO
        { wch: 25 }, // VERGİ DAİRESİ
      ];
  
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Siparişler");
  
      XLSX.writeFile(workbook, "filtreli_siparis_listesi.xlsx");
      toast.success("Filtrelenmiş Sipariş Excel'i başarıyla oluşturuldu!");
    } catch (error) {
      toast.error("Excel oluşturulurken hata oluştu.");
      console.error(error);
    }
  };

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     if (isWarehouse && userId) {
  //       fetchOrders({ page: page + 1, pageSize: rowsPerPage, search: searchQuery });
  //     }
  //   }, 500); // 500 ms bekle, ardından verileri çek
  
  //   return () => clearTimeout(delayDebounceFn); // Önceki timeout'u temizle
  // }, [searchQuery, page, rowsPerPage, isWarehouse, userId]);
  
  

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order?.status.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeller = filterSeller ? order?.seller?.id === filterSeller : true;
      const matchesCustomer = filterCustomer ? order?.customer?.id === filterCustomer : true;
      const matchesPayment = filterPaymentType ? order?.payment_type === filterPaymentType : true;
  
      const [start, end] = filterDateRange;
      const orderDate = new Date(order?.creation_date);
      let matchesDate = true;
      if (hourRange) {
        const now = new Date();
        const past = new Date(now.getTime() - parseInt(hourRange) * 60 * 60 * 1000);
        matchesDate = orderDate >= past && orderDate <= now;
      } else if (start && end) {
        matchesDate = orderDate >= start && orderDate <= end;
      }
  
      const matchesWarehouse = isWarehouse ? order?.warehouse?.user?.id === userId : true;
  
      return matchesSearch && matchesSeller && matchesCustomer && matchesPayment && matchesDate && matchesWarehouse;
    });
  }, [orders, searchQuery, filterSeller, filterCustomer, filterPaymentType, filterDateRange, isWarehouse, userId, hourRange]);
  
  
  
  const visibleOrderRows = useMemo(() => {
      return orders.sort(getComparator(order, orderBy));
    }, [orders, order, orderBy]);


  const paymentTypeCounts = useMemo(() => {
    const counts = {};
    filteredOrders.forEach((order) => {
      const type = order.payment_type || "Bilinmeyen";
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [filteredOrders]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2} gap={2}>
        {/* SOL: Ödeme Türü Dağılımı */}
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          {Object.entries(paymentTypeCounts).map(([type, count]) => (
            <Typography key={type} variant="body1">
              <strong>{type}:</strong> {count}
            </Typography>
          ))}
        </Box>

        {/* SAĞ: Filtreler ve Butonlar */}
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Satıcı</InputLabel>
            <Select value={filterSeller} label="Satıcı" onChange={(e) => setFilterSeller(e.target.value)}>
              <MenuItem value="">Tümü</MenuItem>
              {sellers.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.user.first_name} {s.user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Ödeme</InputLabel>
            <Select value={filterPaymentType} label="Ödeme" onChange={(e) => setFilterPaymentType(e.target.value)}>
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="Nejat">Nejat</MenuItem>
              <MenuItem value="Han">Han</MenuItem>
              <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ position: "relative" }}>
            <TextField
              size="small"
              label="Tarih Aralığı"
              value={
                filterDateRange[0] && filterDateRange[1]
                  ? `${filterDateRange[0].toLocaleDateString("tr-TR")} - ${filterDateRange[1].toLocaleDateString("tr-TR")}`
                  : ""
              }
              onClick={() => setShowCalendar(!showCalendar)}
              InputProps={{ readOnly: true }}
            />
            {showCalendar && (
              <Box sx={{ position: "absolute", zIndex: 10, mt: 1 }}>
                <Calendar
                  selectRange
                  onChange={(range) => {
                    setFilterDateRange(range);
                    setShowCalendar(false);
                  }}
                  value={filterDateRange}
                />
              </Box>
            )}
          </Box>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Saat Aralığı</InputLabel>
            <Select
              value={hourRange}
              label="Saat Aralığı"
              onChange={(e) => {
                setHourRange(e.target.value);
                setFilterDateRange([null, null]);
              }}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="1">Son 1 Saat</MenuItem>
              <MenuItem value="3">Son 3 Saat</MenuItem>
              <MenuItem value="6">Son 6 Saat</MenuItem>
              <MenuItem value="12">Son 12 Saat</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" color="secondary" size="small" onClick={exportAllOrdersToExcel}>
            Excel'e Aktar
          </Button>
          {(!isAdmin && !(isWarehouse || isWarehouseManager)) && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateOrderDialogOpen(true)}
          >
            Sipariş Ekle
          </Button>)}
        </Box>
      </Box>
      <CreateOrderPage open={isCreateOrderDialogOpen} onClose={() => handleCreateOrder()} />
      {isEditOrderDialogOpen && selectedOrderId && (
        <EditOrderPage
            open={isEditOrderDialogOpen}
            onClose={() => handleEditOrder()}
            orderId={selectedOrderId}
        />
       )}
       {isViewOrderDialogOpen && selectedOrderId && (
        <ViewOrderPage
            open={isViewOrderDialogOpen}
            onClose={() => handleViewOrder()}
            orderId={selectedOrderId}
        />
       )}
       {selectedOrderForWarehouse && (
        <AssignWarehousePopup
          open={isAssignWarehouseOpen}
          onClose={() => handleAssignWarehouse()}
          order={selectedOrderForWarehouse}
        />
      )}
      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Satıcı</TableCell>
                <TableCell>Ödeme Yöntemi</TableCell>
                <TableCell>Ürünler</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleOrderRows.map((order) => (
              <TableRow key={order?.id}>
              <TableCell>{order?.creation_date ? formatDate(order.creation_date) : "-"}</TableCell>
              <TableCell>{order?.seller?.user?.first_name} {order?.seller?.user?.last_name}</TableCell>
              <TableCell>{order?.payment_type}</TableCell>
              <TableCell>
                {order?.order_products?.slice(0, 3).map((op) => op.product?.name).filter(Boolean).join(", ") || "-"}
              </TableCell>
              <TableCell>{formatNumber(order?.price)}</TableCell>
              <TableCell>
                {isWarehouse ? (
                  <FormControl fullWidth size="small" variant="standard">
                    <Select
                      value={order?.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <MenuItem value="Beklemede">Beklemede</MenuItem>
                      <MenuItem value="Hazırlanıyor">Hazırlanıyor</MenuItem>
                      <MenuItem value="Kargoda">Kargoda</MenuItem>
                      <MenuItem value="İptal">İptal</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography>{order?.status || "Bilinmiyor"}</Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Detay">
                  <IconButton onClick={() => handleViewOrderClick(order.id)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>

                {((isAdmin || userId === order?.seller?.user?.id) && !(isWarehouse || isWarehouseManager)) && (
                  <Tooltip title="İptal">
                    <IconButton onClick={() => handleCancelOrder(order.id)}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {isWarehouseManager && (
                  <Tooltip title="Depocu Ata">
                    <IconButton onClick={() => handleAssignWarehouseClick(order)}>
                      <AssignmentIndIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {isAdmin && (
                  <Tooltip title="İrsaliye İndir">
                    <IconButton onClick={() => generateInvoicePDF(order)}>
                      <PictureAsPdfIcon />
                    </IconButton>
                  </Tooltip>
                )}
                    
                  {/* <Tooltip title="Düzenle">
                  <IconButton onClick={() => handleEditOrderClick(order.id)}>
                        <EditIcon />
                  </IconButton>
                  </Tooltip> */}
                  
                  {/* <Tooltip title="Sil">
                    <IconButton onClick={() => handleDeleteOrder(order.id)}>
                        <DeleteIcon />
                    </IconButton>
                  </Tooltip> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 75, 100]}
        component="div"
        count={orderCount} // Toplam sipariş sayısı
        rowsPerPage={rowsPerPage} // Sayfa başına gösterilecek sipariş sayısı
        page={page} // Geçerli sayfa numarası
        onPageChange={handleChangePage} // Sayfa değiştirme işlemi
        onRowsPerPageChange={handleChangeRowsPerPage} // Satır sayısı değiştirme işlemi
      />
    </Box>
  );
};

export default OrdersPage;