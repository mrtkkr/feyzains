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

const inventory = {
  id: 'inventory',
  title: 'Mal Stok',
  type: 'group',
  children: [
    {
      id: 'inventory',
      title: 'Mal Stok',
      type: 'item',
      url: '/inventory',
      icon: icons.AssignmentIcon
    }
  ]
};

export default inventory;
