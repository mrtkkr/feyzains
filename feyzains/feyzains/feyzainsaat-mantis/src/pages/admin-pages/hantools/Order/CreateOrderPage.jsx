import React, { useState, useContext, useEffect, useRef } from "react";
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
  IconButton
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { OrderContext } from "contexts/admin/OrderContext";
import { ProductContext } from "contexts/admin/ProductContext";
import { CustomerContext } from "contexts/admin/CustomerContext";
import CircularProgress from "@mui/material/CircularProgress";

const CreateOrderPage = ({ open, onClose }) => {
  const { createOrder, fetchOrders } = useContext(OrderContext);
  const { products, loading, fetchProducts } = useContext(ProductContext);
  const { customers, createCustomer, fetchCustomers  } = useContext(CustomerContext);
  const debounceTimeout = useRef({});

  const [formData, setFormData] = useState({
    products: [{ product_id: "", selected_product: null, quantity: 1, unit_price: 0, extracted_products: [] }],
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
    price: "",
    note: ""

  });

  useEffect(() => {
    fetchProducts({ page: 1, pageSize: 10 });
  }, []);

  const addProductField = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product_id: "", quantity: 1, unit_price: 0, extracted_products: [] }]
    }));
  };

  const removeProductField = (index) => {
    setFormData((prev) => {
      if (prev.products.length === 1) return prev;
      const newProducts = prev.products.filter((_, i) => i !== index);
      return { ...prev, products: newProducts };
    });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    if (field === "product_id") {
      const selected = products.find(p => p.id === value) || null;
      newProducts[index].product_id = value;
      newProducts[index].selected_product = selected;
    } else {
      newProducts[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const addExtractedProductFieldFor = (productIndex) => {
    const newProducts = [...formData.products];
    newProducts[productIndex].extracted_products.push({ product_id: "", quantity: 1 });
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleExtractedProductChangeFor = (productIndex, extractedIndex, field, value) => {
    const newProducts = [...formData.products];
    const extracted = newProducts[productIndex].extracted_products;
    if (field === "product_id") {
      const selected = products.find(p => p.id === value) || null;
      extracted[extractedIndex] = {
        ...extracted[extractedIndex],
        product_id: value,
        selected_product: selected
      };
    } else {
      extracted[extractedIndex] = {
        ...extracted[extractedIndex],
        [field]: value
      };
    }
    newProducts[productIndex].extracted_products = extracted;
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId) || null;

    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      customer_name: customer?.name || "",
      customer_phone: customer?.phone || "",
      city: customer?.city || "",
      district: customer?.district || "",
      address: customer?.address || "",
      tax_number: customer?.tax_number || "",
      tax_office: customer?.tax_office || "",
      billing_address: customer?.billing_address || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.products.length || !formData.payment_type || !formData.address) {
      toast.error("Lütfen gerekli alanları doldurun!");
      return;
    }
  
    try {
      const customerId = await createCustomerIfNeeded(); // ⭐️ müşteri varsa id, yoksa oluştur
  
      const orderData = {
        customer_id: customerId,
        city: formData.city,
        district: formData.district,
        address: formData.address,
        tax_number: formData.tax_number,
        tax_office: formData.tax_office,
        billing_address: formData.billing_address,
        payment_type: formData.payment_type,
        status: "Beklemede",
        price: parseFloat(formData.price) || 0,
        order_products: formData.products.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity,
          extracted_products: (p.extracted_products || []).map(ep => ({
            product_id: ep.product_id,
            quantity: ep.quantity
          }))
        })),
        note: formData.note,

      };
  
      const res = await createOrder(orderData);
      if (res.error) toast.error("Sipariş eklenemedi!");
      else {
        toast.success("Sipariş başarıyla eklendi!");
        fetchOrders();
        onClose();
      }
    } catch (err) {
      // hata zaten üstte toast'landı
    }
  };

  const getOptionList = (products, selectedId) => {
    const selectedProduct = products.find(p => p.id === selectedId);
    if (selectedProduct) {
      return [selectedProduct, ...products.filter(p => p.id !== selectedId)];
    }
    return products;
  };

  const createCustomerIfNeeded = async () => {
    if (formData.customer_id) return formData.customer_id;
  
    try {
      const newCustomer = {
        name: formData.customer_name,
        phone: formData.customer_phone,
        city: formData.city,
        district: formData.district,
        address: formData.address,
        billing_address: formData.billing_address,
        tax_number: formData.tax_number,
        tax_office: formData.tax_office
      };
  
      const res = await createCustomer(newCustomer);
  
      if (res?.customer?.id) {
        await fetchCustomers(); // Yeni müşteri eklendikten sonra listeyi güncelle
        return res.customer.id;
      } else {
        toast.error("Yeni müşteri oluşturulamadı.");
        throw new Error("Yeni müşteri oluşturulamadı.");
      }
    } catch (err) {
      toast.error("Yeni müşteri oluşturulurken bir hata oluştu.");
      throw err;
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrder({ id: orderId, status: newStatus });
    if (res.success) {
      toast.success("Durum güncellendi");
      fetchOrders(); // Tabloyu tazele
    } else {
      toast.error("Durum güncellenemedi");
    }
  };
  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Sipariş Ekle</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Müşteri Bilgileri */}
          <Typography variant="h6">Müşteri Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={customers}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : `${option.name} - ${option.phone}`
              }
              value={
                customers.find(c => c.id === formData.customer_id) || formData.customer_name
              }
              onChange={(e, newValue) => {
                if (typeof newValue === 'string') {
                  // Yeni müşteri ismi yazıldı
                  setFormData(prev => ({
                    ...prev,
                    customer_id: "",
                    customer_name: newValue
                  }));
                } else {
                  // Mevcut müşteri seçildi
                  setFormData(prev => ({
                    ...prev,
                    customer_id: newValue?.id || "",
                    customer_name: newValue?.name || "",
                    customer_phone: newValue?.phone || "",
                    city: newValue?.city || "",
                    district: newValue?.district || "",
                    address: newValue?.address || "",
                    tax_number: newValue?.tax_number || "",
                    tax_office: newValue?.tax_office || "",
                    billing_address: newValue?.billing_address || "",
                  }));
                }
              }}
              onInputChange={(e, newInputValue) => {
                setFormData(prev => ({
                  ...prev,
                  customer_name: newInputValue
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Müşteri Seç veya Yeni Gir" variant="outlined" fullWidth />
              )}
            />
            </Grid>
          </Grid>

          {/* Ürünler */}
          <Typography variant="h6">Ürün ve Çıkartılacak Ürünler</Typography>
          <Divider />
          {formData.products.map((p, index) => {
            const productOptions = getOptionList(products, p.product_id);
            return (
              <Box key={index}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <Autocomplete
                      loading={loading}
                      options={productOptions}
                      getOptionLabel={(option) => typeof option === "string" ? option : `${option.code} - ${option.name}`}
                      value={p.selected_product || null}
                      isOptionEqualToValue={(a, b) => a.id === b.id}
                      onInputChange={(e, val, reason) => {
                        if (reason === "input") {
                          clearTimeout(debounceTimeout.current[`product-${index}`]);
                          debounceTimeout.current[`product-${index}`] = setTimeout(() => {
                            fetchProducts({ page: 1, pageSize: 10, search: val });
                          }, 300);
                        }
                      }}
                      onChange={(e, selected) => handleProductChange(index, "product_id", selected?.id || "")}
                      renderInput={(params) => (
                        <TextField {...params} label="Ürün Seç" fullWidth variant="outlined" InputProps={{
                          ...params.InputProps,
                          endAdornment: <>{loading ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>
                        }} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Adet"
                      type="number"
                      value={p.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ display: "flex", gap: 1 }}>
                    <IconButton onClick={addProductField} color="primary"><AddIcon /></IconButton>
                    <IconButton onClick={() => removeProductField(index)} color="secondary" disabled={formData.products.length === 1}><RemoveIcon /></IconButton>
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined" size="small" onClick={() => addExtractedProductFieldFor(index)}>
                      Çıkartılacak Ürün Ekle
                    </Button>
                  </Grid>
                </Grid>

                {(p.extracted_products || []).map((ep, epIndex) => {
                  const extractedOptions = getOptionList(products, ep.product_id);
                  return (
                    <Grid container spacing={2} key={`product-${index}-ep-${epIndex}`} alignItems="center" sx={{ pl: 2, mt: 1 }}>
                      <Grid item xs={8}>
                        <Autocomplete
                          loading={loading}
                          options={extractedOptions}
                          getOptionLabel={(option) => typeof option === "string" ? option : `${option.code} - ${option.name}`}
                          value={ep.selected_product || null}
                          isOptionEqualToValue={(a, b) => a.id === b.id}
                          onInputChange={(e, val, reason) => {
                            if (reason === "input") {
                              clearTimeout(debounceTimeout.current[`product-${index}-ep-${epIndex}`]);
                              debounceTimeout.current[`product-${index}-ep-${epIndex}`] = setTimeout(() => {
                                fetchProducts({ page: 1, pageSize: 10, search: val });
                              }, 300);
                            }
                          }}
                          onChange={(e, selected) => handleExtractedProductChangeFor(index, epIndex, "product_id", selected?.id || "")}
                          renderInput={(params) => (
                            <TextField {...params} label="Çıkartılacak Ürün" fullWidth variant="outlined" InputProps={{
                              ...params.InputProps,
                              endAdornment: <>{loading ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>
                            }} />
                          )}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label="Adet"
                          type="number"
                          value={ep.quantity}
                          onChange={(e) => handleExtractedProductChangeFor(index, epIndex, "quantity", parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={2} sx={{ display: "flex", gap: 1 }}>
                        <IconButton onClick={() => addExtractedProductFieldFor(index)} color="primary"><AddIcon /></IconButton>
                        <IconButton
                          onClick={() => {
                            const newProducts = [...formData.products];
                            if (newProducts[index].extracted_products.length === 1) return;
                            newProducts[index].extracted_products = newProducts[index].extracted_products.filter((_, i) => i !== epIndex);
                            setFormData((prev) => ({ ...prev, products: newProducts }));
                          }}
                          color="secondary"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  );
                })}
              </Box>
            );
          })}

          {/* Ödeme ve Adres Bilgileri */}
          <Typography variant="h6">Ödeme ve Adres Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Ödeme Yöntemi</InputLabel>
                <Select name="payment_type" value={formData.payment_type} onChange={handleChange}>
                  <MenuItem value="Nejat">Nejat</MenuItem>
                  <MenuItem value="Han">Han</MenuItem>
                  <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Durum</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <MenuItem value="Beklemede">Beklemede</MenuItem>
                  <MenuItem value="Hazırlanıyor">Hazırlanıyor</MenuItem>
                  <MenuItem value="Kargoda">Kargoda</MenuItem>
                  <MenuItem value="İptal">İptal</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Toplam Tutar"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6">Adres Bilgileri</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField fullWidth label="İl" name="city" value={formData.city} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="İlçe" name="district" value={formData.district} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Adres" name="address" value={formData.address} onChange={handleChange} required /></Grid>
          </Grid>

          {formData.payment_type !== "Nejat" && (
            <>
              <Typography variant="h6">Fatura Bilgileri</Typography>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Vergi Numarası" name="tax_number" value={formData.tax_number} onChange={handleChange} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Vergi Dairesi" name="tax_office" value={formData.tax_office} onChange={handleChange} /></Grid>
                {/*<Grid item xs={12}><TextField fullWidth label="Fatura Adresi" name="billing_address" value={formData.billing_address} onChange={handleChange} /></Grid>*/}
              </Grid>
            </>
          )}

          {/* Yeni Not Ekleme */}
          <Typography variant="h6">Sipariş Notları</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Sipariş ile ilgili not ekleyin..."
                name="note"
                value={formData.note}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">İptal</Button>
        <Button onClick={handleSubmit} color="primary">Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderPage;
