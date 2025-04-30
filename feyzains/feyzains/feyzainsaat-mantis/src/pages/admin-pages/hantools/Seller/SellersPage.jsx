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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { SellerContext } from "contexts/admin/SellerContext";
import EditSellerPage from "./EditSellerPage";
import CreateSellerPage from "./CreateSellerPage";
import VisibilityIcon from "@mui/icons-material/Visibility";

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

const SellersPage = () => {

  

// Context
const {
    sellers,
    fetchSellers,
    deleteSeller,
  } = useContext(SellerContext);
const [order, setOrder] = useState("asc");
const [orderBy, setOrderBy] = useState("date");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(25);
const [isEditSellerDialogOpen, setIsEditSellerDialogOpen] = useState(false);
const [isCreateSellerDialogOpen, setIsCreateSellerDialogOpen] = useState(false);
const [selectedSellerId, setSelectedSellerId] = useState(null);
const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    fetchSellers();
  }, []);


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

  
  const handleEditSellerClick = (id) => {
    setSelectedSellerId(id);
    setIsEditSellerDialogOpen(true);
  };

  const handleEditSeller = () => {
    setIsEditSellerDialogOpen(false);
    setSelectedSellerId(null);
    fetchSellers();
    };
  
  const handleDeleteSeller = async (id) => {
    if (window.confirm("Bu satıcıyı silmek istediğinizden emin misiniz?")) {
      const response = await deleteSeller(id);
      if (response.success) {
        toast.success("Satıcı başarıyla silindi");
        fetchSellers();
      } else {
        toast.error(response.error || "Satıcı silinemedi");
      }
    }
  };

  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) =>
      `${seller.user.first_name} ${seller.user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [sellers, searchQuery]);
  
  const visibleSellerRows = useMemo(
    () =>
      filteredSellers // Güncellendi
        .slice()
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredSellers]
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="end" alignItems="center" mb={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Satıcı Ara..."
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateSellerDialogOpen(true)}
          sx={{ ml: 2 }} // Butona sol boşluk ekleme
        >
          Satıcı Ekle
        </Button>
      </Box>
      <CreateSellerPage open={isCreateSellerDialogOpen} onClose={() => setIsCreateSellerDialogOpen(false)} />
      {isEditSellerDialogOpen && selectedSellerId && (
        <EditSellerPage
            open={isEditSellerDialogOpen}
            onClose={() => handleEditSeller()}
            sellerId={selectedSellerId}
        />
       )}
      {/* Sellers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Soyad</TableCell>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleSellerRows.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell>{seller.user.first_name}</TableCell>
                <TableCell>{seller.user.last_name}</TableCell>
                <TableCell>{seller.user.user_name}</TableCell>
                <TableCell>{seller.phone}</TableCell>
                <TableCell align="right">
                  {/* <Tooltip title="Detay">
                  <IconButton>
                        <VisibilityIcon />
                  </IconButton>
                  </Tooltip> */}
                  <Tooltip title="Düzenle">
                  <IconButton onClick={() => handleEditSellerClick(seller.id)}>
                        <EditIcon />
                  </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton onClick={() => handleDeleteSeller(seller.id)}>
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
          count={sellers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Box>
  );
};

export default SellersPage;