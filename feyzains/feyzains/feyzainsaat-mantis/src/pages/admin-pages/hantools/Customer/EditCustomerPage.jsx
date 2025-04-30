// EditCustomerPage.jsx
import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { CustomerContext } from "contexts/admin/CustomerContext";

const EditCustomerPage = ({ open, onClose, customerId }) => {
  const { customers, updateCustomer, fetchCustomers } = useContext(CustomerContext);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    tax_number: "",
    tax_office: "",
    address: "",
    billing_address: "",
  });

  useEffect(() => {
    if (customerId) {
      const customerToEdit = customers.find((customer) => customer.id === customerId);
      if (customerToEdit) {
        setFormData({
          name: customerToEdit.name,
          phone: customerToEdit.phone,
          city: customerToEdit.city,
          district: customerToEdit.district,
          address: customerToEdit.address,
          billing_address: customerToEdit.billing_address,
          tax_number: customerToEdit.tax_number,
          tax_office: customerToEdit.tax_office
        });
      }
    }
  }, [customerId, customers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.city || !formData.district || !formData.address) {
      toast.error("Lütfen gerekli alanları doldurun!");
      return;
    }

    const updatedCustomer = {
      id: customerId,
      ...formData,
    };

    // Eğer şifre boşsa, güncelleme isteğinden çıkar
    if (!formData.password) {
      delete updatedCustomer.password;
    }

    const res = await updateCustomer(updatedCustomer);
    if (res.error) {
      toast.error("Müşteri güncellenemedi!");
    } else {
      toast.success("Müşteri başarıyla güncellendi!");
      fetchCustomers();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Müşteri Düzenle</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        
        {/* Müşteri Bilgileri */}
        <Typography variant="h6">Müşteri Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Ad-Soyad" name="name" value={formData.name} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telefon" name="phone" value={formData.phone} onChange={handleChange} required />
          </Grid>
        </Grid>

        {/* Adres Bilgileri */}
        <Typography variant="h6" sx={{ mt: 3 }}>Adres Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="İl" name="city" value={formData.city} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="İlçe" name="district" value={formData.district} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleChange} required />
          </Grid>
        </Grid>

        {/* Fatura Adresi Bilgileri */}
        <Typography variant="h6" sx={{ mt: 3 }}>Fatura Adresi Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Vergi Numarası" name="tax_number" value={formData.tax_number} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Vergi Dairesi" name="tax_office" value={formData.tax_office} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Fatura Adresi"
              name="billing_address"
              value={formData.billing_address}
              helperText="Eğer fatura adresi varsa lütfen doldurun."
              onChange={handleChange}
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

export default EditCustomerPage;