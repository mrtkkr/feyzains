// AddWorksitePage.jsx
import React, { useState, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { GroupContext } from '../../../../../contexts/admin/feyzains/GroupContext';

const AddGroupPage = ({ open, onClose }) => {
  const { addGroup, fetchGroups } = useContext(GroupContext);

  const [formData, setFormData] = useState({
    name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Lütfen grup adını girin!');
      return;
    }

    const res = await addGroup(formData);
    if (res.error) {
      toast.error('Grup eklenemedi!');
    } else {
      toast.success('Grup başarıyla eklendi!');
      fetchGroups();
      setFormData({ name: '' }); // Formu temizle
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Grup Ekle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="İşyeri Adı" name="name" value={formData.name} onChange={handleChange} required />
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

export default AddGroupPage;
