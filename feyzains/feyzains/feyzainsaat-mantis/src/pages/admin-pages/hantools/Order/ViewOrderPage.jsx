import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { OrderContext } from "contexts/admin/OrderContext";
import { ProductContext } from "contexts/admin/ProductContext";
import { CustomerContext } from "contexts/admin/CustomerContext";
import { AuthContext } from 'contexts/auth/AuthContext';
import NotesPopup from "./NotesPopup"; // Notlar için pop-up bileşeni


const ViewOrderPage = ({ open, onClose, orderId }) => {
  const { orders } = useContext(OrderContext);
  const { products } = useContext(ProductContext);
  const { customers } = useContext(CustomerContext);
  const { fetchUser } = useContext(AuthContext);
  const [notesOpen, setNotesOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  const [formData, setFormData] = useState({
    products: [],
    payment_type: "",
    status: "",
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    city: "",
    district: "",
    address: "",
    tax_number: "",
    tax_office: "",
    billing_address: "",
  });

  useEffect(() => {
    if (orderId) {
      const orderToView = orders.find(order => order.id === orderId);
      if (orderToView) {
        let selectedCustomer = {};

        if (orderToView.customer?.id) {
          selectedCustomer = customers.find(c => c.id === orderToView.customer.id) || {};
        }

        setFormData({
          products: orderToView.order_products.map(p => ({
            product_id: p.product.id,
            product_name: p.product.name,
            product_code: p.product.code,
            quantity: p.quantity,
            previous_price: p.previous_price,
            extracted_products: (p.extracted_products || []).map(ep => ({
              product_id: ep.product.id,
              product_name: ep.product.name,
              product_code: ep.product.code,
              quantity: ep.quantity
            }))
          })),
          payment_type: orderToView.payment_type,
          status: orderToView.status,
          price: orderToView.price,
          customer_id: selectedCustomer.id || "",
          customer_name: selectedCustomer.name || "",
          customer_phone: selectedCustomer.phone || "",
          city: orderToView.city || "",
          district: orderToView.district || "",
          address: orderToView.address || "",
          tax_number: orderToView.tax_number || "",
          tax_office: orderToView.tax_office || "",
          billing_address: orderToView.billing_address || "",
        });
      }
    }
  }, [orderId, orders, customers]);

  useEffect(() => {
        const initializeUser = async () => {
          const user = await fetchUser();
          console.log('user', user);
    
          if (user) {
            if (user.groups.includes('Admin') || user.is_superuser) {
              setIsAdmin(true)
            }
          }
        };
    
        initializeUser();
      }, []);

  //const totalPrice = formData.products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Sipariş Detayları
        <Button onClick={() => setNotesOpen(true)} color="primary" sx={{ float: "right" }}>
          Notlar
        </Button>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Müşteri Bilgileri */}
          <Typography variant="h6">Müşteri Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Müşteri</InputLabel>
                <Select name="customer_id" value={formData.customer_id} readOnly>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6">Ürünler</Typography>
          <Divider />
          {formData.products.map((p, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Ürün"
                    value={p.product_name ? `${p.product_name} - ${p.product_code}` : "Ürün bilgisi yüklenemedi"}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Adet"
                    type="number"
                    value={p.quantity}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>

              {/* Çıkan Ürünler */}
              {p.extracted_products && p.extracted_products.length > 0 && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Typography variant="subtitle1">Çıkan Ürünler</Typography>
                  {p.extracted_products.map((ep, epIndex) => (
                    <Grid container spacing={2} key={epIndex} alignItems="center" sx={{ mt: 1 }}>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          label="Çıkan Ürün"
                          value={`${ep.product_name} - ${ep.product_code}`}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label="Adet"
                          type="number"
                          value={ep.quantity}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {/* <Typography variant="h6">Toplam Tutar: {totalPrice.toFixed(2)}</Typography> */}

          {/* Ödeme ve Durum Bilgileri */}
          <Typography variant="h6">Ödeme ve Durum</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Ödeme Yöntemi</InputLabel>
                <Select name="payment_type" value={formData.payment_type} readOnly>
                  <MenuItem value="Nejat">Nejat</MenuItem>
                  <MenuItem value="Han">Han</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select name="status" value={formData.status} readOnly>
                  <MenuItem value="Beklemede">Beklemede</MenuItem>
                  <MenuItem value="Hazırlanıyor">Hazırlanıyor</MenuItem>
                  <MenuItem value="Kargoda">Kargoda</MenuItem>
                  <MenuItem value="İptal">İptal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="Toplam Tutar"
                    type="number"
                    value={formData.price || ""}
                    readOnly
                  />
            </Grid>
          </Grid>

          {/* Adres Bilgileri */}
          <Typography variant="h6">Adres Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İl" name="city" value={formData.city} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="İlçe" name="district" value={formData.district} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Adres" name="address" value={formData.address} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>


          {/* Fatura Adresi Bilgileri */}
          {formData.payment_type !== "Nejat" && (
          <>
            <Typography variant="h6">Fatura Bilgileri</Typography>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Vergi Numarası" name="tax_number" value={formData.tax_number} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Vergi Dairesi" name="tax_office" value={formData.tax_office} InputProps={{ readOnly: true }} />
              </Grid>
              {/* <Grid item xs={12}>
                <TextField fullWidth label="Fatura Adresi" name="billing_address" value={formData.billing_address} InputProps={{ readOnly: true }} />
              </Grid> */}
            </Grid>
          </>
          )}
          
          {isAdmin && (
            <>
              <Typography variant="h6">Ürün Geliş Fiyat Bilgileri</Typography>
              <Divider />
              <Grid container spacing={2}>
                {formData.products.map((p, index) => {
                  const product = products.find((prod) => prod.id === p.product_id);
                  const label = product ? `${product.name} - ${product.code}` : "Ürün bilinmiyor";

                  return (
                    <React.Fragment key={index}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Ürün"
                          value={label}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Geliş Fiyatı"
                          value={p.previous_price ?? "-"}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </React.Fragment>
                  );
                })}
              </Grid>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Kapat</Button>
      </DialogActions>

      <NotesPopup open={notesOpen} onClose={() => setNotesOpen(false)} orderId={orderId} />
    </Dialog>
  );
};

export default ViewOrderPage;
