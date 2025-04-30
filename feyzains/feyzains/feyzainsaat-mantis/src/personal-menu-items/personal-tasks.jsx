// general.jsx
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';

// icons
const icons = {
  BusinessIcon,
  AssignmentIcon
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const personalTasks = {
  id: 'personal-task',
  title: 'Görevler',
  type: 'group',
  children: [
    {
      id: 'personal-task',
      title: 'Görevler',
      type: 'item',
      url: '/tasks',
      icon: icons.AssignmentIcon
    }
  ]
};

export default personalTasks;
