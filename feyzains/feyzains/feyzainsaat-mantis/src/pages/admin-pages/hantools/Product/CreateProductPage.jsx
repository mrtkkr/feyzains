import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { toast } from "react-toastify";
import { ProductContext } from "contexts/admin/ProductContext";

const CreateProductPage = ({ open, onClose }) => {
  const { createProduct, fetchProducts } = useContext(ProductContext);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    base_price: "",
    consignment: "",
    sell_price: "",
    price_in_tl: "",
    payment_type1: false, // Nejat
    payment_type2: false, // Han
    payment_type3: false, // Kredi Kartı
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { code, name, base_price, sell_price } = formData;

    if (!code || !name || !base_price || !sell_price) {
      toast.error("Kod, ad, alış ve satış fiyatı zorunludur.");
      return;
    }

    const res = await createProduct(formData);
    if (res.error) {
      toast.error("Ürün eklenemedi!");
    } else {
      toast.success("Ürün başarıyla eklendi!");
      fetchProducts();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ürün Ekle</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {/* Ürün Bilgileri */}
        <Typography variant="h6">Ürün Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Ürün Kodu" name="code" value={formData.code} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Ürün Adı" name="name" value={formData.name} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Alış Fiyatı"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Konsinye"
              name="consignment"
              value={formData.consignment}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Satış Fiyatı"
              name="sell_price"
              value={formData.sell_price}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="TL Karşılığı"
              name="price_in_tl"
              value={formData.price_in_tl}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Ödeme Tipleri */}
        <Typography variant="h6" sx={{ mt: 3 }}>Geçerli Ödeme Yöntemleri</Typography>
        <Divider sx={{ mb: 1 }} />
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={formData.payment_type1} onChange={handleChange} name="payment_type1" />}
              label="Nejat"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={formData.payment_type2} onChange={handleChange} name="payment_type2" />}
              label="Han"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={formData.payment_type3} onChange={handleChange} name="payment_type3" />}
              label="Kredi Kartı"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">İptal</Button>
        <Button onClick={handleSubmit} color="primary">Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProductPage;
