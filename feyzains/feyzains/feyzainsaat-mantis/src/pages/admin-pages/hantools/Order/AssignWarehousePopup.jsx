import React, { useContext, useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Autocomplete, TextField, Grid, Typography
} from '@mui/material';
import { WarehouseContext } from 'contexts/admin/WarehouseContext';
import { OrderContext } from 'contexts/admin/OrderContext';
import { toast } from 'react-toastify';

const AssignWarehousePopup = ({ open, onClose, order }) => {
  const { warehouses, createWarehouse, fetchWarehouses } = useContext(WarehouseContext);
  const { updateOrder } = useContext(OrderContext);

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [newWarehouse, setNewWarehouse] = useState({
    type: 'worker',
    first_name: '',
    last_name: '',
    user_name: '',
    password: ''
  });

  // 📦 Popup her açıldığında depocu listesini güncelle
  useEffect(() => {
    if (open) {
      fetchWarehouses();
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedWarehouse) return;

    const updatedOrder = {
      id: order.id,
      warehouse: selectedWarehouse.id,
      type: "assign"
    };

    const response = await updateOrder(updatedOrder);

    if (response.success) {
      toast.success("Depocu başarıyla atandı");
      onClose();
    } else {
      toast.error("Depocu atanamadı");
    }
  };

  const handleNewWarehouseSubmit = async (e) => {
    e.preventDefault();
    const res = await createWarehouse(newWarehouse);
    if (res.success) {
      toast.success("Yeni depocu oluşturuldu");

      // Yeni depocu sonrası listeyi tazele
      await fetchWarehouses();

      setSelectedWarehouse(res.warehouse); // otomatik seç
      setNewWarehouse({
        type: 'worker',
        first_name: '',
        last_name: '',
        user_name: '',
        password: ''
      });
    } else {
      toast.error(res.error || "Depocu eklenemedi");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Depocu Ata</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
          <Autocomplete
            options={warehouses.filter(w => !w.user.is_warehouse_manager)}
            value={selectedWarehouse}
            onChange={(e, newValue) => setSelectedWarehouse(newValue)}
            getOptionLabel={(option) => `${option.user.first_name} ${option.user.last_name} (${option.user.user_name})`}
            renderInput={(params) => <TextField {...params} label="Depocu Seç" fullWidth />}
          />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Yeni Depocu Ekle
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Ad"
              fullWidth
              value={newWarehouse.first_name}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, first_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Soyad"
              fullWidth
              value={newWarehouse.last_name}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, last_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Kullanıcı Adı"
              fullWidth
              value={newWarehouse.user_name}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, user_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Şifre"
              type="password"
              fullWidth
              value={newWarehouse.password}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, password: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleNewWarehouseSubmit}>
              Yeni Depocu Oluştur
            </Button>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleAssign} variant="contained" disabled={!selectedWarehouse}>
          Ata
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignWarehousePopup;
