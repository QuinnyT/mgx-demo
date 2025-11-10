import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-white/80 backdrop-blur">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Logo and Tagline */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded"></div>
              <span className="text-base font-semibold">MGX</span>
            </div>
            <p className="text-sm text-slate-600">
              {t('footer.tagline')}
            </p>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-slate-900">
              {t('footer.about.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.about.blog')}
                </Link>
              </li>
              <li>
                <Link to="/metagpt" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  MetaGPT
                </Link>
              </li>
              <li>
                <Link to="/openmanus" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  OpenManus
                </Link>
              </li>
              <li>
                <Link to="/foundation-agents" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Foundation Agents
                </Link>
              </li>
            </ul>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-slate-900">
              {t('footer.products.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.products.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.products.changelog')}
                </Link>
              </li>
              <li>
                <Link to="/examples" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.products.examples')}
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.products.videos')}
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.products.guide')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-slate-900">
              {t('footer.support.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.support.helpCenter')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.support.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.support.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-slate-900">
              {t('footer.community.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/affiliates" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.community.affiliates')}
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  {t('footer.community.partners')}
                </Link>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  X / Twitter
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}