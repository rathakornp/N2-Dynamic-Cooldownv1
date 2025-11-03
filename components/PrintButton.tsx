import React from 'react';

interface PrintButtonProps {
  disabled: boolean;
}

const PrintButton: React.FC<PrintButtonProps> = ({ disabled }) => {

  const handlePrint = () => {
    const printContents = document.getElementById('print-report-container')?.innerHTML;
    if (!printContents) {
        console.error("Print container not found.");
        return;
    }
    
    // Gather all styles from the main document's head to apply to the new window
    const styles = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

    // Get the tailwind script, since it's critical for layout
    const tailwindScript = document.head.querySelector('script[src="https://cdn.tailwindcss.com"]')?.outerHTML || '';
    
    const printWindow = window.open('', '_blank', 'height=800,width=1000');
    
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html class="light" style="background-color: #ffffff;">
              <head>
                <title>N₂ Pipeline Cooldown Simulation Report</title>
                ${tailwindScript}
                ${styles}
              </head>
              <body class="bg-white">
                ${printContents}
              </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Use a timeout to allow the browser to render the content, especially charts, before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000); // 1 second delay is a pragmatic solution for chart rendering race conditions
    }
  };


  return (
    <button
      onClick={handlePrint}
      disabled={disabled}
      className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
      aria-label="Print Report"
      title="Print Report"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2a1 1 0 011-1h8a1 1 0 011 1v2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
      </svg>
      <span className="hidden md:inline">Print Report</span>
    </button>
  );
};

export default PrintButton;