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
  id: 'invoice_bill',
  title: 'Fatura Ödeme',
  type: 'group',
  children: [
    {
      id: 'invoice_bill',
      title: 'Fatura Ödeme',
      type: 'item',
      url: '/invoice_bill',
      icon: icons.AssignmentIcon
    }
  ]
};

export default debt;
