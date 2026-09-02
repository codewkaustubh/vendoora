/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { Input, Button, Badge } from '../design-system';
import ProductCard from './ProductCard';
import SectionShell from '../common/SectionShell';

interface MarketplaceDiscoveryProps {
  onSelectVendor?: (vendor: any) => void;
  onSelectService?: (service: any) => void;
}

interface DiscoveryFilters {
  search: string;
  type: 'all' | 'products' | 'services' | 'vendors';
  minPrice: number;
  maxPrice: number;
  city: string;
  sortBy: string;
  category: string;
  minRating: number;
  page: number;
  limit: number;
}

export default function MarketplaceDiscovery({ onSelectVendor, onSelectService }: MarketplaceDiscoveryProps) {
  const [filters, setFilters] = useState<DiscoveryFilters>({
    search: '',
    type: 'products',
    minPrice: 0,
    maxPrice: 500000,
    city: '',
    sortBy: 'newest',
    category: '',
    minRating: 0,
    page: 1,
    limit: 12,
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = async (filtersToUse: DiscoveryFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('q', filtersToUse.search);
      params.append('type', filtersToUse.type);
      if (filtersToUse.minPrice > 0) params.append('minPrice', String(filtersToUse.minPrice));
      if (filtersToUse.maxPrice < 500000) params.append('maxPrice', String(filtersToUse.maxPrice));
      if (filtersToUse.city) params.append('city', filtersToUse.city);
      params.append('sortBy', filtersToUse.sortBy);
      if (filtersToUse.category) params.append('category', filtersToUse.category);
      if (filtersToUse.minRating > 0) params.append('minRating', String(filtersToUse.minRating));
      params.append('page', String(filtersToUse.page));
      params.append('limit', String(filtersToUse.limit));

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleFilterChange = (key: keyof DiscoveryFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    performSearch(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    performSearch({ ...filters, page: 1 });
  };

  const getActiveItems = () => {
    if (filters.type === 'all') {
      return [...(results?.vendors?.items || []), ...(results?.services?.items || []), ...(results?.products?.items || [])];
    }
    if (filters.type === 'products') return results?.products?.items || [];
    if (filters.type === 'services') return results?.services?.items || [];
    if (filters.type === 'vendors') return results?.vendors?.items || [];
    return [];
  };

  const items = getActiveItems();
  const totalCount = filters.type === 'all' 
    ? (results?.vendors?.total || 0) + (results?.services?.total || 0) + (results?.products?.total || 0)
    : results?.[filters.type]?.total || 0;

  return (
    <SectionShell id="marketplace-discovery" title="Discover Services & Equipment">
      <div className="space-y-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search tents, services, equipment..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-full"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm"
                >
                  <option value="all">All</option>
                  <option value="vendors">Vendors</option>
                  <option value="services">Services</option>
                  <option value="products">Products</option>
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">City</label>
                <Input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Min Price */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Min Price (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Max Price (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 500000)}
                  className="w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Tent & Decorators">Tent & Decorators</option>
                  <option value="Catering">Catering</option>
                  <option value="Sound & Lighting">Sound & Lighting</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm"
                >
                  <option value="0">All Ratings</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                setFilters({
                  search: '',
                  type: 'products',
                  minPrice: 0,
                  maxPrice: 500000,
                  city: '',
                  sortBy: 'newest',
                  category: '',
                  minRating: 0,
                  page: 1,
                  limit: 12,
                });
                performSearch();
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </motion.div>
        )}

        {/* Active Filters Display */}
        {(filters.search || filters.city || filters.category || filters.minRating > 0) && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="primary">
                Search: {filters.search}
              </Badge>
            )}
            {filters.city && (
              <Badge variant="primary">
                City: {filters.city}
              </Badge>
            )}
            {filters.category && (
              <Badge variant="primary">
                {filters.category}
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge variant="primary">
                Rating: {filters.minRating}+
              </Badge>
            )}
          </div>
        )}

        {/* Results Section */}
        <div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-red-950/20 border border-red-900/50 text-red-300"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-zinc-400 text-sm">Searching marketplace...</p>
              </div>
            </div>
          )}

          {!loading && items.length === 0 && !error && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-zinc-300 font-semibold mb-1">No results found</h3>
              <p className="text-zinc-500 text-sm">Try adjusting your filters or search term</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <>
              <p className="text-zinc-400 text-sm mb-4">
                Found {totalCount} result{totalCount !== 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item: any, idx: number) => (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {filters.type === 'products' || (filters.type === 'all' && item.price) ? (
                      <ProductCard product={item} />
                    ) : item.businessName ? (
                      <button type="button" onClick={() => onSelectVendor?.(item)} className="w-full text-left p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-indigo-500/60 transition-colors">
                        <h3 className="font-semibold text-white mb-2">{item.businessName}</h3>
                        <p className="text-zinc-400 text-sm mb-3">{item.ownerName}</p>
                        <span className="text-indigo-400 text-xs">Book this vendor</span>
                      </button>
                    ) : item.title ? (
                      <button type="button" onClick={() => onSelectService?.(item)} className="w-full text-left p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-indigo-500/60 transition-colors">
                        <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-zinc-400 text-sm mb-3">{item.vendor?.businessName || 'Service'}</p>
                        <span className="text-indigo-400 text-xs">Book this service</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
                        <h3 className="font-semibold text-white mb-2">
                          {item.businessName || item.title}
                        </h3>
                        <p className="text-zinc-400 text-sm mb-3">
                          {item.ownerName || item.vendor?.businessName}
                        </p>
                        {item.startingPrice && (
                          <p className="text-indigo-400 font-semibold">₹{item.startingPrice.toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {results?.[filters.type]?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-zinc-400 text-sm">
                    Page {filters.page} of {results?.[filters.type]?.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page >= (results?.[filters.type]?.totalPages || 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
