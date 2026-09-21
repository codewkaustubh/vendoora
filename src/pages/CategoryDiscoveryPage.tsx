import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, MapPin, BadgeCheck } from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CategoryCard,
} from '../components/design-system';
import { CategoryIcon } from '../components/design-system/CategoryCard';
import type { ApiCategory, ApiService, Category } from '../types';

interface CategoryDiscoveryPageProps {
  id?: string;
  category: ApiCategory;
  location: string;
  onBack: () => void;
  onSelectService?: (service: ApiService) => void;
}

const FALLBACK_GRADIENTS = [
  'from-blue-500/10 to-indigo-500/10',
  'from-amber-500/10 to-orange-500/10',
  'from-pink-500/10 to-rose-500/10',
  'from-emerald-500/10 to-teal-500/10',
  'from-cyan-500/10 to-blue-500/10',
  'from-purple-500/10 to-violet-500/10',
  'from-yellow-500/10 to-amber-500/10',
  'from-indigo-500/10 to-sky-500/10',
  'from-violet-500/10 to-fuchsia-500/10',
  'from-orange-500/10 to-red-500/10',
  'from-slate-500/10 to-zinc-500/10',
  'from-teal-500/10 to-green-500/10',
];

function cityTerm(location: string): string {
  const city = String(location || '').split(',')[0]?.trim() ?? '';
  return city;
}

function formatPrice(value: unknown): string | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function subcategoryLabel(service: ApiService, parentName: string): string | null {
  const node = service.category;
  if (!node?.name) return null;
  if (node.parent?.name && node.parent.name === parentName) return node.name;
  return null;
}

export default function CategoryDiscoveryPage({
  id,
  category,
  location,
  onBack,
  onSelectService,
}: CategoryDiscoveryPageProps) {
  const [activeSubcategory, setActiveSubcategory] = useState<string>('');
  const [services, setServices] = useState<ApiService[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [error, setError] = useState<string | null>(null);

  const subcategories = Array.isArray(category.subcategories) ? category.subcategories : [];
  const city = cityTerm(location);
  const activeName = activeSubcategory
    ? subcategories.find((row) => row.slug === activeSubcategory)?.name ?? activeSubcategory
    : `All ${category.name}`;
  const emptyCopy = `No ${activeName} listings available${city ? ` in ${city}` : ''} yet.`;

  useEffect(() => {
    setActiveSubcategory('');
  }, [category.slug]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setState('loading');
      setError(null);
      try {
        const params = new URLSearchParams({ category: category.slug, limit: '100' });
        if (activeSubcategory) params.set('subcategory', activeSubcategory);
        if (city) params.set('city', city);
        const response = await fetch(`/api/services?${params.toString()}`, { signal: controller.signal });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || 'Unable to load listings');
        if (controller.signal.aborted) return;
        setServices(Array.isArray(payload?.services) ? payload.services : []);
        setState('ready');
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setServices([]);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load listings');
        setState('error');
      }
    };
    void load();
    return () => controller.abort();
  }, [category.slug, activeSubcategory, city]);

  const tiles: Category[] = subcategories.map((row, index) => ({
    id: row.slug,
    label: row.name,
    iconName: row.icon && row.icon.length > 0 ? row.icon : 'LayoutGrid',
    gradient: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
  }));

  return (
    <section
      id={id || 'category-discovery-page'}
      className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#1E40AF] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse Categories
      </button>
      <div className="mt-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-md border border-zinc-100 text-[#1E40AF] shrink-0">
            <CategoryIcon name={category.icon && category.icon.length > 0 ? category.icon : 'LayoutGrid'} className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-zinc-900">
              {category.name}
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              {category.description || `Verified ${category.name.toLowerCase()} specialists and listings`}
              {city ? ` near ${city}` : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Browse {category.name}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSubcategory('')}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
              activeSubcategory === ''
                ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-md'
                : 'bg-white/70 text-zinc-700 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            All {category.name}
          </button>
          {subcategories.map((row) => (
            <button
              key={row.slug}
              type="button"
              onClick={() => setActiveSubcategory(row.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                activeSubcategory === row.slug
                  ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-md'
                  : 'bg-white/70 text-zinc-700 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {row.name}
            </button>
          ))}
        </div>
      </div>
      {state === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading {activeName} listings...
        </div>
      )}
      {state === 'error' && (
        <div className="w-full text-center py-12 border border-dashed border-red-200 rounded-[32px] bg-red-50/40">
          <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error || 'Unable to load listings'}
          </p>
        </div>
      )}
      {state === 'ready' && services.length === 0 && (
        <div className="w-full text-center py-12 border border-dashed border-zinc-200 rounded-[32px] bg-white/30">
          <p className="text-zinc-500 text-sm font-medium">{emptyCopy}</p>
        </div>
      )}
      {state === 'ready' && services.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => {
            const price = formatPrice(service.startingPrice);
            const vendorName = service.vendor?.businessName || 'Vendor';
            const vendorCity = [service.vendor?.city, service.vendor?.state].filter(Boolean).join(', ');
            const leaf = subcategoryLabel(service, category.name);
            const isVerified = service.vendor?.verificationStatus === 'VERIFIED';
            return (
              <Card
                key={service.id}
                variant="glass"
                padding="none"
                className="relative overflow-hidden group hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  {service.coverImage ? (
                    <div className="w-full h-44 relative overflow-hidden bg-zinc-100">
                      <img
                        src={service.coverImage}
                        alt={service.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                  ) : null}
                  <div className="p-6 flex flex-col justify-between space-y-4 flex-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm">
                          {leaf ?? category.name}
                        </Badge>
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading font-bold text-base text-zinc-900 leading-tight">
                        {service.title}
                      </h4>
                      <p className="text-zinc-500 text-xs">
                        {vendorName}
                        {service.vendor?.rating ? ` · ${Number(service.vendor.rating).toFixed(1)} ★` : ''}
                      </p>
                      {service.description ? (
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                          {service.description}
                        </p>
                      ) : null}
                      {vendorCity ? (
                        <p className="text-zinc-400 text-xs leading-relaxed flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {vendorCity}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-zinc-400">
                          Starting Price
                        </span>
                        <span className="text-zinc-950 font-mono font-bold text-sm">
                          {price ?? 'On request'}
                        </span>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => onSelectService?.(service)}>
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {state === 'ready' && services.length === 0 && subcategories.length > 0 && (
        <div className="mt-6 max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Explore {category.name} specialties
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tiles.slice(0, 6).map((tile) => (
              <CategoryCard
                key={tile.id}
                category={tile}
                onClick={() => setActiveSubcategory(tile.id)}
              />
            ))}
          </div>
        </div>
      )}
      <p className="mt-8 text-center text-[11px] text-zinc-400">
        Listings update in real time as vendors publish services under this category.
      </p>
    </section>
  );
}
