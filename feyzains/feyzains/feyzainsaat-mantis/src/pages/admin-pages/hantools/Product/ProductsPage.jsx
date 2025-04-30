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
  CircularProgress
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search"; // Arama ikonu için import ekleyelim.
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ProductContext } from "contexts/admin/ProductContext";
import axios from "axios";
import { PUBLIC_URL } from "services/network_service"; // API çağrıları için kullanılan servis
import CreateProductPage from "./CreateProductPage";
import EditProductPage from "./EditProductPage";
import ViewProductPage from "./ViewProductPage";
import { AuthContext } from 'contexts/auth/AuthContext';
import * as XLSX from "xlsx";




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

const ProductsPage = () => {
  
// Context
const {
    products,
    productsAll,
    productCount,
    fetchProducts,
    fetchProductsAll,
    deleteProduct,
  } = useContext(ProductContext);
const { fetchUser } = useContext(AuthContext);  
const [order, setOrder] = useState("asc");
const [orderBy, setOrderBy] = useState("date");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(50);
const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] = useState(false);
const [isViewProductDialogOpen, setIsViewProductDialogOpen] = useState(false);
const [selectedProductId, setSelectedProductId] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);
const [searchQuery, setSearchQuery] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);



useEffect(() => {
  fetchProducts({ page: page + 1, pageSize: rowsPerPage });
  console.log(productCount)
}, [page, rowsPerPage]);

useEffect(() => {
  const initializeUser = async () => {
    const user = await fetchUser();
    console.log('user', user);

    if (user) {
      if (user.groups.includes('Admin') || user.is_superuser) {
        setIsAdmin(true)
      }
    }
  };

  initializeUser();
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

  const handleViewProductClick = (id) => {
    setSelectedProductId(id);
    setIsViewProductDialogOpen(true);
  };
  
  
  const handleEditProductClick = (id) => {
    setSelectedProductId(id);
    setIsEditProductDialogOpen(true);
  };

  const handleEditProduct = () => {
    setIsEditProductDialogOpen(false);
    setSelectedProductId(null);
    fetchProducts();
  };

  
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      const response = await deleteProduct(id);
      if (response.success) {
        toast.success("Ürün başarıyla silindi");
        fetchProducts();
      } else {
        toast.error(response.error || "Ürün silinemedi");
      }
    }
  };

  // Dosya seçildiğinde state'e kaydet
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const importFromExcel = async () => {
    if (!selectedFile) {
      toast.warning("Lütfen bir Excel dosyası seçin!");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);

    
    // Loading başlat
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        `${PUBLIC_URL}/core/import-excel/`, 
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      toast.success("Ürünler başarıyla yüklendi!");
      fetchProducts(); // Yeni verileri çek
    } catch (error) {
      toast.error("Hata oluştu: " + (error.message || "Bilinmeyen bir hata"));
      console.log("Hata oluştu: " + (error.message || "Bilinmeyen bir hata"));
    } finally {
      // İşlem bitince loading'i kapat
      setIsLoading(false);
    }
  };

  const exportAllProductsToExcel = async () => {
    try {
      const productsFetched = await fetchProductsAll();
      if (!productsFetched || productsFetched.length === 0) {
        toast.warning("Excel için ürün verisi bulunamadı!");
        return;
      }
  
      const data = productsFetched.map((product) => ({
        "KOD": product.code,
        "ÜRÜN ADI": product.name,
        "BİZE GELİŞ": formatNumber(product.base_price),
        "KONSİNYE": formatNumber(product.consignment),
        "MAĞAZA SATIŞ": formatNumber(product.sell_price),
        "TL": formatNumber(product.price_in_tl),
        "NEJAT": product.payment_type1 ? "✔" : "",
        "HAN": product.payment_type2 ? "✔" : "",
        "KREDİ KARTI": product.payment_type3 ? "✔" : "",
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(data);
  
      // Kolon genişliklerini ayarla (göz kararı)
      worksheet["!cols"] = [
        { wch: 10 }, // KOD
        { wch: 80 }, // ÜRÜN ADI
        { wch: 12 }, // BİZE GELİŞ
        { wch: 12 }, // KONSİNYE
        { wch: 15 }, // MAĞAZA SATIŞ
        { wch: 15 }, // TL
        { wch: 10 }, // NEJAT
        { wch: 10 }, // HAN
        { wch: 15 }, // KREDİ KARTI
      ];
  
      // Header'ı bold yapmak için manuel hücre formatı
      const headerKeys = Object.keys(data[0]);
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ürünler");
  
      // Export işlemi
      XLSX.writeFile(workbook, "Urun_Listesi.xlsx");
      toast.success("Excel başarıyla oluşturuldu!");
    } catch (error) {
      toast.error("Excel oluşturulurken hata oluştu.");
      console.error(error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({ page: page + 1, pageSize: rowsPerPage, search: searchQuery });
    }, 500); // debounce için 500ms bekleyelim
  
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page, rowsPerPage]);

  
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);
  
  // Görünen satırlar için filtrelenmiş listeyi kullanalım.
  const visibleProductRows = useMemo(() => {
    return products.sort(getComparator(order, orderBy));
  }, [products, order, orderBy]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="end" alignItems="center" mb={2}>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Ürün Ara..."
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
        variant="outlined"
        color="secondary"
        size="small"
        onClick={exportAllProductsToExcel}
        sx={{ ml: 2 }}
      >
        Excel'e Aktar
      </Button>
      {isAdmin && (
        <>
          {/* Dosya seçme inputu (Görünmez, butonla tetiklenecek) */}
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="excel-upload"
          />

          <label htmlFor="excel-upload">
            <Button
              variant="contained"
              component="span"
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            >
              Excel Seç
            </Button>
          </label>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            onClick={importFromExcel}
            sx={{ ml: 2 }}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? "Yükleniyor..." : "Excel Yükle"}
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateProductDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Ürün Ekle
          </Button>
        </>
      )}
    </Box>
    <CreateProductPage open={isCreateProductDialogOpen} onClose={() => setIsCreateProductDialogOpen(false)} />
    {isEditProductDialogOpen && selectedProductId && (
      <EditProductPage
          open={isEditProductDialogOpen}
          onClose={() => handleEditProduct()}
          productId={selectedProductId}
      />
      )}
      <ViewProductPage
        open={isViewProductDialogOpen}
        onClose={() => setIsViewProductDialogOpen(false)}
        productId={selectedProductId}
      /> 
      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kod</TableCell>
              <TableCell>Ürün Adı</TableCell>
              <TableCell>Stok</TableCell>
              {isAdmin && <TableCell>Geliş Fiyatı</TableCell>}
              <TableCell>Konsinye</TableCell>
              {isAdmin && <TableCell>Satış Fiyatı</TableCell>}
              {isAdmin && <TableCell>TL Fiyatı</TableCell>}

              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleProductRows.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.stock ? 'Var' : 'Yok'}</TableCell>
                {isAdmin && <TableCell>{formatNumber(product.base_price)}</TableCell>}
                <TableCell>{formatNumber(product.consignment)}</TableCell>
                {isAdmin && <TableCell>{formatNumber(product.sell_price)}</TableCell>}
                {isAdmin && <TableCell>{formatNumber(product.price_in_tl)}</TableCell>}
                <TableCell align="right">
                  <Tooltip title="Detay">
                    <IconButton onClick={() => handleViewProductClick(product.id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (<Tooltip title="Düzenle">
                    <IconButton onClick={() => handleEditProductClick(product.id)}>
                          <EditIcon />
                    </IconButton>
                  </Tooltip>)}
                  {/* {isAdmin && (<Tooltip title="Sil">
                    <IconButton onClick={() => handleDeleteProduct(product.id)}>
                        <DeleteIcon />
                    </IconButton>
                  </Tooltip>)} */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[50]}
          component="div"
          count={productCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Box>
  );
};

export default ProductsPage;