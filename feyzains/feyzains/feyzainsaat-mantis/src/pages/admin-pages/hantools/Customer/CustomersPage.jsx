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
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search"; // Arama ikonu için import ekleyelim.
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CustomerContext } from "contexts/admin/CustomerContext";
import EditCustomerPage from "./EditCustomerPage";
import CreateCustomerPage from "./CreateCustomerPage";
import ViewCustomerPage from "./ViewCustomerPage";
import * as XLSX from "xlsx";



const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("tr-TR", options);
};

const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return "-";
  return `₺${Number(number).toLocaleString("tr-TR", {
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

const CustomersPage = () => {
  
// Context
const {
    customers,
    fetchCustomers,
    deleteCustomer,
  } = useContext(CustomerContext);
const [order, setOrder] = useState("asc");
const [orderBy, setOrderBy] = useState("date");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(25);
const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
const [isCreateCustomerDialogOpen, setIsCreateCustomerDialogOpen] = useState(false);
const [isViewCustomerDialogOpen, setIsViewCustomerDialogOpen] = useState(false);
const [selectedCustomerId, setSelectedCustomerId] = useState(null);
const [searchQuery, setSearchQuery] = useState("");

  // We dont need to call it because we already fetch data in context file
  // useEffect(() => {
  //   fetchCustomers();
  // }, []);


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewCustomerClick = (id) => {
    setSelectedCustomerId(id);
    setIsViewCustomerDialogOpen(true);
  };
  
  
  const handleEditCustomerClick = (id) => {
    setSelectedCustomerId(id);
    setIsEditCustomerDialogOpen(true);
  };

  const handleEditCustomer = () => {
    setIsEditCustomerDialogOpen(false);
    setSelectedCustomerId(null);
    fetchCustomers();
  };

  
  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Bu müşteriyı silmek istediğinizden emin misiniz?")) {
      const response = await deleteCustomer(id);
      if (response.success) {
        toast.success("Müşteri başarıyla silindi");
        fetchCustomers();
      } else {
        toast.error(response.error || "Müşteri silinemedi");
      }
    }
  };

  const exportAllCustomersToExcel = async () => {
    try {
      if (!customers|| customers.length === 0) {
        toast.warning("Excel için müşteri verisi bulunamadı!");
        return;
      }
  
      const data = customers.map((customer) => ({
        "AD-SOYAD": customer.name,
        //"TELEFON": customer.phone,
        "İL": customer.city,
        "İLÇE": customer.district,
        "ADRES": customer.address,
        "VERGİ NO": customer.tax_number,
        "VERGİ DAİRESİ": customer.tax_office,
        //"FATURA ADRESİ": customer.billing_address,
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(data);
  
      worksheet["!cols"] = [
        { wch: 30 }, // AD-SOYAD
        //{ wch: 20 }, // TELEFON
        { wch: 15 }, // İL
        { wch: 20 }, // İLÇE
        { wch: 70 }, // ADRES
        { wch: 20 }, // VERGİ NO
        { wch: 25 }, // VERGİ DAİRESİ
        //{ wch: 70 }, // FATURA ADRESİ
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Müşteriler");
  
      XLSX.writeFile(workbook, "Musteri_Listesi.xlsx");
      toast.success("Excel başarıyla oluşturuldu!");
    } catch (error) {
      toast.error("Excel oluşturulurken hata oluştu.");
      console.error(error);
    }
  };

  
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);
  
  // Görünen satırlar için filtrelenmiş listeyi kullanalım.
  const visibleCustomerRows = useMemo(
    () =>
      filteredCustomers // Güncellenmiş müşteri listesi
        .slice()
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredCustomers]
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="end" alignItems="center" mb={2}>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Müşteri Ara..."
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {/* <Button
        variant="outlined"
        color="secondary"
        size="small"
        onClick={exportAllCustomersToExcel}
        sx={{ ml: 2 }}
      >
        Excel'e Aktar
      </Button> */}
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<AddIcon />}
        onClick={() => setIsCreateCustomerDialogOpen(true)}
        sx={{ ml: 2 }} // Butona sol boşluk ekleme

      >
        Müşteri Ekle
      </Button>
    </Box>
    <CreateCustomerPage open={isCreateCustomerDialogOpen} onClose={() => setIsCreateCustomerDialogOpen(false)} />
    {isEditCustomerDialogOpen && selectedCustomerId && (
      <EditCustomerPage
          open={isEditCustomerDialogOpen}
          onClose={() => handleEditCustomer()}
          customerId={selectedCustomerId}
      />
      )}
      <ViewCustomerPage
      open={isViewCustomerDialogOpen}
      onClose={() => setIsViewCustomerDialogOpen(false)}
      customerId={selectedCustomerId}
      />
      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad-Soyad</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>İl</TableCell>
              <TableCell>İlçe</TableCell>

              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleCustomerRows.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>{customer.district}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Detay">
                    <IconButton onClick={() => handleViewCustomerClick(customer.id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Düzenle">
                  <IconButton onClick={() => handleEditCustomerClick(customer.id)}>
                        <EditIcon />
                  </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton onClick={() => handleDeleteCustomer(customer.id)}>
                        <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[50, 75]}
          component="div"
          count={customers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Box>
  );
};

export default CustomersPage;