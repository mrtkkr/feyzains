import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { PanelContext } from "contexts/admin/PanelContext";
import EditUserPage from "./EditUserPage";
//import { NotificationContext } from "contexts/auth/NotificationContext"; // ekle



function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

const PanelPage = () => {
  // States
  const [currentTaxRate, setCurrentTaxRate] = useState("");
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    phone: "",
    password: "",
    is_staff: false,
  });
  const [warehouseUser, setWarehouseUser] = useState({
    type: "manager",
    first_name: "",
    last_name: "",
    user_name: "",
    password: ""
  });

  

// Context
const { users, fetchUsers, createUser, deleteUser } = useContext(PanelContext);
const [order, setOrder] = useState("asc");
const [orderBy, setOrderBy] = useState("date");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(25);
const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
const [selectedUserId, setSelectedUserId] = useState(null);
//const [notificationMessage, setNotificationMessage] = useState("");
//const { createNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const response = await createUser(newUser);
    if (response.success) {
      toast.success("Kullanıcı başarıyla eklendi");
      setNewUser({
        type: "manager",
        first_name: "",
        last_name: "",
        user_name: "",
        password: "",
        is_staff: false,
      });
      fetchUsers();
    } else {
      toast.error(response.error || "Kullanıcı eklenemedi");
    }
  };
  
  const handleEditUserClick = (id) => {
    setSelectedUserId(id);
    setIsEditUserDialogOpen(true);
  };

  const handleEditUser = () => {
    setIsEditUserDialogOpen(false);
    setSelectedUserId(null);
    fetchUsers();
    };
  
  const handleDeleteUser = async (id) => {
    if (window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      const response = await deleteUser(id);
      if (response.success) {
        toast.success("Kullanıcı başarıyla silindi");
        fetchUsers();
      } else {
        toast.error(response.error || "Kullanıcı silinemedi");
      }
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!notificationMessage.trim()) return;
  
    const res = await createNotification({ message: notificationMessage });
  
    if (res?.response?.status === 201) {
      toast.success("Duyuru başarıyla eklendi");
      setNotificationMessage("");
    } else {
      toast.error("Duyuru eklenemedi");
    }
  };


  

  

  const visibleUserRows = useMemo(
    () =>
      users
        .slice()
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, users]
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
    <Typography variant="h4" gutterBottom>
      Yönetici Paneli
    </Typography>
      <Grid container spacing={3} mb={4}>
        {/* User Creation Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Yeni Yönetici Ekle
              </Typography>
              <Box component="form" onSubmit={handleUserSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ad"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Soyad"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Kullanıcı Adı"
                      value={newUser.user_name}
                      onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="phone"
                      label="Telefon"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Şifre"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                      Ekle
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
         
      </Grid>
      {isEditUserDialogOpen && selectedUserId && (
        <EditUserPage
            open={isEditUserDialogOpen}
            onClose={() => handleEditUser()}
            userId={selectedUserId}
        />
       )}
      {/* Users Table */}
      <Typography variant="h6" mt={4} mb={1}>
        Yöneticiler
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Soyad</TableCell>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleUserRows.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.first_name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.user_name}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Düzenle">
                  <IconButton onClick={() => handleEditUserClick(user.id)}>
                        <EditIcon />
                  </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton onClick={() => handleDeleteUser(user.id)}>
                        <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[50, 75]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> 
    </Box>
  );
};

export default PanelPage;