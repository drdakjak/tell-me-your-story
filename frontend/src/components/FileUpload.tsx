import React, { memo } from 'react';
import { IoCloudUploadOutline } from 'react-icons/io5';

const FileUpload: React.FC = () => {
  return (
    <div className="py-4">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <IoCloudUploadOutline className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept=".pdf" />
      </label>
    </div>
  );
};

export default memo(FileUpload);