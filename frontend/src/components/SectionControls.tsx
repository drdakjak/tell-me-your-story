import React from 'react';

interface SectionControlsProps {
  onAccept: () => void;
  onReject: () => void;
}

const SectionControls: React.FC<SectionControlsProps> = ({ onAccept, onReject }) => {
  return (
    <div className="mt-2 flex justify-end space-x-2">
      <button
        onClick={onAccept}
        className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
      >
        Accept
      </button>
      <button
        onClick={onReject}
        className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
      >
        Reject
      </button>
    </div>
  );
};

export default SectionControls;