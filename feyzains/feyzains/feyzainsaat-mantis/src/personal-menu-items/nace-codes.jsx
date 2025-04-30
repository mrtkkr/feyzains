// assets
import { ChromeOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const naceCodes = {
  id: 'nace-codes',
  title: 'Faaliyet Kodları',
  type: 'group',
  children: [
    {
      id: 'nace-codes',
      title: 'Faaliyet Kodları',
      type: 'item',
      url: '/nace-codes',
      icon: icons.ChromeOutlined
    }
  ]
};

export default naceCodes;
