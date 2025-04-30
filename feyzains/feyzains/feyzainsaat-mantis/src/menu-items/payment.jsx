import {
    AppstoreAddOutlined,
    AntDesignOutlined,
    BarcodeOutlined,
    BgColorsOutlined,
    FontSizeOutlined,
    LoadingOutlined
  } from '@ant-design/icons';
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
  
  const debt = {
    id: 'payment',
    title: 'Ödeme',
    type: 'group',
    children: [
      {
        id: 'payment',
        title: 'Ödemeler',
        type: 'item',
        url: '/payments',
        icon: icons.AssignmentIcon
      }
    ]
  };
  
  export default debt;
  