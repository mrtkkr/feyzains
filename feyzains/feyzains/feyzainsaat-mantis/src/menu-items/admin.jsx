// general.jsx

  import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';

  
  
  // ==============================|| MENU ITEMS - UTILITIES ||============================== //
  
  const admin = {
    id: 'admin',
    title: 'Yönetici',
    type: 'group',
    children: [
      {
        id: 'admin',
        title: 'Yönetici Paneli',
        type: 'item',
        url: '/panel',
        icon: AdminPanelSettingsOutlined,
        
      }
    ]
  };
  
  export default admin;
  