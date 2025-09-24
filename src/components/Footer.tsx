import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 bg-muted mt-auto">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-lg font-bold text-black">ChedTix</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ched Inc.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
