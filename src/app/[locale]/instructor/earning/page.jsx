import React from 'react';
import EarningBoxes from './components/EarningBoxes';
import MonthEarning from './components/MonthEarning';
import TopEarning from './components/TopEarning';
export const metadata = {
  title: 'Earning'
};
const EarningPage = () => {
  return <>
      <EarningBoxes />
      <MonthEarning />
      <TopEarning />
    </>;
};
export default EarningPage;
