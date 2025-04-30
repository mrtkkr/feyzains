import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import ChecklistIcon from '@mui/icons-material/Checklist';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  ChecklistIcon
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const checklist = {
  id: 'checklist',
  title: 'Checklist',
  type: 'group',
  children: [
    {
      id: 'checklist',
      title: 'Checklist',
      type: 'item',
      url: '/checklist',
      icon: icons.ChecklistIcon
    }
  ]
};

export default checklist;
