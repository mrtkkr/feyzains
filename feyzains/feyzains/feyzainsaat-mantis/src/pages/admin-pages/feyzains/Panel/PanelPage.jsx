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
import { CustomerContext } from 'contexts/admin/feyzains/CustomerContext';
import AddCustomerPage from './Customer/AddCustomerPage';
import EditCustomerPage from './Customer/EditCustomerPage';
import { PersonalContext } from 'contexts/admin/feyzains/PersonalContext';
import AddPersonalPage from './Personal/AddPersonalPage';
import EditPersonalPage from './Personal/EditPersonalPage';
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
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const PanelPage = () => {
  // States
  const [currentTaxRate, setCurrentTaxRate] = useState('');
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    is_staff: false
  });
  const [warehouseUser, setWarehouseUser] = useState({
    type: 'manager',
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  // Context
  const { users, fetchUsers, createUser, deleteUser } = useContext(PanelContext);
  const { worksites, fetchWorksites, deleteWorksite } = useContext(WorksiteContext);
  const { groups, fetchGroups, addGroup, deleteGroup } = useContext(GroupContext);
  const { companies, fetchCompanies, addCompany, deleteCompany } = useContext(CompanyContext);
  const { customers, fetchCustomers, addCustomer, deleteCustomer } = useContext(CustomerContext);
  const { personals, fetchPersonals, addPersonal, deletePersonal } = useContext(PersonalContext);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  // Şantiye
  const [worksitePage, setWorksitePage] = useState(0);
  const [worksiteRowsPerPage, setWorksiteRowsPerPage] = useState(3);

  // Grup
  const [groupPage, setGroupPage] = useState(0);
  const [groupRowsPerPage, setGroupRowsPerPage] = useState(3);

  // Şirketler için
  const [companyPage, setCompanyPage] = useState(0);
  const [companyRowsPerPage, setCompanyRowsPerPage] = useState(3);

  // Müşteriler için
  const [customerPage, setCustomerPage] = useState(0);
  const [customerRowsPerPage, setCustomerRowsPerPage] = useState(3);

  const [personalPage, setPersonalPage] = useState(0);
  const [personalRowsPerPage, setPersonalRowsPerPage] = useState(3);

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
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [isCreateCustomerDialogOpen, setIsCreateCustomerDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isEditPersonalDialogOpen, setIsEditPersonalDialogOpen] = useState(false);
  const [isCreatePersonalDialogOpen, setIsCreatePersonalDialogOpen] = useState(false);
  const [selectedPersonalId, setSelectedPersonalId] = useState(null);
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
  useEffect(() => {
    fetchCustomers();
  }, []);
  useEffect(() => {
    fetchPersonals();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorksites, setFilteredWorksites] = useState([]);
  const [searchTerm2, setSearchTerm2] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm3, setSearchTerm3] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm4, setSearchTerm4] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm5, setSearchTerm5] = useState('');
  const [filteredPersonals, setFilteredPersonals] = useState([]);

  useEffect(() => {
    const filtered = worksites.filter((worksite) => worksite.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredWorksites(filtered);
  }, [searchTerm, worksites]);

  useEffect(() => {
    const filtered = groups.filter((group) => group.name?.toLowerCase().includes(searchTerm2.toLowerCase()));
    setFilteredGroups(filtered);
  }, [searchTerm2, groups]);
  useEffect(() => {
    const filtered = companies.filter((company) => company.name?.toLowerCase().includes(searchTerm3.toLowerCase()));
    setFilteredCompanies(filtered);
  }, [searchTerm3, companies]);
  useEffect(() => {
    const filtered = customers.filter((customer) => customer.name?.toLowerCase().includes(searchTerm4.toLowerCase()));
    setFilteredCustomers(filtered);
  }, [searchTerm4, customers]);
  useEffect(() => {
    const filtered = personals.filter((personal) => personal.name?.toLowerCase().includes(searchTerm5.toLowerCase()));
    setFilteredPersonals(filtered);
  }, [searchTerm5, personals]);

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

  // Şantiye için
  const handleWorksiteChangePage = (event, newPage) => {
    setWorksitePage(newPage);
  };

  const handleWorksiteChangeRowsPerPage = (event) => {
    setWorksiteRowsPerPage(parseInt(event.target.value, 10));
    setWorksitePage(0);
  };

  // Grup için
  const handleGroupChangePage = (event, newPage) => {
    setGroupPage(newPage);
  };

  const handleGroupChangeRowsPerPage = (event) => {
    setGroupRowsPerPage(parseInt(event.target.value, 10));
    setGroupPage(0);
  };

  // Şirket için
  const handleCompanyChangePage = (event, newPage) => {
    setCompanyPage(newPage);
  };

  const handleCompanyChangeRowsPerPage = (event) => {
    setCompanyRowsPerPage(parseInt(event.target.value, 10));
    setCompanyPage(0);
  };

  // Müşteri için
  const handleCustomerChangePage = (event, newPage) => {
    setCustomerPage(newPage);
  };

  const handleCustomerChangeRowsPerPage = (event) => {
    setCustomerRowsPerPage(parseInt(event.target.value, 10));
    setCustomerPage(0);
  };

  // Personel için
  const handlePersonalChangePage = (event, newPage) => {
    setPersonalPage(newPage);
  };

  const handlePersonalChangeRowsPerPage = (event) => {
    setPersonalRowsPerPage(parseInt(event.target.value, 10));
    setPersonalPage(0);
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
  const handleCreateCustomerDialogClose = () => {
    setIsCreateCustomerDialogOpen(false);
    // Trigger a refresh only when needed
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleCreatePersonalDialogClose = () => {
    setIsCreatePersonalDialogOpen(false);
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
        email: '',
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
  const handleEditCustomer = (customerId = null) => {
    if (customerId) {
      setSelectedCustomerId(customerId);
      setIsEditCustomerDialogOpen(true);
    } else {
      setSelectedCustomerId(null);
      setIsEditCustomerDialogOpen(false);
    }
  };
  const handleEditPersonal = (personalId = null) => {
    if (personalId) {
      setSelectedPersonalId(personalId);
      setIsEditPersonalDialogOpen(true);
    } else {
      setSelectedPersonalId(null);
      setIsEditPersonalDialogOpen(false);
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
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      const response = await deleteCustomer(id);
      if (response.success) {
        toast.success('Müşteri başarıyla silindi');
        fetchCustomers();
      } else {
        toast.error(response.error || 'Müşteri silinemedi');
      }
    }
  };
  const handleDeletePersonal = async (id) => {
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      const response = await deletePersonal(id);
      if (response.success) {
        toast.success('Personel başarıyla silindi');
        fetchPersonals();
      } else {
        toast.error(response.error || 'Personel silinemedi');
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
  const createCustomerProps = useMemo(
    () => ({
      open: isCreateCustomerDialogOpen,
      onClose: handleCreateCustomerDialogClose
    }),
    [isCreateCustomerDialogOpen]
  );
  const createPersonalProps = useMemo(
    () => ({
      open: isCreatePersonalDialogOpen,
      onClose: handleCreatePersonalDialogClose
    }),
    [isCreatePersonalDialogOpen]
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
                      label="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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
                  <TableCell>Email</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUserRows.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
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

                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    label="Şantiye Ara"
                    variant="outlined"
                    size="medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 250 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateWorksiteDialogOpen(true)}
                  >
                    Şantiye Ekle
                  </Button>
                </Box>
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
                    {filteredWorksites
                      .slice(worksitePage * worksiteRowsPerPage, worksitePage * worksiteRowsPerPage + worksiteRowsPerPage)
                      .map((worksite) => (
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
                <TablePagination
                  component="div"
                  count={filteredWorksites.length}
                  page={worksitePage}
                  onPageChange={handleWorksiteChangePage}
                  rowsPerPage={worksiteRowsPerPage}
                  onRowsPerPageChange={handleWorksiteChangeRowsPerPage}
                  rowsPerPageOptions={[3, 10, 25]}
                />
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

                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    label="Grup Ara"
                    variant="outlined"
                    size="medium"
                    value={searchTerm2}
                    onChange={(e) => setSearchTerm2(e.target.value)}
                    sx={{ width: 250 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateGroupDialogOpen(true)}
                  >
                    Grup Ekle
                  </Button>
                </Box>
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
                    {filteredWorksites.slice(groupPage * groupRowsPerPage, groupPage * groupRowsPerPage + groupRowsPerPage).map((group) => (
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
                <TablePagination
                  component="div"
                  count={filteredGroups.length}
                  page={groupPage}
                  onPageChange={handleGroupChangePage}
                  rowsPerPage={groupRowsPerPage}
                  onRowsPerPageChange={handleGroupChangeRowsPerPage}
                  rowsPerPageOptions={[3, 10, 25]}
                />
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

                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    label="Şirket Ara"
                    variant="outlined"
                    size="medium"
                    value={searchTerm3}
                    onChange={(e) => setSearchTerm3(e.target.value)}
                    sx={{ width: 250 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateCompanyDialogOpen(true)}
                  >
                    Şirket Ekle
                  </Button>
                </Box>
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
                    {filteredCompanies
                      .slice(companyPage * companyRowsPerPage, companyPage * companyRowsPerPage + companyRowsPerPage)
                      .map((company) => (
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
                <TablePagination
                  component="div"
                  count={filteredCompanies.length}
                  page={companyPage}
                  onPageChange={handleCompanyChangePage}
                  rowsPerPage={companyRowsPerPage}
                  onRowsPerPageChange={handleCompanyChangeRowsPerPage}
                  rowsPerPageOptions={[3, 10, 25]}
                />
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Müşteriler
                </Typography>

                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    label="Müşteri Ara"
                    variant="outlined"
                    size="medium"
                    value={searchTerm4}
                    onChange={(e) => setSearchTerm4(e.target.value)}
                    sx={{ width: 250 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateCustomerDialogOpen(true)}
                  >
                    Müşteri Ekle
                  </Button>
                </Box>
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
                    {filteredCustomers
                      .slice(customerPage * customerRowsPerPage, customerPage * customerRowsPerPage + customerRowsPerPage)
                      .map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.created_by?.username || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Düzenle">
                              <IconButton onClick={() => handleEditCustomer(customer.id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton onClick={() => handleDeleteCustomer(customer.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={filteredCustomers.length}
                  page={customerPage}
                  onPageChange={handleCustomerChangePage}
                  rowsPerPage={customerRowsPerPage}
                  onRowsPerPageChange={handleCustomerChangeRowsPerPage}
                  rowsPerPageOptions={[3, 10, 25]}
                />
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Personeller
                </Typography>

                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    label="Personel Ara"
                    variant="outlined"
                    size="medium"
                    value={searchTerm5}
                    onChange={(e) => setSearchTerm5(e.target.value)}
                    sx={{ width: 250 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreatePersonalDialogOpen(true)}
                  >
                    Personel Ekle
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ad</TableCell>
                      <TableCell>TC Kimlik No</TableCell>
                      <TableCell>Kayıt Tarihi</TableCell>
                      <TableCell>Giriş</TableCell>
                      <TableCell>Çıkış</TableCell>
                      <TableCell>Şantiye</TableCell>
                      <TableCell>Oluşturan</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPersonals
                      .slice(personalPage * personalRowsPerPage, personalPage * personalRowsPerPage + personalRowsPerPage)
                      .map((personal) => (
                        <TableRow key={personal.id}>
                          <TableCell>{personal.name}</TableCell>
                          <TableCell>{personal.identity_number}</TableCell>
                          <TableCell>{formatDate(personal.creation_date)}</TableCell>
                          <TableCell>{formatDate(personal.entry)}</TableCell>
                          <TableCell>{formatDate(personal.exit)}</TableCell>
                          <TableCell>{personal.worksite_detail?.name || '-'}</TableCell>
                          <TableCell>{personal.created_by?.username || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Düzenle">
                              <IconButton onClick={() => handleEditPersonal(personal.id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton onClick={() => handleDeletePersonal(personal.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>

                  {/* <TableBody>
                    {filteredPersonals.map((personal) => (
                      <TableRow key={personal.id}>
                        <TableCell>{personal.name}</TableCell>
                        <TableCell>{personal.identity_number}</TableCell>
                        <TableCell>{personal.creation_date?.slice(0, 16).replace('T', ' ') || '-'}</TableCell>
                        <TableCell>{personal.entry?.slice(0, 16).replace('T', ' ') || '-'}</TableCell>
                        <TableCell>{personal.exit?.slice(0, 16).replace('T', ' ') || '-'}</TableCell>
                        <TableCell>{personal.worksite_detail?.name || '-'}</TableCell>
                        <TableCell>{personal.created_by?.username || '-'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Düzenle">
                            <IconButton onClick={() => handleEditPersonal(personal.id)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton onClick={() => handleDeletePersonal(personal.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody> */}
                </Table>
                <TablePagination
                  component="div"
                  count={filteredPersonals.length}
                  page={personalPage}
                  onPageChange={handlePersonalChangePage}
                  rowsPerPage={personalRowsPerPage}
                  onRowsPerPageChange={handlePersonalChangeRowsPerPage}
                  rowsPerPageOptions={[3, 10, 25]}
                />
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Diğer bileşenler burada */}
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
      {isCreateCustomerDialogOpen && <AddCustomerPage {...createCustomerProps} />}
      {isEditCustomerDialogOpen && selectedCustomerId && (
        <EditCustomerPage open={isEditCustomerDialogOpen} onClose={() => handleEditCustomer()} customerId={selectedCustomerId} />
      )}
      {isCreatePersonalDialogOpen && <AddPersonalPage {...createPersonalProps} />}
      {isEditPersonalDialogOpen && selectedPersonalId && (
        <EditPersonalPage open={isEditPersonalDialogOpen} onClose={() => handleEditPersonal()} personalId={selectedPersonalId} />
      )}

      {isEditUserDialogOpen && selectedUserId && (
        <EditUserPage open={isEditUserDialogOpen} onClose={() => handleEditUser()} userId={selectedUserId} />
      )}
    </Box>
  );
};

export default PanelPage;
