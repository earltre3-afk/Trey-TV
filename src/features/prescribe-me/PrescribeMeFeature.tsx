import React from 'react';
import PrescribeMeApp from './PrescribeMeApp';
import { AppProvider } from './AppContext';

const PrescribeMeFeature: React.FC = () => {
  return (
    <AppProvider>
      <PrescribeMeApp />
    </AppProvider>
  );
};

export default PrescribeMeFeature;
