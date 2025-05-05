import React, { useContext, useState, useMemo, useEffect } from 'react';
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
  InputAdornment
} from '@mui/material';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { PanelContext } from 'contexts/admin/PanelContext';
import { WorksiteContext } from 'contexts/admin/feyzains/WorksiteContext';
import { GroupContext } from 'contexts/admin/feyzains/GroupContext';
import AddGroupPage from './Group/AddGroupPage';
import EditGroupPage from './Group/EditGroupPage';
import EditUserPage from './EditUserPage';
import EditWorksitePage from '../Panel/Worksite/EditWorksitePage';
import AddWorksitePage from '../Panel/Worksite/AddWorksitePage';
import { CompanyContext } from 'contexts/admin/feyzains/CompanyContext';
import AddCompanyPage from './Company/AddCompanyPage';
import EditCompanyPage from './Company/EditCompanyPage';
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
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

const PanelPage = () => {
  // States
  const [currentTaxRate, setCurrentTaxRate] = useState('');
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    phone: '',
    password: '',
    is_staff: false
  });
  const [warehouseUser, setWarehouseUser] = useState({
    type: 'manager',
    first_name: '',
    last_name: '',
    user_name: '',
    password: ''
  });

  // Context
  const { users, fetchUsers, createUser, deleteUser } = useContext(PanelContext);
  const { worksites, fetchWorksites, deleteWorksite } = useContext(WorksiteContext);
  const { groups, fetchGroups, addGroup, deleteGroup } = useContext(GroupContext);
  const { companies, fetchCompanies, addCompany, deleteCompany } = useContext(CompanyContext);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isEditWorksiteDialogOpen, setIsEditWorksiteDialogOpen] = useState(false);
  const [isCreateWorksiteDialogOpen, setIsCreateWorksiteDialogOpen] = useState(false);
  const [selectedWorksiteId, setSelectedWorksiteId] = useState(null);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false);
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  //const [notificationMessage, setNotificationMessage] = useState("");
  //const { createNotification } = useContext(NotificationContext);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    fetchWorksites();
  }, []);
  useEffect(() => {
    fetchGroups();
  }, []);
  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateDialogClose = () => {
    setIsCreateWorksiteDialogOpen(false);
    // Trigger a refresh only when needed
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleCreateGroupDialogClose = () => {
    setIsCreateGroupDialogOpen(false);
    // Trigger a refresh only when needed
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleCreateCompanyDialogClose = () => {
    setIsCreateCompanyDialogOpen(false);
    // Trigger a refresh only when needed
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const response = await createUser(newUser);
    if (response.success) {
      toast.success('Kullanıcı başarıyla eklendi');
      setNewUser({
        type: 'manager',
        first_name: '',
        last_name: '',
        user_name: '',
        password: '',
        is_staff: false
      });
      fetchUsers();
    } else {
      toast.error(response.error || 'Kullanıcı eklenemedi');
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

  const handleEditWorksite = (worksiteId = null) => {
    if (worksiteId) {
      setSelectedWorksiteId(worksiteId);
      setIsEditWorksiteDialogOpen(true);
    } else {
      setSelectedWorksiteId(null);
      setIsEditWorksiteDialogOpen(false);
    }
  };
  const handleEditGroup = (groupId = null) => {
    if (groupId) {
      setSelectedGroupId(groupId);
      setIsEditGroupDialogOpen(true);
    } else {
      setSelectedGroupId(null);
      setIsEditGroupDialogOpen(false);
    }
  };
  const handleEditCompany = (companyId = null) => {
    if (companyId) {
      setSelectedCompanyId(companyId);
      setIsEditCompanyDialogOpen(true);
    } else {
      setSelectedCompanyId(null);
      setIsEditCompanyDialogOpen(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      const response = await deleteUser(id);
      if (response.success) {
        toast.success('Kullanıcı başarıyla silindi');
        fetchUsers();
      } else {
        toast.error(response.error || 'Kullanıcı silinemedi');
      }
    }
  };

  const handleDeleteWorksite = async (id) => {
    if (window.confirm('Bu şantiyeyi silmek istediğinizden emin misiniz?')) {
      const response = await deleteWorksite(id);
      if (response.success) {
        toast.success('Şantiye başarıyla silindi');
        fetchWorksites();
      } else {
        toast.error(response.error || 'Şantiye silinemedi');
      }
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Bu grubu silmek istediğinizden emin misiniz?')) {
      const response = await deleteGroup(id);
      if (response.success) {
        toast.success('Grup başarıyla silindi');
        fetchGroups();
      } else {
        toast.error(response.error || 'Grup silinemedi');
      }
    }
  };
  const handleDeleteCompany = async (id) => {
    if (window.confirm('Bu şirketi silmek istediğinizden emin misiniz?')) {
      const response = await deleteCompany(id);
      if (response.success) {
        toast.success('Şirket başarıyla silindi');
        fetchCompanies();
      } else {
        toast.error(response.error || 'Şirket silinemedi');
      }
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!notificationMessage.trim()) return;

    const res = await createNotification({ message: notificationMessage });

    if (res?.response?.status === 201) {
      toast.success('Duyuru başarıyla eklendi');
      setNotificationMessage('');
    } else {
      toast.error('Duyuru eklenemedi');
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
  const createWorksiteProps = useMemo(
    () => ({
      open: isCreateWorksiteDialogOpen,
      onClose: handleCreateDialogClose
    }),
    [isCreateWorksiteDialogOpen]
  );
  const createGroupProps = useMemo(
    () => ({
      open: isCreateGroupDialogOpen,
      onClose: handleCreateGroupDialogClose
    }),
    [isCreateGroupDialogOpen]
  );
  const createCompanyProps = useMemo(
    () => ({
      open: isCreateCompanyDialogOpen,
      onClose: handleCreateCompanyDialogClose
    }),
    [isCreateCompanyDialogOpen]
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Yönetici Paneli
      </Typography>

      <Grid container spacing={3} mb={4}>
        {/* Sol: Yeni Yönetici Ekle Formu */}
        <Grid item xs={12} md={6}>
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

        {/* Sağ: Yöneticiler Tablosu */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" mb={1}>
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
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Şantiyeler
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCreateWorksiteDialogOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Şantiye Ekle
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ad</TableCell>
                      <TableCell>Oluşturan</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {worksites.map((worksite) => (
                      <TableRow key={worksite.id}>
                        <TableCell>{worksite.name}</TableCell>
                        <TableCell>{worksite.created_by?.username || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Düzenle">
                            <IconButton onClick={() => handleEditWorksite(worksite.id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton onClick={() => handleDeleteWorksite(worksite.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Gruplar
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCreateGroupDialogOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Grup Ekle
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ad</TableCell>
                      <TableCell>Oluşturan</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>{group.name}</TableCell>
                        <TableCell>{group.created_by?.username || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Düzenle">
                            <IconButton onClick={() => handleEditGroup(group.id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton onClick={() => handleDeleteGroup(group.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Şirketler
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setIsCreateCompanyDialogOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Şirket Ekle
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ad</TableCell>
                      <TableCell>Oluşturan</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>{company.name}</TableCell>
                        <TableCell>{company.created_by?.username || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Düzenle">
                            <IconButton onClick={() => handleEditCompany(company.id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton onClick={() => handleDeleteCompany(company.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isCreateWorksiteDialogOpen && <AddWorksitePage {...createWorksiteProps} />}
      {isEditWorksiteDialogOpen && selectedWorksiteId && (
        <EditWorksitePage open={isEditWorksiteDialogOpen} onClose={() => handleEditWorksite()} worksiteId={selectedWorksiteId} />
      )}

      {isCreateGroupDialogOpen && <AddGroupPage {...createGroupProps} />}
      {isEditGroupDialogOpen && selectedGroupId && (
        <EditGroupPage open={isEditGroupDialogOpen} onClose={() => handleEditGroup()} groupId={selectedGroupId} />
      )}

      {isCreateCompanyDialogOpen && <AddCompanyPage {...createCompanyProps} />}
      {isEditCompanyDialogOpen && selectedCompanyId && (
        <EditCompanyPage open={isEditCompanyDialogOpen} onClose={() => handleEditCompany()} companyId={selectedCompanyId} />
      )}

      {isEditUserDialogOpen && selectedUserId && (
        <EditUserPage open={isEditUserDialogOpen} onClose={() => handleEditUser()} userId={selectedUserId} />
      )}
    </Box>
  );
};

export default PanelPage;
