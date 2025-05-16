
import React from 'react';

const AdjustmentInfoPanel = () => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-4">How Adjustments Work</h3>
      <p className="text-gray-600 mb-4">
        When a Work Inspection Request (WIR) description contains any of the keywords defined above, 
        the system will automatically apply the corresponding percentage adjustment to the calculated amount.
      </p>
      <div className="bg-white p-4 rounded border border-gray-200">
        <h4 className="font-medium mb-2">Example:</h4>
        <p className="text-sm text-gray-600">
          If a WIR description contains the word "holes" and the adjustment has a value of SAR 1,000 with a 20% adjustment, 
          the result will be SAR 200 (value × percentage).
        </p>
      </div>
    </div>
  );
};

export default AdjustmentInfoPanel;
