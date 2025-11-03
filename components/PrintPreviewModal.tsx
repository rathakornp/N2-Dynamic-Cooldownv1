import React from 'react';
import { CalculationResults } from '../types';
import PrintReport from './PrintReport';

interface PrintPreviewModalProps {
  results: CalculationResults;
  onClose: () => void;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ results, onClose }) => {
  return (
    // Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 print-preview-backdrop" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Panel */}
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col w-full max-w-4xl h-[90vh] print-preview-panel"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 print-preview-header">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Report Preview</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content (The Report Preview) */}
        <div className="flex-grow overflow-y-auto bg-gray-200 dark:bg-slate-900 p-8 print-preview-content">
          <div className="bg-white shadow-lg mx-auto print-preview-paper" style={{ width: '210mm', minHeight: '297mm' }}>
             <PrintReport results={results} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-slate-700 print-preview-footer">
           <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2a1 1 0 011-1h8a1 1 0 011 1v2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print to PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;