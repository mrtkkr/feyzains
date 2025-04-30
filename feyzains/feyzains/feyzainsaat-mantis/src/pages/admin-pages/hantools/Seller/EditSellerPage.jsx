// EditSellerPage.jsx
import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { SellerContext } from "contexts/admin/SellerContext";

const EditSellerPage = ({ open, onClose, sellerId }) => {
  const { sellers, updateSeller, fetchSellers } = useContext(SellerContext);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (sellerId) {
      const sellerToEdit = sellers.find((seller) => seller.id === sellerId);
      if (sellerToEdit) {
        setFormData({
          first_name: sellerToEdit.user.first_name,
          last_name: sellerToEdit.user.last_name,
          user_name: sellerToEdit.user.user_name,
          phone: sellerToEdit.phone,
          password: "",
        });
      }
    }
  }, [sellerId, sellers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.user_name || !formData.phone) {
      toast.error("Lütfen gerekli alanları doldurun!");
      return;
    }

    const updatedSeller = {
      id: sellerId,
      ...formData,
    };

    // Eğer şifre boşsa, güncelleme isteğinden çıkar
    if (!formData.password) {
      delete updatedSeller.password;
    }

    const res = await updateSeller(updatedSeller);
    if (res.error) {
      toast.error("Satıcı güncellenemedi!");
    } else {
      toast.success("Satıcı başarıyla güncellendi!");
      fetchSellers();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Satıcı Düzenle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ad"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Soyad"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              helperText="Şifreyi değiştirmek istemiyorsanız boş bırakın"
            />
          </Grid>
          
        </Grid>
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

export default EditSellerPage;