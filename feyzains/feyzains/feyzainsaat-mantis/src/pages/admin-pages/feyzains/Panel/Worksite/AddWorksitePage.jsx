// AddWorksitePage.jsx
import React, { useState, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { WorksiteContext } from '../../../../../contexts/admin/feyzains/WorksiteContext';

const AddWorksitePage = ({ open, onClose }) => {
  const { addWorksite, fetchWorksites } = useContext(WorksiteContext);

  const [formData, setFormData] = useState({
    name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Lütfen işyeri adını girin!');
      return;
    }

    const res = await addWorksite(formData);
    if (res.error) {
      toast.error('Şantiye eklenemedi!');
    } else {
      toast.success('Şantiye başarıyla eklendi!');
      fetchWorksites();
      setFormData({ name: '' }); // Formu temizle
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Şantiye Ekle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Şantiye Adı" name="name" value={formData.name} onChange={handleChange} required />
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

export default AddWorksitePage;
