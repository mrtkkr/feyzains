import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import { SellerContext } from "contexts/admin/SellerContext";
import { ReportContext } from "contexts/admin/ReportContext";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";



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

const ReportPage = () => {
  const { sellers, fetchSellers } = useContext(SellerContext);
  const { fetchReports, reports, reportCount } = useContext(ReportContext);

  const [selectedSeller, setSelectedSeller] = useState("");
  const [actionType, setActionType] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [page, setPage] = useState(0);  // Sayfa numarasını saklamak için
  const [rowsPerPage, setRowsPerPage] = useState(10);  // Sayfa başına satır sayısını saklamak için
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("creation_date");


  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateRange([startOfMonth, endOfMonth]);
    // Otomatik sorgulama
    const filters = {
      seller: "",
      action_type: "",
      start_date: startOfMonth.toISOString(),
      end_date: endOfMonth.toISOString(),
    };
    fetchReports(filters, page + 1, rowsPerPage);
    console.log("here the reports: ", reports)  // Sayfa ve satır sayısını ekleyin
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const getActionLabel = (type) => {
    switch (type) {
      case "create":
        return "Oluşturma";
      case "cancel":
        return "İptal";
      case "update":
        return "Durum Güncelleme";
      default:
        return "Bilinmeyen";
    }
  };

  const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) return "-";
    return `${Number(number).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleFilter = async () => {
    const [startDate, endDate] = dateRange;

    const filters = {
      seller: selectedSeller,
      action_type: actionType,
      start_date: startDate ? startDate.toISOString() : null,
      end_date: endDate ? endDate.toISOString() : null,
    };

    const response = await fetchReports(filters);
    if (response?.length >= 0) setFilteredReports(response);
  };

  const exportReportsToExcel = () => {
    if (!filteredReports || filteredReports.length === 0) {
      toast.warning("Excel'e aktarılacak rapor verisi bulunamadı!");
      return;
    }
  
    const data = filteredReports.map((report) => ({
      "SATICI": `${report.seller.user.first_name} ${report.seller.user.last_name}`,
      "İŞLEM": getActionLabel(report.action_type),
      "ÜRÜN KODLARI": report.order.order_products
        ?.slice(0, 3)
        .map((op) => op.product?.code)
        .filter(Boolean)
        .join(", "),
      "ÇIKAN ÜRÜN KODLARI": report.order.order_products
        ?.flatMap((op) =>
          op.extracted_products?.map((ep) => ep.product?.code) || []
        )
        .filter(Boolean)
        .slice(0, 3) // sadece ilk 3 tanesini al
        .join(", "),
      "ÜRÜNLER": report.order.order_products
        ?.slice(0, 3)
        .map((op) => op.product?.name)
        .filter(Boolean)
        .join(", "),
      "ÇIKAN ÜRÜNLER": report.order.order_products
        ?.flatMap((op) =>
          op.extracted_products?.map((ep) => ep.product?.name) || []
        )
        .filter(Boolean)
        .slice(0, 3) // sadece ilk 3 tanesini al
        .join(", "),
      "KONSİNYELER": report.order.order_products
        ?.slice(0, 3)
        .map((op) => formatNumber(op.product?.consignment))
        .filter(Boolean)
        .join(" - "),
      "ÇIKAN KONSİNYELER": report.order.order_products
        ?.flatMap((op) =>
          op.extracted_products?.map((ep) => ep.product?.consignment) || []
        )
        .filter(Boolean)
        .slice(0, 3) // sadece ilk 3 tanesini al
        .join(", "),
      "TUTAR": formatNumber(report.order.price),
      "DURUM": report.order.status,
      "MUSTERI": report.order.customer?.name || "",
      "MUSTERI TELEFON": report.order.customer?.phone || "",
      "MUSTERI İL": report.order.customer?.city || "",
      "MUSTERI İLÇE": report.order.customer?.district || "",
      "MUSTERI ADRES": report.order.customer?.address || "",
      "VERGİ NO": report.order.customer?.tax_number || "",
      "VERGİ DAİRESİ": report.order.customer?.tax_office || "",
      "TARİH": new Date(report.creation_date).toLocaleString("tr-TR"),
    }));
    
  
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    worksheet["!cols"] = [
      { wch: 25 },  // SATICI
      { wch: 20 },  // İŞLEM
      { wch: 50 },  // ÜRÜN KODLARI
      { wch: 50 },  // ÇIKAN ÜRÜN KODLARI
      { wch: 140 }, // ÜRÜNLER
      { wch: 140 }, // ÇIKAN ÜRÜNLER
      { wch: 50 },  // KONSİNYELER
      { wch: 50 },  // ÇIKAN KONSİNYELER
      { wch: 15 },  // TUTAR
      { wch: 20 },  // DURUM
      { wch: 25 },  // MUSTERI
      { wch: 25 },  // MUSTERI TELEFON
      { wch: 15 },  // İL
      { wch: 20 },  // İLÇE
      { wch: 70 },  // ADRES
      { wch: 20 },  // VERGİ NO
      { wch: 25 },  // VERGİ DAİRESİ
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sipariş Raporları");
  
    XLSX.writeFile(workbook, "siparis_raporlari.xlsx");
    toast.success("Excel başarıyla oluşturuldu!");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);  // Yeni sayfa numarasını kaydet
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));  // Yeni satır sayısını kaydet
    setPage(0);  // Sayfa numarasını sıfırlıyoruz çünkü satır sayısı değişti
  };

  // Filter reports based on the filters
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSeller = selectedSeller ? report.seller.id === selectedSeller : true;
      const matchesActionType = actionType ? report.action_type === actionType : true;
      const [start, end] = dateRange;
      const reportDate = new Date(report.creation_date);
      let matchesDate = true;
      if (start && end) {
        matchesDate = reportDate >= start && reportDate <= end;
      }

      return matchesSeller && matchesActionType && matchesDate;
    });
  }, [reports, selectedSeller, actionType, dateRange]);


  const visibleReportRows = useMemo(() => {
        return reports.sort(getComparator(order, orderBy));
      }, [reports, order, orderBy]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Sipariş Raporları
      </Typography>
  
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        {/* Tarih Aralığı */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: "relative" }}>
            <TextField
              fullWidth
              label="Tarih Aralığı"
              value={
                dateRange[0] && dateRange[1]
                  ? `${dateRange[0].toLocaleDateString("tr-TR")} - ${dateRange[1].toLocaleDateString("tr-TR")}`
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
                    setDateRange(range);
                    setShowCalendar(false); // seçimden sonra otomatik kapansın
                  }}
                  value={dateRange}
                />
              </Box>
            )}
          </Box>
        </Grid>
  
        {/* İşlem Türü */}
        <Grid item xs={12} md={3}>
            <FormControl fullWidth>
                <InputLabel>İşlem Türü</InputLabel>
                <Select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                label="İşlem Türü"
                >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="create">Oluşturma</MenuItem>
                <MenuItem value="cancel">İptal</MenuItem>
                </Select>
            </FormControl>
        </Grid>

  
        {/* Satıcı Seçimi */}
        <Grid item xs={12} md={3}>
            <FormControl fullWidth>
                <InputLabel>Satıcı</InputLabel>
                <Select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                label="Satıcı"
                >
                <MenuItem value="">Tümü</MenuItem>
                {sellers.map((seller) => (
                    <MenuItem key={seller.id} value={seller.id}>
                    {seller.user.first_name} {seller.user.last_name}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
        </Grid>

  
        {/* Filtre Butonu */}
        <Grid item xs={6} md={1}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleFilter}
          >
            Filtrele
          </Button>
        </Grid>

        <Grid item xs={6} md={1}>
          <Button
            variant="outlined"
            color="success"
            fullWidth
            onClick={exportReportsToExcel}
          >
            Excel
          </Button>
        </Grid>
      </Grid>
  
      {/* Tablo */}
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Satıcı</TableCell>
              <TableCell>İşlem</TableCell>
              <TableCell>Ürün</TableCell>
              <TableCell>Tutar</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Tarih</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {visibleReportRows.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {report.seller.user.first_name} {report.seller.user.last_name}
                  </TableCell>
                  <TableCell>{getActionLabel(report.action_type)}</TableCell>
                  <TableCell>
                    {report.order.order_products
                      .slice(0, 3)
                      .map((op) => op.product?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>
                  <TableCell>{formatNumber(report.order.price)}</TableCell>
                  <TableCell>{report.order.customer.name}</TableCell>
                  <TableCell>
                    {new Date(report.creation_date).toLocaleString("tr-TR")}
                  </TableCell>
                </TableRow>
            ))}
            {filteredReports.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={reportCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Table>
      </Paper>
    </Box>
  );
};

export default ReportPage;
