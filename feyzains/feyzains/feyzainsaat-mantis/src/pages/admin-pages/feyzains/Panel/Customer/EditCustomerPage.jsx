// EditWorksitePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { CustomerContext } from '../../../../../contexts/admin/feyzains/CustomerContext';

const EditCustomerPage = ({ open, onClose, customerId }) => {
  const { customers, updateCustomer, fetchCustomers } = useContext(CustomerContext);

  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (customerId) {
      const customerToEdit = customers.find((cs) => cs.id === customerId);
      if (customerToEdit) {
        setFormData({
          name: customerToEdit.name || ''
        });
      }
    }
  }, [customerId, customers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Lütfen müşteri adını girin!');
      return;
    }

    const updatedCustomer = { id: customerId, ...formData };

    const res = await updateCustomer(customerId, updatedCustomer);
    if (res.error) {
      toast.error('Müşteri güncellenemedi!');
    } else {
      toast.success('Müşteri başarıyla güncellendi!');
      fetchCustomers();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Müşteri Düzenle</DialogTitle>
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

export default EditCustomerPage;
