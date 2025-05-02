// EditUserPage.jsx
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
import { PanelContext } from "contexts/admin/PanelContext";

const EditUserPage = ({ open, onClose, userId }) => {
  const { users, updateUser, fetchUsers } = useContext(PanelContext);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    password: "",
  });

  useEffect(() => {
    if (userId) {
      const userToEdit = users.find((user) => user.id === userId);
      if (userToEdit) {
        setFormData({
          first_name: userToEdit.first_name,
          last_name: userToEdit.last_name,
          user_name: userToEdit.user_name,
          password: "",
        });
      }
    }
  }, [userId, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.user_name) {
      toast.error("Lütfen gerekli alanları doldurun!");
      return;
    }

    const updatedUser = {
      id: userId,
      ...formData,
    };

    // Eğer şifre boşsa, güncelleme isteğinden çıkar
    if (!formData.password) {
      delete updatedUser.password;
    }

    const res = await updateUser(updatedUser);
    if (res.error) {
      toast.error("Kullanıcı güncellenemedi!");
    } else {
      toast.success("Kullanıcı başarıyla güncellendi!");
      fetchUsers();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Kullanıcı Düzenle</DialogTitle>
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

export default EditUserPage;