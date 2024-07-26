import React from 'react';
import CSVGraph from './CSVrenderer';


const CSVDisplay: React.FC = () => {
  const localFilePath: string = '/data.sv'

  return (
    <div>
      <h1>CSV Display</h1>
      <CSVGraph filePath={localFilePath} />
    </div>
  );
};

export default CSVDisplay;