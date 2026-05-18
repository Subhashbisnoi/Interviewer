import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import logo from '../images/ChatGPT_Image_Dec_12__2025_at_11_57_18_AM-removebg-preview.png';

const Footer = () => {
  const year = new Date().getFullYear();

  const link = 'text-slate-400 hover:text-white transition-colors text-sm';

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            {/* Logo mark + name — matches Header */}
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="InterviewForge" className="h-9 w-9 object-contain" />
              <span className="text-white font-extrabold text-lg tracking-tight">InterviewForge</span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-5">
              Practice interviews with adaptive AI, build your talent profile, and get discovered by top companies.
              Your scores are your resume.
            </p>

            <div className="flex items-center gap-4">
              <a href="https://twitter.com/interviewforge" target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors">
                {/* X (Twitter) */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com/company/interviewforge" target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors">
              {/* LinkedIn */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="mailto:support@interviewforge.live"
                className="text-slate-500 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-2.5">
              <li><Link to="/" className={link}>Home</Link></li>
              <li><Link to="/pricing" className={link}>Pricing & Credits</Link></li>
              <li><Link to="/leaderboard" className={link}>Leaderboard</Link></li>
              <li><Link to="/tips" className={link}>Interview Tips</Link></li>
              <li><Link to="/resources" className={link}>Resources</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-2.5">
              <li><Link to="/help" className={link}>Help Center</Link></li>
              <li><Link to="/about" className={link}>About Us</Link></li>
              <li><Link to="/privacy-policy" className={link}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={link}>Terms of Service</Link></li>
              <li><Link to="/refund-policy" className={link}>Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {year} InterviewForge. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { to: '/privacy-policy', label: 'Privacy' },
              { to: '/terms', label: 'Terms' },
              { to: '/refund-policy', label: 'Cancellation & Refund' },
              { to: '/shipping-policy', label: 'Shipping' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
