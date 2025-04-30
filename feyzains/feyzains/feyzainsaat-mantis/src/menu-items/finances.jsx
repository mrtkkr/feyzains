import {
    AppstoreAddOutlined,
    AntDesignOutlined,
    BarcodeOutlined,
    BgColorsOutlined,
    FontSizeOutlined,
    LoadingOutlined
  } from '@ant-design/icons';
  import {
    AccountBalanceWalletOutlined,
    ReceiptOutlined,
    PaymentOutlined,
    BarChartOutlined,
  } from '@mui/icons-material';
  
  import AssignmentIcon from '@mui/icons-material/Assignment';
  
  // icons
  const icons = {
    FontSizeOutlined,
    BgColorsOutlined,
    BarcodeOutlined,
    AntDesignOutlined,
    LoadingOutlined,
    AppstoreAddOutlined,
    AssignmentIcon
  };
  
  // ==============================|| MENU ITEMS - UTILITIES ||============================== //
  
  

  const finances = {
    id: 'finances',
    title: 'Mâli',
    type: 'group',
    children: [
      {
        id: 'debt',
        title: 'Tedarikçi Carileri',
        type: 'item',
        url: '/debts',
        icon: AccountBalanceWalletOutlined
      },
      {
        id: 'receivable',
        title: 'Müşteri Carileri',
        type: 'item',
        url: '/receivables',
        icon: ReceiptOutlined
      },
      {
        id: 'payment',
        title: 'Ödemeler',
        type: 'item',
        url: '/payments',
        icon: PaymentOutlined
      },
      {
        id: 'finance',
        title: 'Mâli Rapor',
        type: 'item',
        url: '/finance',
        icon: BarChartOutlined
      }
    ]
  };
  
  export default finances;
  