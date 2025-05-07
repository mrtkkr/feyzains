import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AssignmentIcon from '@mui/icons-material/Assignment';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  AssignmentIcon,
  ChecklistIcon
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const checkList = {
  id: 'checklist',
  title: 'Çek Listesi',
  type: 'group',
  children: [
    {
      id: 'checklist',
      title: 'Çek Listesi',
      type: 'item',
      url: '/checklist',
      icon: icons.ChecklistIcon
    }
  ]
};

export default checkList;
