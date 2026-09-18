import React from 'react';
import { Instagram, Music2, Youtube, Twitter, ArrowUpRight } from 'lucide-react';
import type { NavTab } from '../types';

interface EditorialFooterProps {
  onSelectTab: (tab: NavTab) => void;
}

interface SocialLink {
  id: string;
  name: string;
  handle: string;
  url: string;
  icon: React.ReactNode;
  subtitle: string;
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({ onSelectTab }) => {
  const socialLinks: SocialLink[] = [
    {
      id: 'social-tiktok',
      name: 'TikTok',
      handle: '@edition.atelier',
      url: 'https://www.tiktok.com/@editionatelier',
      icon: <Music2 className="w-4 h-4 stroke-[1.75]" />,
      subtitle: 'Runway cuts & textile motion',
    },
    {
      id: 'social-instagram',
      name: 'Instagram',
      handle: '@edition.archive',
      url: 'https://www.instagram.com/editionatelier',
      icon: <Instagram className="w-4 h-4 stroke-[1.75]" />,
      subtitle: 'Daily visual silhouettes',
    },
    {
      id: 'social-youtube',
      name: 'YouTube',
      handle: '@edition.atelier',
      url: 'https://www.youtube.com/@editionatelier',
      icon: <Youtube className="w-4 h-4 stroke-[1.75]" />,
      subtitle: 'Craft docs & atelier films',
    },
    {
      id: 'social-twitter',
      name: 'X / Twitter',
      handle: '@edition_studio',
      url: 'https://x.com/editionatelier',
      icon: <Twitter className="w-4 h-4 stroke-[1.75]" />,
      subtitle: 'Dispatches & material logs',
    },
  ];

  return (
    <footer id="editorial-footer" className="w-full py-14 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 bg-[#FAF9F6] border-t border-[#E5E3DC]">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Top Section: Brand Info & Primary Navigation */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-[#E5E3DC]">
          <div id="footer-brand-info" className="flex flex-col space-y-2 max-w-md">
            <div className="flex items-center space-x-2.5 text-[#73726B]">
              <span className="w-2 h-2 rounded-full bg-[#141413] flex-shrink-0" />
              <span
                id="footer-brand-name"
                className="text-xs uppercase tracking-[0.28em] font-semibold text-[#141413]"
              >
                É D I T I O N // N°01
              </span>
            </div>
            <p id="footer-brand-tagline" className="text-xs text-[#5C5B54] font-normal leading-[1.65]">
              Curated physical objects for enduring spatial tranquility, architectural tailoring, and conscious living.
            </p>
          </div>

          <nav id="footer-navigation" className="flex flex-wrap gap-4 sm:gap-8 text-xs uppercase tracking-[0.2em] font-medium text-[#73726B]">
            <button
              id="footer-nav-home"
              type="button"
              onClick={() => onSelectTab('home')}
              className="min-h-[44px] inline-flex items-center px-1 hover:text-[#141413] transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
            >
              Home
            </button>
            <button
              id="footer-nav-catalog"
              type="button"
              onClick={() => onSelectTab('catalog')}
              className="min-h-[44px] inline-flex items-center px-1 hover:text-[#141413] transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
            >
              Catalog
            </button>
            <button
              id="footer-nav-account"
              type="button"
              onClick={() => onSelectTab('account')}
              className="min-h-[44px] inline-flex items-center px-1 hover:text-[#141413] transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
            >
              Account
            </button>
          </nav>
        </div>

        {/* Middle Section: Social Media Channels (TikTok, Instagram, YouTube, X/Twitter) */}
        <div id="footer-social-media-channels" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="flex items-center space-x-2 text-[#73726B]">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-[#141413]">
                Social Media & Digital Salons
              </span>
            </div>
            <span className="text-[11px] text-[#73726B] font-light">
              Follow our daily silhouettes, atelier footage, and runway archives
            </span>
          </div>

          <div
            id="social-links-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2"
          >
            {socialLinks.map((social) => (
              <a
                key={social.id}
                id={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#141413] hover:bg-[#F0EEE6] transition-all duration-200 flex flex-col justify-between min-h-[96px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                aria-label={`Follow us on ${social.name} (${social.handle})`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center space-x-2 text-[#141413]">
                    <div className="p-1.5 bg-[#FAF9F6] border border-[#E5E3DC] group-hover:border-[#141413] group-hover:bg-[#141413] group-hover:text-[#FAF9F6] transition-colors duration-200">
                      {social.icon}
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#141413]">
                      {social.name}
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#73726B] group-hover:text-[#141413] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </div>
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="font-mono text-[#141413] font-medium">
                    {social.handle}
                  </span>
                  <span className="text-[10px] text-[#73726B] font-light hidden sm:inline">
                    {social.subtitle}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section: Atelier Copyright & Heritage Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E5E3DC] text-[11px] text-[#8C8A82]">
          <div id="footer-copyright" className="tracking-wider font-light">
            © 2026 Atelier Foundation. All rights reserved. Single-origin provenance verified.
          </div>
          <div className="flex items-center space-x-6 uppercase tracking-[0.18em] text-[10px] text-[#73726B]">
            <span>Tokyo</span>
            <span>•</span>
            <span>Paris</span>
            <span>•</span>
            <span>New York</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
