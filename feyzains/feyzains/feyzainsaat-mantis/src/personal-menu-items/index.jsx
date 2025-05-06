// project import
import dashboard from './dashboard';
import company from './company';
import personal from './personal';
import checklist from './checklist';
import tasks from './tasks';
import naceCodes from './nace-codes';
import offersAndAgreements from './offers-and-agreements';
import personalTasks from './personal-tasks';
import payment_entry from './payment_entry';
import invoice_bill from './invoice_bill';

// ==============================|| MENU ITEMS ||============================== //

const personalMenuItems = {
  items: [
    dashboard,
    company,
    personalTasks,
    naceCodes,
    payment_entry,
    invoice_bill
    // personal,
    // checklist,
    // tasks,

    // offersAndAgreements,

    // pages,
    // utilities,
    // support
  ]
};

export default personalMenuItems;
