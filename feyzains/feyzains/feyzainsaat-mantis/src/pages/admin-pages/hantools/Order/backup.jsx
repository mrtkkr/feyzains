import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Divider,
  IconButton
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { OrderContext } from "contexts/admin/OrderContext";
import { ProductContext } from "contexts/admin/ProductContext";
import { CustomerContext } from "contexts/admin/CustomerContext";
import CircularProgress from "@mui/material/CircularProgress";


const CreateOrderPage = ({ open, onClose }) => {
  const { createOrder, fetchOrders } = useContext(OrderContext);
  const { products, loading, fetchProducts } = useContext(ProductContext);
  const { customers } = useContext(CustomerContext);
  const [productSearchInputs, setProductSearchInputs] = useState({});
  const debounceTimeout = useRef({});
  const [showExtractedProducts, setShowExtractedProducts] = useState(false);
  const [extractedSearchInputs, setExtractedSearchInputs] = useState({});



  const [formData, setFormData] = useState({
    products: [{ product_id: "", quantity: 1, unit_price: 0 }], // En az bir ürün başlangıçta ekli
    payment_type: "",
    status: "",
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    city: "",
    district: "",
    address: "",
    tax_number: "",
    tax_office: "",
    billing_address: "",
    extracted_products: [],

  });

  useEffect(() => {
    fetchProducts({ page: 1, pageSize: 10 });
  }, []);

  const addProductField = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product_id: "", quantity: 1, unit_price: 0 }]
    }));
  };
  
  // Ürün satırını kaldırma fonksiyonu
  const removeProductField = (index) => {
    setFormData((prev) => {
      // Eğer tek ürün kaldıysa silme işlemini engelle
      if (prev.products.length === 1) return prev;
  
      const newProducts = prev.products.filter((_, i) => i !== index);
      return { ...prev, products: newProducts };
    });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    if (field === "product_id") {
      const selectedProduct = products.find(p => p.id === value);
      newProducts[index]["product_id"] = value;
      newProducts[index]["product"] = selectedProduct || null;
    } else {
      newProducts[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  // Müşteri bilgilerini değiştirme fonksiyonu
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId) || null;

    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      customer_name: customer ? customer.name : "",
      customer_phone: customer ? customer.phone : "",
      city: customer ? customer.city : "",
      district: customer ? customer.district : "",
      address: customer ? customer.address : "",
      tax_number: customer ? customer.tax_number : "",
      tax_office: customer ? customer.tax_office : "",
      billing_address: customer ? customer.billing_address || "" : "",
    }));
  };

  // Genel input değişikliklerini yakalayan fonksiyon
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleExtractedProductChange = (index, field, value) => {
    const newProducts = [...formData.extracted_products];
    if (field === "product_id") {
      const selectedProduct = products.find(p => p.id === value);
      newProducts[index] = {
        ...newProducts[index],
        product_id: value,
        product: selectedProduct || null
      };
    } else {
      newProducts[index] = {
        ...newProducts[index],
        [field]: value
      };
    }
    setFormData((prev) => ({ ...prev, extracted_products: newProducts }));
  };
  
  const addExtractedProductField = () => {
    setFormData((prev) => ({
      ...prev,
      extracted_products: [...prev.extracted_products, { product_id: "", quantity: 1 }]
    }));
  };
  
  const removeExtractedProductField = (index) => {
    if (formData.extracted_products.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      extracted_products: prev.extracted_products.filter((_, i) => i !== index)
    }));
  };
  

  // Siparişin toplam fiyatını hesapla
  // const totalPrice = formData.products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);

  // Siparişi oluşturma
  const handleSubmit = async () => {
    if (!formData.products.length || !formData.payment_type || !formData.status || !formData.customer_id || !formData.address) {
      toast.error("Lütfen gerekli alanları doldurun!");
      return;
    }

    const orderData = {
      customer_id: formData.customer_id,
      city: formData.city,
      district: formData.district,
      address: formData.address,
      tax_number: formData.tax_number,
      tax_office: formData.tax_office,
      billing_address: formData.billing_address,
      payment_type: formData.payment_type,
      status: formData.status,
      //price: totalPrice,
      price: parseFloat(formData.price) || 0,
      order_products: formData.products.map(p => ({
        product_id: p.product_id,
        quantity: p.quantity,
        //unit_price: p.unit_price
      }))
    };

    const res = await createOrder(orderData);
    if (res.error) {
      toast.error("Sipariş eklenemedi!");
    } else {
      toast.success("Sipariş başarıyla eklendi!");
      fetchOrders();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Sipariş Ekle</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          
          {/* Müşteri Bilgileri */}
          <Typography variant="h6">Müşteri Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Müşteri Seç</InputLabel>
                <Select name="customer_id" value={formData.customer_id} onChange={handleCustomerChange}>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Ürün ve Ödeme Bilgileri */}
          <Typography variant="h6">Ürün ve Ödeme Bilgileri</Typography>
          <Divider />
          {formData.products.map((p, index) => (
            <Grid container spacing={2} key={index} alignItems="center">
              <Grid item xs={8}>
              <Autocomplete
                loading={loading}
                options={products}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : `${option.code} - ${option.name}`
                }
                value={p.product || null}
                onInputChange={(e, newInputValue) => {
                  // input'u state'e yaz (isteğe bağlı)
                  setProductSearchInputs((prev) => ({
                    ...prev,
                    [index]: newInputValue
                  }));

                  // Eski debounce'ı temizle
                  if (debounceTimeout.current[index]) {
                    clearTimeout(debounceTimeout.current[index]);
                  }

                  // Yeni debounce başlat (örnek: 300ms)
                  debounceTimeout.current[index] = setTimeout(() => {
                    fetchProducts({ page: 1, pageSize: 10, search: newInputValue });
                  }, 300);
                }}
                onChange={(e, selected) => {
                  handleProductChange(index, "product_id", selected ? selected.id : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ürün Seç"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              </Grid>

              <Grid item xs={2}>
                <TextField
                  fullWidth
                  label="Adet"
                  type="number"
                  value={p.quantity}
                  onChange={(e) =>
                    handleProductChange(index, "quantity", parseInt(e.target.value))
                  }
                />
              </Grid>

              {/* <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Birim Fiyat"
                  type="number"
                  value={p.unit_price}
                  onChange={(e) =>
                    handleProductChange(index, "unit_price", e.target.value)
                  }
                />
              </Grid> */}

              <Grid item xs={2} sx={{ display: "flex", gap: 1 }}>
                <IconButton onClick={addProductField} color="primary">
                  <AddIcon />
                </IconButton>
                <IconButton
                  onClick={() => removeProductField(index)}
                  color="secondary"
                  disabled={formData.products.length === 1}
                >
                  <RemoveIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => {
                setShowExtractedProducts(true);
                if (formData.extracted_products.length === 0) {
                  addExtractedProductField();
                }
              }}
            >
              Çıkartılacak Ürün Ekle
            </Button>
          </Box>
          {showExtractedProducts && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Çıkartılacak Ürünler</Typography>
              <Divider sx={{ mb: 2 }} />
              {formData.extracted_products.map((p, index) => (
                <Grid container spacing={2} key={`extracted-${index}`} alignItems="center">
                  <Grid item xs={8}>
                    <Autocomplete
                      loading={loading}
                      options={products}
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : `${option.code} - ${option.name}`
                      }
                      value={p.product || null}
                      onInputChange={(e, newInputValue) => {
                        setExtractedSearchInputs((prev) => ({
                          ...prev,
                          [index]: newInputValue
                        }));
                        if (debounceTimeout.current[`extracted-${index}`]) {
                          clearTimeout(debounceTimeout.current[`extracted-${index}`]);
                        }
                        debounceTimeout.current[`extracted-${index}`] = setTimeout(() => {
                          fetchProducts({ page: 1, pageSize: 10, search: newInputValue });
                        }, 300);
                      }}
                      onChange={(e, selected) => {
                        handleExtractedProductChange(index, "product_id", selected ? selected.id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Çıkartılacak Ürün Seç"
                          variant="outlined"
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loading ? <CircularProgress size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Adet"
                      type="number"
                      value={p.quantity}
                      onChange={(e) =>
                        handleExtractedProductChange(index, "quantity", parseInt(e.target.value))
                      }
                    />
                  </Grid>

                  <Grid item xs={2} sx={{ display: "flex", gap: 1 }}>
                    <IconButton onClick={addExtractedProductField} color="primary">
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => removeExtractedProductField(index)}
                      color="secondary"
                      disabled={formData.extracted_products.length === 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Box>
          )}
          

        <Grid container spacing={2}>
          
          <Grid item xs={6}>
            <FormControl fullWidth required>
              <InputLabel>Ödeme Yöntemi</InputLabel>
              <Select name="payment_type" value={formData.payment_type} onChange={handleChange}>
                <MenuItem value="Nejat">Nejat</MenuItem>
                <MenuItem value="Han">Han</MenuItem>
                <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth required>
              <InputLabel>Durum</InputLabel>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <MenuItem value="Beklemede">Beklemede</MenuItem>
                <MenuItem value="Onaylandı">Onaylandı</MenuItem>
                <MenuItem value="Kargoya Verildi">Kargoya Verildi</MenuItem>
                <MenuItem value="Teslim Edildi">Teslim Edildi</MenuItem>
                <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
              <TextField
                  fullWidth
                  label="Toplam Tutar"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => handleChange({ target: { name: "price", value: e.target.value } })}
                  required
                />
          </Grid>
        </Grid>

          {/* <Typography variant="h6">Toplam Tutar: {totalPrice.toFixed(2)}</Typography> */}

          {/* Adres Bilgileri Bölümü */}
          <Typography variant="h6">Adres Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İl" name="city" value={formData.city} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İlçe" name="district" value={formData.district} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleChange} required />
            </Grid>
          </Grid>

          {/* Fatura Adresi Bilgileri Bölümü */}
          {formData.payment_type !== "Nejat" && (
              <>
                <Typography variant="h6">Fatura Adresi Bilgileri</Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Vergi Numarası" name="tax_number" value={formData.tax_number} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Vergi Dairesi" name="tax_office" value={formData.tax_office} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Fatura Adresi" name="billing_address" value={formData.billing_address} onChange={handleChange} />
                  </Grid>
                </Grid>
              </>
            )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">İptal</Button>
        <Button onClick={handleSubmit} color="primary">Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderPage;
