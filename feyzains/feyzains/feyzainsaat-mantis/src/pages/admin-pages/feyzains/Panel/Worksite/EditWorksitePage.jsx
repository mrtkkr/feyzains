// EditWorksitePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { WorksiteContext } from '../../../../../contexts/admin/feyzains/WorksiteContext';

const EditWorksitePage = ({ open, onClose, worksiteId }) => {
  const { worksites, updateWorksite, fetchWorksites } = useContext(WorksiteContext);

  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (worksiteId) {
      const worksiteToEdit = worksites.find((ws) => ws.id === worksiteId);
      if (worksiteToEdit) {
        setFormData({
          name: worksiteToEdit.name || ''
        });
      }
    }
  }, [worksiteId, worksites]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Lütfen işyeri adını girin!');
      return;
    }

    const updatedWorksite = { id: worksiteId, ...formData };

    const res = await updateWorksite(worksiteId, updatedWorksite);
    if (res.error) {
      toast.error('İşyeri güncellenemedi!');
    } else {
      toast.success('İşyeri başarıyla güncellendi!');
      fetchWorksites();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>İşyeri Düzenle</DialogTitle>
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

export default EditWorksitePage;
