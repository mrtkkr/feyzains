// AddWorksitePage.jsx
import React, { useState, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { CustomerContext } from '../../../../../contexts/admin/feyzains/CustomerContext';

const AddCompanyPage = ({ open, onClose }) => {
  const { addCustomer, fetchCustomers } = useContext(CustomerContext);

  const [formData, setFormData] = useState({
    name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Lütfen şirket adını girin!');
      return;
    }

    const res = await addCompany(formData);
    if (res.error) {
      toast.error('Şirket eklenemedi!');
    } else {
      toast.success('Şirket başarıyla eklendi!');
      fetchCompanies();
      setFormData({ name: '' }); // Formu temizle
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Şirket Ekle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Şirket Adı" name="name" value={formData.name} onChange={handleChange} required />
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

export default AddCompanyPage;
