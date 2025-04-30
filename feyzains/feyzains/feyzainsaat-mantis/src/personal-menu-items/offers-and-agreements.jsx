import { FileTextFilled } from '@ant-design/icons';
// icons
const icons = {
  FileTextFilled
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const offersAndAgreements = {
  id: 'offers-and-agreements',
  title: 'Teklif ve Sözleşmeler',
  type: 'group',
  children: [
    {
      id: 'offers-and-agreements',
      title: 'Teklif ve Sözleşmeler',
      type: 'item',
      url: '/offers-and-agreements',
      icon: icons.FileTextFilled
    }
  ]
};

export default offersAndAgreements;
