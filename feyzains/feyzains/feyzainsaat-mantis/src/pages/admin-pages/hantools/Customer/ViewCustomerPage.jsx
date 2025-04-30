import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { CustomerContext } from "contexts/admin/CustomerContext";

const ViewCustomerPage = ({ open, onClose, customerId }) => {
  const { customers } = useContext(CustomerContext);

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    billing_address: "",
  });

  useEffect(() => {
    if (customerId) {
      const customerToView = customers.find((customer) => customer.id === customerId);
      if (customerToView) {
        setCustomerData({
          name: customerToView.name,
          phone: customerToView.phone,
          city: customerToView.city,
          district: customerToView.district,
          address: customerToView.address,
          billing_address: customerToView.billing_address,
          tax_number: customerToView.tax_number,
          tax_office: customerToView.tax_office
        });
      }
    }
  }, [customerId, customers]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Müşteri Detayları</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        
        {/* Müşteri Bilgileri */}
        <Typography variant="h6">Müşteri Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Ad-Soyad" value={customerData.name} readOnly />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telefon" value={customerData.phone} readOnly />
          </Grid>
        </Grid>

        {/* Adres Bilgileri */}
        <Typography variant="h6" sx={{ mt: 3 }}>Adres Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="İl" value={customerData.city} readOnly />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="İlçe" value={customerData.district} readOnly />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Adres" value={customerData.address} readOnly />
          </Grid>
        </Grid>

        {/* Fatura Adresi Bilgileri */}
        <Typography variant="h6" sx={{ mt: 3 }}>Fatura Adresi Bilgileri</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Vergi Numarası" value={customerData.tax_number} readOnly />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Vergi Dairesi" value={customerData.tax_office} readOnly />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Fatura Adresi" value={customerData.billing_address} readOnly />
          </Grid>
        </Grid>
      </DialogContent>

      <Button onClick={onClose} color="primary" sx={{ m: 2 }}>
        Kapat
      </Button>
    </Dialog>
  );
};

export default ViewCustomerPage;
