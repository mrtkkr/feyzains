import React, { useEffect, useContext, useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Toolbar,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  TextField,
  Popover,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Delete, MoreVert, CheckOutlined, CloseOutlined, Add } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from 'contexts/admin/OrderContext';
import 'rsuite/dist/rsuite.min.css';
import { toast } from 'react-toastify';
import { formatDate } from 'utils/formatDate';
// import AddOrderDialog from './dialogs/AddOrderDialog';
import { getOrderStatus } from 'utils/statusCodes';
import OrderStatusTabs from './components/OrderTableTabs';
import AddOrderDialog from './dialogs/AddOrderDialog';
import { marketplacesList } from 'utils/marketplaces';
import { customerNameConverter } from 'utils/apiConverter';

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

const headCells = [
  { id: 'uuid', numeric: false, disablePadding: true, label: 'Sipariş Kodu' },
  { id: 'order_no', numeric: false, disablePadding: true, label: 'Sipariş No' },
  { id: 'customer', numeric: false, disablePadding: true, label: 'Alıcı' },
  { id: 'store_name', numeric: false, disablePadding: true, label: 'Mağaza' },
  { id: 'marketplace', numeric: false, disablePadding: true, label: 'Pazaryeri' },
  { id: 'created_at', numeric: true, disablePadding: true, label: 'Tarih' },
  { id: 'due_date', numeric: true, disablePadding: true, label: 'Tahmini Kargolama Tarihi' },

  { id: 'status', numeric: true, disablePadding: true, label: 'Durum' }
];

const EnhancedTableHead = React.memo((props) => {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all orders' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding="none"
            // padding={headCell.disablePadding ? 'none' : 'normal'}

            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell
          align="right"
          sx={{
            width: '1px',
            // whiteSpace: 'noWrap'
            whiteSpace: 'wrap'
          }}
        ></TableCell>
      </TableRow>
    </TableHead>
  );
});

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

function EnhancedTableToolbar(props) {
  const { numSelected, onCreateClick, searchFilters, setSearchFilters } = props;

  return (
    <Toolbar
      sx={[
        { pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, alignItems: 'start' },
        numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
        }
      ]}
    >
      <Box sx={{ flex: '1 1 100%' }}>
        <OrderStatusTabs searchFilters={searchFilters} setSearchFilters={setSearchFilters} />
      </Box>
      {numSelected > 0 && (
        <Tooltip title="Sil">
          <IconButton>
            <Delete />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Sipariş Oluştur">
        <Button disableElevation size="small" variant="contained" color="primary" onClick={onCreateClick}>
          <Add />
        </Button>
      </Tooltip>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onCreateClick: PropTypes.func.isRequired,
  searchFilters: PropTypes.object.isRequired,
  setSearchFilters: PropTypes.func.isRequired
};

export default function OrderListPage() {
  const orderContext = useContext(OrderContext);
  const navigate = useNavigate();

  const orders = useMemo(() => orderContext.orders.orders || [], [orderContext.orders.orders]);
  const orderCount = orderContext.orders.ordersCount || 0;

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [addOrderDialogOpen, setAddOrderDialogOpen] = useState(false);

  const handleMoreClick = (event, order) => {
    event.stopPropagation();
    setSelectedOrder(order);
    setAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const debounceTimeout = useRef(null);

  const [searchFilters, setSearchFilters] = useState({
    customer: '',
    status: 0
  });

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      orderContext.fetchOrders(page, rowsPerPage, searchFilters);
    }, 200);
  }, [page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      orderContext.fetchOrders(page, rowsPerPage, searchFilters);
    }, 200);
  }, [searchFilters]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = orders.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orderCount) : 0;

  const handleNavigateToOrderDetail = () => {
    navigate(`/order/${selectedOrder.uuid}`);
  };

  const handleApproveOrder = async ({ is_active }) => {
    try {
      const formData = new FormData();
      formData.append('id', selectedOrder.id);
      formData.append('is_active', is_active);

      const res = await orderContext.updateOrder(selectedOrder.uuid, formData);

      if (res.response.ok) {
        if (is_active) toast.success('Sipariş aktif edildi');
        else toast.success('Sipariş aktifliği kaldırıldı');
      } else {
        if (is_active) toast.error('Sipariş aktif edilirken bir hata oluştu');
        else toast.error('Sipariş aktifliği kaldırılırken bir hata oluştu');
        console.error('Error updating order:', res);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AddOrderDialog
        open={addOrderDialogOpen}
        handleClose={() => {
          setAddOrderDialogOpen(false);
        }}
      />
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          onCreateClick={() => setAddOrderDialogOpen(true)}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
        />
        <TableContainer>
          <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={orders.length}
            />
            <TableBody>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>
                  <TextField
                    label="Sipariş Kodu"
                    name="uuid"
                    value={searchFilters.uuid || ''}
                    onChange={handleSearchChange}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Sipariş No"
                    name="order_no"
                    value={searchFilters.order_no || ''}
                    onChange={handleSearchChange}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Alıcı"
                    name="customer"
                    value={searchFilters.customer || ''}
                    onChange={handleSearchChange}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Mağaza"
                    name="store_name"
                    value={searchFilters.store_name || ''}
                    onChange={handleSearchChange}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel id="marketplace-label">Pazaryeri</InputLabel>
                    <Select
                      labelId="marketplace-label"
                      id="marketplace-select"
                      value={searchFilters.marketplace || ''}
                      name="marketplace"
                      onChange={handleSearchChange}
                      fullWidth
                    >
                      {marketplacesList().map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
              {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order, index) => {
                const isItemSelected = selected.includes(order.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, order.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={order.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
                    </TableCell>
                    <TableCell align="left">{order.uuid}</TableCell>
                    <TableCell align="left">{order.order_no}</TableCell>
                    <TableCell align="left">
                      {customerNameConverter({ marketplace: order?.marketplace, customer: order.customer })}
                    </TableCell>
                    <TableCell align="left">{order.store_name}</TableCell>
                    <TableCell align="left">{order?.marketplace ?? 'Manuel'}</TableCell>
                    <TableCell align="right">{formatDate(order.created_at)}</TableCell>
                    <TableCell align="right">{formatDate(order.due_date)}</TableCell>

                    <TableCell align="right">{getOrderStatus({ statusCode: order.status })}</TableCell>
                    <TableCell align="right">
                      <Box display="inline-flex" gap={1}>
                        <IconButton
                          aria-label="more"
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={(event) => handleMoreClick(event, order)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Popover
                          elevation={3}
                          id={id}
                          open={open}
                          anchorEl={anchorEl}
                          onClose={(event) => {
                            event.stopPropagation();
                            handleMoreClose();
                          }}
                        >
                          <MenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              handleNavigateToOrderDetail();
                              handleMoreClose();
                            }}
                          >
                            <EyeOutlined style={{ marginRight: 8 }} />
                            Sipariş Detayına Git
                          </MenuItem>
                          {selectedOrder && selectedOrder.is_active ? (
                            <MenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                handleApproveOrder({ is_active: false });
                                handleMoreClose();
                              }}
                            >
                              <CloseOutlined fontSize="small" style={{ marginRight: 8 }} />
                              Siparişi Deaktive Et
                            </MenuItem>
                          ) : (
                            <MenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                handleApproveOrder({ is_active: true });
                                handleMoreClose();
                              }}
                            >
                              <CheckOutlined fontSize="small" style={{ marginRight: 8 }} />
                              Siparişi Aktif Et
                            </MenuItem>
                          )}
                        </Popover>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 ? (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={9} />
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={orderCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Sayfa başına satır:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Box>
  );
}
