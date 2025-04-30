import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import PersonIcon from '@mui/icons-material/Person';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  PersonIcon
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const personal = {
  id: 'personal',
  title: 'Personel',
  type: 'group',
  children: [
    {
      id: 'personel',
      title: 'Personel',
      type: 'item',
      url: '/personal',
      icon: icons.PersonIcon
    },
    {
      id: 'titles',
      title: 'Ünvanlar',
      type: 'item',
      url: '/titles',
      icon: icons.FontSizeOutlined,
      children: [
        {
          id: 'title-',
          title: 'Create Title',
          type: 'item',
          url: '/titles/create',
          icon: icons.AppstoreAddOutlined
        },
        {
          id: 'create-title',
          title: 'Create Title',
          type: 'item',
          url: '/titles/create',
          icon: icons.AppstoreAddOutlined
        },
        {
          id: 'update-title',
          title: 'Update Title',
          type: 'item',
          url: '/titles/update',
          icon: icons.LoadingOutlined
        }
      ]
    },
    {
      id: 'competency',
      title: 'Yetkinlikler',
      type: 'item',
      url: '/competency',
      icon: icons.BgColorsOutlined
    }
  ]
};

export default personal;
