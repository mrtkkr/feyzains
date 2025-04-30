import React, { useState, useContext } from "react";
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
} from "@mui/material";
import { toast } from "react-toastify";
import { OrderContext } from "contexts/admin/OrderContext";
import { ProductContext } from "contexts/admin/ProductContext";
import { CustomerContext } from "contexts/admin/CustomerContext";

const CreateOrderPage = ({ open, onClose }) => {
  const { createOrder, fetchOrders } = useContext(OrderContext);
  const { products } = useContext(ProductContext);
  const { customers } = useContext(CustomerContext);

  const [formData, setFormData] = useState({
    product_id: "",
    price: "",
    payment_type: "",
    status: "",
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_city: "",
    customer_district: "",
    address: "",
    tax_number: "",
    tax_office: "",
    billing_address: "",
  });

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId) || null;

    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      customer_name: customer ? customer.name : "",
      customer_phone: customer ? customer.phone : "",
      customer_city: customer ? customer.city : "",
      customer_district: customer ? customer.district : "",
      address: customer ? customer.address : "",
      tax_number: customer ? customer.tax_number : "",
      tax_office: customer ? customer.tax_office : "",
      billing_address: customer ? customer.billing_address || "" : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.price || !formData.payment_type || !formData.status || !formData.customer_id || !formData.address) {
      toast.error("Lütfen gerekli alanları doldurun!");
      return;
    }

    const createdOrder = { ...formData };

    const res = await createOrder(createdOrder);
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
          
          {/* Müşteri Bilgileri Bölümü */}
          <Typography variant="h6">Müşteri Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Müşteri Seç</InputLabel>
                <Select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleCustomerChange}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefon" name="customer_phone" value={formData.customer_phone} onChange={handleChange} />
            </Grid>
          </Grid>

          {/* Ürün ve Ödeme Bilgileri Bölümü */}
          <Typography variant="h6">Ürün ve Ödeme Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Ürün Seç</InputLabel>
                <Select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tutar" name="price" type="number" value={formData.price} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Ödeme Yöntemi</InputLabel>
                <Select
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                >
                  <MenuItem value="Nejat">Nejat</MenuItem>
                  <MenuItem value="Han">Han</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                  
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Durum</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Beklemede">Beklemede</MenuItem>
                  <MenuItem value="Onaylandı">Onaylandı</MenuItem>
                  <MenuItem value="Kargoya Verildi">Kargoya Verildi</MenuItem>
                  <MenuItem value="Teslim Edildi">Teslim Edildi</MenuItem>
                  <MenuItem value="İptal Edildi">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Adres Bilgileri Bölümü */}
          <Typography variant="h6">Adres Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İl" name="customer_city" value={formData.customer_city} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İlçe" name="customer_district" value={formData.customer_district} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleChange} required />
            </Grid>
          </Grid>

          {/* Fatura Adresi Bilgileri Bölümü */}
          <Typography variant="h6">Fatura Adresi Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İl" name="tax_number" value={formData.tax_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İlçe" name="tax_office" value={formData.tax_office} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Fatura Adresi" name="billing_address" value={formData.billing_address} onChange={handleChange} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          İptal
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderPage;
