import React from 'react';

type Page = 'simulation' | 'details' | 'lng' | 'features' | 'guide' | 'contingency';

interface NavBarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  hasResults: boolean;
}

const NavLink: React.FC<{
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}> = ({ label, isActive, isDisabled, onClick }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800";
  const activeClasses = "bg-indigo-100 text-indigo-700 dark:bg-slate-700 dark:text-slate-100";
  const inactiveClasses = "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100";
  const disabledClasses = "text-gray-300 dark:text-slate-500 cursor-not-allowed";

  const getClasses = () => {
    if (isDisabled) return `${baseClasses} ${disabledClasses}`;
    if (isActive) return `${baseClasses} ${activeClasses}`;
    return `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <button onClick={onClick} disabled={isDisabled} className={getClasses()}>
      {label}
    </button>
  );
};


const NavBar: React.FC<NavBarProps> = ({ currentPage, setCurrentPage, hasResults }) => {
  return (
    <nav className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-8 flex space-x-4">
        <NavLink 
          label="N₂ Cooldown"
          isActive={currentPage === 'simulation'}
          isDisabled={false}
          onClick={() => setCurrentPage('simulation')}
        />
        <NavLink 
          label="Detailed Results"
          isActive={currentPage === 'details'}
          isDisabled={!hasResults}
          onClick={() => { if(hasResults) setCurrentPage('details')}}
        />
        <NavLink 
          label="LNG Introduction"
          isActive={currentPage === 'lng'}
          isDisabled={!hasResults}
          onClick={() => { if(hasResults) setCurrentPage('lng')}}
        />
        <NavLink 
          label="Operating Guide"
          isActive={currentPage === 'guide'}
          isDisabled={false}
          onClick={() => setCurrentPage('guide')}
        />
        <NavLink 
          label="Contingency & Margin"
          isActive={currentPage === 'contingency'}
          isDisabled={false}
          onClick={() => setCurrentPage('contingency')}
        />
        <NavLink 
          label="Features & Validity"
          isActive={currentPage === 'features'}
          isDisabled={false}
          onClick={() => setCurrentPage('features')}
        />
      </div>
    </nav>
  );
};

export default NavBar;