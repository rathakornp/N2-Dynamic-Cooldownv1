import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// Fix: Corrected import path for types.
import { CalculationResults, LngIntroductionResults } from '../types.ts';
import PrintReport from './PrintReport.tsx';
import LngOnlyPrintReport from './LngOnlyPrintReport.tsx';
import { PrintMode } from '../App.tsx';

interface PrintPreviewModalProps {
  mode: PrintMode;
  results: CalculationResults;
  lngResults: LngIntroductionResults | null;
  onClose: () => void;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ mode, results, lngResults, onClose }) => {
  const [isPreparing, setIsPreparing] = useState(false);
  
  /**
   * Re-engineered handlePrint function for definitive reliability.
   * This method uses a robust, iterative html2canvas approach. It identifies all 
   * top-level "print-block" elements and renders them one by one. Before adding a 
   * block's image to the PDF, it checks if there's enough space on the current 
   * page. If not, it adds a new page. This content-aware method guarantees 
   * that charts and tables are never split across pages. It also uses JPEG 
   * compression for optimized file sizes.
   */
  const handlePrint = async () => {
    const printContentEl = document.getElementById('print-preview-content-area');
    if (!printContentEl) {
      console.error("Print content area not found.");
      return;
    }
    
    setIsPreparing(true);
    
    try {
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pageMargin = 15;
      const contentWidth = pdfWidth - (pageMargin * 2);
      
      const allBlocks = Array.from(printContentEl.querySelectorAll('.print-block'));
      
      // Critical fix: Ensure we only process top-level blocks to avoid duplication
      // of content from nested .print-block elements.
      const topLevelBlocks = allBlocks.filter(block => {
          let parent = block.parentElement;
          while(parent && parent !== printContentEl) {
              if (allBlocks.includes(parent)) {
                  return false; // It's a nested block, so we'll skip it in this main loop
              }
              parent = parent.parentElement;
          }
          return true; // It's a top-level block
      });

      let yPos = pageMargin;
      let pageNum = 1;

      for (let i = 0; i < topLevelBlocks.length; i++) {
        const block = topLevelBlocks[i] as HTMLElement;
        
        const isPageBreak = block.classList.contains('print-page-break');

        if (isPageBreak && yPos > pageMargin) {
          pdf.addPage();
          yPos = pageMargin;
          pageNum++;
        }

        const canvas = await html2canvas(block, { 
          scale: 1.5, // Good balance of quality and performance
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.90); // Use JPEG for smaller file size
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (yPos + imgHeight > pdfHeight - pageMargin) {
          if (pageNum > 1 || i > 0) { // Don't add a blank first page
             pdf.addPage();
          }
          yPos = pageMargin;
        }

        pdf.addImage(imgData, 'JPEG', pageMargin, yPos, contentWidth, imgHeight);
        yPos += imgHeight + 4; // Add a small gap between blocks
      }
      
      const fileName = mode === 'full' ? 'Full_Cooldown_Report.pdf' : 'LNG_Introduction_Report.pdf';
      pdf.save(fileName);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col w-full max-w-5xl h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
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

        <div className="flex-grow overflow-y-auto bg-gray-200 dark:bg-slate-900 p-8">
          <div id="print-preview-content-area" className="bg-white shadow-lg mx-auto" style={{ width: '210mm' }}>
            {/* The content to be printed is rendered here */}
            {mode === 'full' && <PrintReport results={results} lngResults={lngResults} />}
            {mode === 'lng-only' && lngResults && <LngOnlyPrintReport results={lngResults} />}
          </div>
        </div>

        <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-slate-700">
           <button
              onClick={handlePrint}
              disabled={isPreparing}
              className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isPreparing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2a1 1 0 011-1h8a1 1 0 011 1v2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Save to PDF
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
