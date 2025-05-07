// project import
import company from './company';
import personal from './personal';
import inventory from './inventory';
import finances from './finances';
import admin from './admin';
import payment_entry from './entryPayment';
import invoice_bill from './invoiceBill';
import search from './search';
import checkList from './checkList';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    // company,
    // inventory,
    // finances,
    payment_entry,
    invoice_bill,
    search,
    checkList,
    admin
  ]
};

export default menuItems;
