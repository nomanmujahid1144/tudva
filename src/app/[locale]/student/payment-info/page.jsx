import React from 'react';
import PaymentMethods from './components/PaymentMethods';
import BillingAddress from './components/BillingAddress';
import BillingHistory from './components/BillingHistory';
export const metadata = {
  title: 'Payment Info'
};
const PaymentInfoPage = () => {
  return <>
      <PaymentMethods />
      <BillingAddress />
      <BillingHistory />
    </>;
};
export default PaymentInfoPage;
