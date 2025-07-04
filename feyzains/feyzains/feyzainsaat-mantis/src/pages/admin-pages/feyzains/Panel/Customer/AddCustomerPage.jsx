// AddWorksitePage.jsx
import React, { useState, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { CustomerContext } from '../../../../../contexts/admin/feyzains/CustomerContext';

const AddCustomerPage = ({ open, onClose }) => {
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
      toast.error('Lütfen müşteri adını girin!');
      return;
    }

    const res = await addCustomer(formData);
    if (res.error) {
      toast.error('Müşteri eklenemedi!');
    } else {
      toast.success('Müşteri başarıyla eklendi!');
      fetchCustomers();
      setFormData({ name: '' }); // Formu temizle
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Müşteri Adı" name="name" value={formData.name} onChange={handleChange} required />
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

export default AddCustomerPage;
