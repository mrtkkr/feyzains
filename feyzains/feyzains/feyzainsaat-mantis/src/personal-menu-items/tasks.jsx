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

const tasks = {
  id: 'tasks',
  title: 'Görevler',
  type: 'group',
  children: [
    {
      id: 'tasks',
      title: 'Ana Görevler',
      type: 'item',
      url: '/main_tasks',
      icon: icons.AssignmentIcon
    }
  ]
};

export default tasks;
