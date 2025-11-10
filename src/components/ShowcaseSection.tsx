import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Globe, ShoppingBag, Palette, Gamepad2, Bookmark, ThumbsUp } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  category: string;
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: '1',
    title: 'vente de maillot de foot',
    description: '我们的看法: Olympique de Marseille e-shop: secure the ⚽ collection—current & retro jerseys...',
    tags: ['E-commerce', 'Website'],
    image: '/images/FootballJersey.jpg',
    category: 'E-commerce'
  },
  {
    id: '2',
    title: '网页创建：汽车展厅首页',
    description: '我们的看法: Experience Automotive Excellence: browse and buy the world\'s finest 2025 luxury &...',
    tags: ['E-commerce', 'Website'],
    image: '/images/Automotive.jpg',
    category: 'E-commerce'
  },
  {
    id: '3',
    title: 'Vida Humana Coquette',
    description: '我们的看法: La Vida Humana a Través del Prisma Coquette: an online gallery viewing human life...',
    tags: ['Deep Research'],
    image: '/placeholder-3.jpg',
    category: 'Research'
  },
  {
    id: '4',
    title: 'Zombie Strike - React Compo.',
    description: '我们的看法: Zombie Strike: survive the relentless undead—hyper-real 3D shooter with advanced AI...',
    tags: ['Website'],
    image: '/placeholder-4.jpg',
    category: 'Game'
  },
  {
    id: '5',
    title: 'Top up diamond ML by almasda',
    description: '我们的看法: Top up ML Diamonds cheap, fast, and secure—shop 24/7 with instant delivery and...',
    tags: ['Website', 'Game'],
    image: '/images/photo1762739108.jpg',
    category: 'Game'
  },
  {
    id: '6',
    title: 'NeoSciFi Mood Atlas',
    description: '我们的看法: NeoSciFi Mood Atlas: surf the future—shop textures, materials & visual languages...',
    tags: ['Website'],
    image: '/images/photo1762739107.jpg',
    category: 'Design'
  },
  {
    id: '7',
    title: 'Warm Evening Store Showcase',
    description: '我们的看法: Warm Evening Store: shop hand-picked homewares that turn every night into a so...',
    tags: ['Website'],
    image: '/images/photo1762739104.jpg',
    category: 'E-commerce'
  },
  {
    id: '8',
    title: 'Liquid Forms Gallery',
    description: '我们的看法: Liquid Forms Gallery: explore and biomorphic furniture, sculpture and...',
    tags: ['Website'],
    image: '/images/LiquidForms.jpg',
    category: 'Design'
  }
];

export default function ShowcaseSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'discover' | 'featured' | 'liked'>('featured');

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Background Container with Border Radius */}
        <div className="bg-slate-50 rounded-3xl p-8">
          {/* Header with Title and Tabs in Same Row */}
          <div className="flex items-center justify-between mb-8">
            {/* Left - Title */}
            <h2 className="text-lg font-normal text-slate-700">
              {t('showcase.title')}
            </h2>
            
            {/* Center - Tab Navigation with Background */}
            <div className="flex-1 flex justify-center">
              <div className="inline-flex items-center gap-1 bg-white rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'discover'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  {t('showcase.tabs.discover')}
                </button>
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'featured'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  {t('showcase.tabs.featured')}
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'liked'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {t('showcase.tabs.liked')}
                </button>
              </div>
            </div>

            {/* Right - View All Button */}
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900 text-sm">
              {t('showcase.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Subtitle */}
          <p className="text-center text-sm text-slate-500 mb-8">
            {t('showcase.subtitle')}
          </p>

          {/* Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    {item.category === 'E-commerce' && <ShoppingBag className="h-16 w-16" />}
                    {item.category === 'Game' && <Gamepad2 className="h-16 w-16" />}
                    {item.category === 'Design' && <Palette className="h-16 w-16" />}
                    {item.category === 'Research' && <Globe className="h-16 w-16" />}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        {tag === 'E-commerce' && <ShoppingBag className="h-3 w-3 mr-1" />}
                        {tag === 'Website' && <Globe className="h-3 w-3 mr-1" />}
                        {tag === 'Game' && <Gamepad2 className="h-3 w-3 mr-1" />}
                        {tag === 'Deep Research' && <Palette className="h-3 w-3 mr-1" />}
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}