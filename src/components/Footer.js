import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-3 mt-auto w-100"> {/* Added w-100 for explicit full width */}
      <div className="text-center"> {/* Removed 'container' class */}
        <p className="mb-1">
          &copy; {currentYear} iNotebookPro by Angel Samuel. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
