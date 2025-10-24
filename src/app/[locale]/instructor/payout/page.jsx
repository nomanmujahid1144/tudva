import React from 'react';
import PayoutBoxs from './components/PayoutBoxs';
import Payouts from './components/Payouts';
export const metadata = {
  title: 'Payout'
};
const PayoutPage = () => {
  return <>
   <PayoutBoxs />
   <Payouts />
   </>;
};
export default PayoutPage;
