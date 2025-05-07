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

const search = {
  id: 'search',
  title: 'Arama Bölümü',
  type: 'group',
  children: [
    {
      id: 'search',
      title: 'Arama Bölümü',
      type: 'item',
      url: '/search',
      icon: icons.AntDesignOutlined
    }
  ]
};

export default search;
