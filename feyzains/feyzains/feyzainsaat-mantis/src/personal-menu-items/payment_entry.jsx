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

const payment_entry = {
  id: 'payment_entry',
  title: 'Ödeme Girişi',
  type: 'group',
  children: [
    {
      id: 'payment_entry',
      title: 'Ödeme Girişi',
      type: 'item',
      url: '/payment_entry',
      icon: icons.AssignmentIcon
    }
  ]
};

export default payment_entry;
