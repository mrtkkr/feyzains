// EditWorksitePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { CompanyContext } from '../../../../../contexts/admin/feyzains/CompanyContext';

const EditCompanyPage = ({ open, onClose, companyId }) => {
  const { companies, updateCompany, fetchCompanies } = useContext(CompanyContext);

  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (companyId) {
      const companyToEdit = companies.find((cp) => cp.id === companyId);
      if (companyToEdit) {
        setFormData({
          name: companyToEdit.name || ''
        });
      }
    }
  }, [companyId, companies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Lütfen şirket adını girin!');
      return;
    }

    const updatedCompany = { id: companyId, ...formData };

    const res = await updateCompany(companyId, updatedCompany);
    if (res.error) {
      toast.error('Şirket güncellenemedi!');
    } else {
      toast.success('Şirket başarıyla güncellendi!');
      fetchCompanies();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Şirket Düzenle</DialogTitle>
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

export default EditCompanyPage;
