import React, { useState, useContext, useEffect } from "react";
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
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { OrderContext } from "contexts/admin/OrderContext";
import { ProductContext } from "contexts/admin/ProductContext";
import { CustomerContext } from "contexts/admin/CustomerContext";

const EditOrderPage = ({ open, onClose, orderId }) => {
  const { updateOrder, fetchOrders, orders } = useContext(OrderContext);
  const { products } = useContext(ProductContext);
  const { customers } = useContext(CustomerContext);

  const [formData, setFormData] = useState({
    products: [],
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

  useEffect(() => {
    if (orderId) {
      const orderToEdit = orders.find(order => order.id === orderId);
      if (orderToEdit) {
        const selectedCustomer = customers.find(c => c.id === orderToEdit.customer.id) || {};
        console.log(orderToEdit)
        setFormData({
          products: orderToEdit.order_products.map(p => ({
            product_id: p.product.id,
            quantity: p.quantity,
            //unit_price: p.unit_price,
          })),
          payment_type: orderToEdit.payment_type,
          status: orderToEdit.status,
          price: orderToView.price,
          customer_id: orderToEdit.customer.id || "",
          customer_name: selectedCustomer.name || "",
          customer_phone: selectedCustomer.phone || "",
          customer_city: orderToEdit.city || "",
          customer_district: orderToEdit.district || "",
          address: orderToEdit.address || "",
          tax_number: orderToEdit.tax_number || "",
          tax_office: orderToEdit.tax_office || "",
          billing_address: orderToEdit.billing_address || "",
        });
      }
    }
  }, [orderId, orders, customers]);

  const addProductField = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product_id: "", quantity: 1, unit_price: 0 }]
    }));
  };

  const removeProductField = (index) => {
    setFormData((prev) => {
      if (prev.products.length === 1) return prev;
      const newProducts = prev.products.filter((_, i) => i !== index);
      return { ...prev, products: newProducts };
    });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
  
    if (field === "unit_price") {
      newProducts[index].unit_price = parseFloat(value) || 0;
    }
  
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId) || {};

    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      customer_name: customer.name || "",
      customer_phone: customer.phone || "",
      customer_city: customer.city || "",
      customer_district: customer.district || "",
      address: customer.address || "",
      tax_number: customer.tax_number || "",
      tax_office: customer.tax_office || "",
      billing_address: customer.billing_address || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  //const totalPrice = formData.products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);

  const handleSubmit = async () => {
    if (!formData.products.length || !formData.payment_type || !formData.status || !formData.customer_id || !formData.address) {
      toast.error("Lütfen gerekli alanları doldurun!");
      return;
    }

    const updatedOrder = {
      id: orderId,
      customer_id: formData.customer_id,
      address: formData.address,
      billing_address: formData.billing_address,
      payment_type: formData.payment_type,
      status: formData.status,
      price: formData.price,
      order_products: formData.products.map(p => ({
        product_id: p.product_id,
        quantity: p.quantity,
        //unit_price: p.unit_price
      }))
    };

    const res = await updateOrder(updatedOrder);
    if (res.error) {
      toast.error("Sipariş güncellenemedi!");
    } else {
      toast.success("Sipariş başarıyla güncellendi!");
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
            <Grid item xs={5}>
              <FormControl fullWidth required>
                <InputLabel>Ürün Seç</InputLabel>
                <Select value={p.product_id} onChange={(e) => handleProductChange(index, "product_id", e.target.value)}>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <TextField 
                fullWidth 
                label="Adet" 
                type="number"
                value={p.quantity}
                onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField 
                fullWidth 
                label="Birim Fiyat" 
                type="number"
                value={p.unit_price} 
                onChange={(e) => handleProductChange(index, "unit_price", e.target.value)}
              />
            </Grid>
            <Grid item xs={2} sx={{ display: "flex", gap: 1 }}>
              {/* + Butonu */}
              <IconButton onClick={addProductField} color="primary">
                <AddIcon />
              </IconButton>

              {/* - Butonu (En az bir ürün olmalı, yoksa kaldırma engellenir) */}
              <IconButton onClick={() => removeProductField(index)} color="secondary" disabled={formData.products.length === 1}>
                <RemoveIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

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
                  required
                />
          </Grid>
        </Grid>

          {/* <Typography variant="h6">Toplam Tutar: {totalPrice.toFixed(2)} TL</Typography> */}

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
          <Typography variant="h6">Fatura Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Vergi Numarası" name="tax_number" value={formData.tax_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Vergi Dairesi" name="tax_office" value={formData.tax_office} onChange={handleChange} />
            </Grid>
            {/* <Grid item xs={12}>
              <TextField fullWidth label="Fatura Adresi" name="billing_address" value={formData.billing_address} onChange={handleChange} />
            </Grid> */}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">İptal</Button>
        <Button onClick={handleSubmit} color="primary">Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderPage;
