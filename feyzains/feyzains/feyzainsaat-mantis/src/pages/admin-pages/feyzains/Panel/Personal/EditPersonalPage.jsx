import React, { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import { PersonalContext } from '../../../../../contexts/admin/feyzains/PersonalContext';
import { WorksiteContext } from '../../../../../contexts/admin/feyzains/WorksiteContext';

const EditPersonalPage = ({ open, onClose, personalId }) => {
  const { personals, updatePersonal, fetchPersonals } = useContext(PersonalContext);
  const { worksites } = useContext(WorksiteContext);

  const [formData, setFormData] = useState({
    name: '',
    identity_number: '',
    creation_date: '',
    entry: '',
    exit: '',
    worksite: ''
  });

  useEffect(() => {
    if (personalId) {
      const personalToEdit = personals.find((ps) => ps.id === personalId);
      if (personalToEdit) {
        setFormData({
          name: personalToEdit.name || '',
          identity_number: personalToEdit.identity_number || '',
          creation_date: personalToEdit.creation_date?.slice(0, 16) || '',
          entry: personalToEdit.entry?.slice(0, 16) || '',
          exit: personalToEdit.exit?.slice(0, 16) || '',
          worksite: personalToEdit.worksite || ''
        });
      }
    }
  }, [personalId, personals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = ['name', 'identity_number', 'creation_date', 'entry', 'exit', 'worksite'];
    const emptyField = requiredFields.find((field) => !formData[field]);
    if (emptyField) {
      toast.error('Lütfen tüm alanları doldurun!');
      return;
    }

    const res = await updatePersonal(personalId, formData);
    if (res.error) {
      toast.error('Personel güncellenemedi!');
    } else {
      toast.success('Personel başarıyla güncellendi!');
      fetchPersonals();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Personel Düzenle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Ad Soyad" name="name" value={formData.name} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="TC Kimlik No"
              name="identity_number"
              value={formData.identity_number}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Kayıt Tarihi"
              name="creation_date"
              value={formData.creation_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Giriş Tarihi"
              name="entry"
              value={formData.entry}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Çıkış Tarihi"
              name="exit"
              value={formData.exit}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField select fullWidth label="Şantiye" name="worksite" value={formData.worksite} onChange={handleChange} required>
              {worksites?.map((ws) => (
                <MenuItem key={ws.id} value={ws.id}>
                  {ws.name}
                </MenuItem>
              ))}
            </TextField>
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

export default EditPersonalPage;
