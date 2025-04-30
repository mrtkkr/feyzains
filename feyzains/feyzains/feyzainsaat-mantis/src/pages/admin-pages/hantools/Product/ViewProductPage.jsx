import React, { useState, useEffect, useContext } from "react";
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
import { ProductContext } from "contexts/admin/ProductContext";
import { AuthContext } from 'contexts/auth/AuthContext';


const ViewProductPage = ({ open, onClose, productId }) => {
  const { products } = useContext(ProductContext);
  const { fetchUser } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  
  

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    base_price: "",
    consignment: "",
    sell_price: "",
    price_in_tl: "",
    payment_type1: false,
    payment_type2: false,
    payment_type3: false,
  });

  useEffect(() => {
    console.log(productId)
    if (productId) {
      const existingProduct = products.find((p) => p.id === productId);
      if (existingProduct) {
        setFormData({
          code: existingProduct.code || "",
          name: existingProduct.name || "",
          base_price: existingProduct.base_price || "",
          consignment: existingProduct.consignment || "",
          sell_price: existingProduct.sell_price || "",
          price_in_tl: existingProduct.price_in_tl || "",
          payment_type1: existingProduct.payment_type1 || false,
          payment_type2: existingProduct.payment_type2 || false,
          payment_type3: existingProduct.payment_type3 || false,
        });
      }
    }
  }, [productId, products]);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ürün Detayları</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {/* Ürün Bilgileri */}
        <Typography variant="h6">Ürün Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ürün Kodu"
              value={formData.code}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ürün Adı"
              value={formData.name}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          {isAdmin && (<Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Alış Fiyatı"
              value={formData.base_price}
              InputProps={{ readOnly: true }}
            />
          </Grid>)}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Konsinye"
              value={formData.consignment}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          {isAdmin && (<Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Satış Fiyatı"
              value={formData.sell_price}
              InputProps={{ readOnly: true }}
            />
          </Grid>)}
          {isAdmin && (<Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="TL Karşılığı"
              value={formData.price_in_tl}
              InputProps={{ readOnly: true }}
            />
          </Grid>)}
        </Grid>

        {/* Ödeme Tipleri */}
        <Typography variant="h6" sx={{ mt: 3 }}>Geçerli Ödeme Yöntemleri</Typography>
        <Divider sx={{ mb: 1 }} />
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={formData.payment_type1} disabled />}
              label="Nejat"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={formData.payment_type2} disabled />}
              label="Han"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={<Checkbox checked={formData.payment_type3} disabled />}
              label="Kredi Kartı"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewProductPage;
