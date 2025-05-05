// EditWorksitePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { GroupContext } from '../../../../../contexts/admin/feyzains/GroupContext';

const EditGroupPage = ({ open, onClose, groupId }) => {
  const { groups, updateGroup, fetchGroups } = useContext(GroupContext);

  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (groupId) {
      const groupToEdit = groups.find((gp) => gp.id === groupId);
      if (groupToEdit) {
        setFormData({
          name: groupToEdit.name || ''
        });
      }
    }
  }, [groupId, groups]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Lütfen grup adını girin!');
      return;
    }

    const updatedGroup = { id: groupId, ...formData };

    const res = await updateGroup(groupId, updatedGroup);
    if (res.error) {
      toast.error('Grup güncellenemedi!');
    } else {
      toast.success('Grup başarıyla güncellendi!');
      fetchGroups();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Group Düzenle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Grup Adı" name="name" value={formData.name} onChange={handleChange} required />
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

export default EditGroupPage;
