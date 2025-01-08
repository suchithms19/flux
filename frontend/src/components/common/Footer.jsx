import React from 'react';
import { Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black	 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Flux</h3>
            <p className="text-gray-400 text-sm">
            Connect with mentors for actionable advice to land your dream job, start freelancing, or learn new skills.


            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="https://x.com/getflux_tech/media" target="_blank" className="hover:text-customYellow transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.linkedin.com/in/flux-115740331/" target="_blank" className="hover:text-customYellow transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://www.instagram.com/getflux.tech?igsh=M3k1NzJzOXBnc3Rl" target="_blank" className="hover:text-customYellow transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

         
          

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="mailto:getflux.tech@gmail.com" target="_blank">getflux.tech@gmail.com</a></li>
            </ul>
          </div>

     
         
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 sm:mb-0">
              © {currentYear} Flux. All rights reserved.
            </div>
            <div className="flex space-x-4 text-sm text-gray-400">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;