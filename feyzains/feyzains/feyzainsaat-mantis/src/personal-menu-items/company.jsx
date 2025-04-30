// general.jsx
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import BusinessIcon from '@mui/icons-material/Business';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  BusinessIcon
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const company = {
  id: 'company',
  title: 'Firma',
  type: 'group',
  children: [
    {
      id: 'company',
      title: 'Firmalar',
      type: 'item',
      url: '/company',
      icon: icons.BusinessIcon,
      children: [
        {
          id: 'companies',
          title: 'Firmalar',
          type: 'item',
          url: '',
          icon: icons.AppstoreAddOutlined
        }
      ]
    }
  ]
};

export default company;
