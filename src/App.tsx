/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import VendooraLandingPage from './pages/VendooraLandingPage';
import VendorCommandCenterPage from './pages/VendorCommandCenterPage';
import AuthModal from './components/auth/AuthModal';
import { ApiInventoryItem, ApiProduct, ApiReel, AuthUser } from './types';

import { apiRequest } from './lib/api';

export default function App() {
  const [vendorMode, setVendorMode] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'CLIENT' | 'VENDOR'>('CLIENT');

  // Shared catalog state loaded from the API and used by both modes.
  // Vendor bookings and notifications are owned by their pages (they fetch the
  // authenticated endpoints directly), so they are not mirrored here.
  const [reels, setReels] = useState<ApiReel[]>([]);
  const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);

  const [dataError, setDataError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setInventory([]);
    setDataLoading(true);
    setDataError(null);
    const load = async () => {
      try {
        const [reelData, productData] = await Promise.all([
          apiRequest('/api/reels'), apiRequest('/api/marketplace/products?limit=100'),
        ]);
        if (!active) return;
        setReels(reelData.reels || []);
        setProducts(productData.products || []);
        const session = currentUser?.role === 'VENDOR' ? await apiRequest('/api/auth/me') : null;
        const vendorId = session?.user?.vendor?.id;
        if (vendorId) {
          const data = await apiRequest(`/api/vendors/${vendorId}`);
          if (active) setInventory(data.vendor.inventory || []);
        }
      } catch (error) {
        if (active) setDataError(error instanceof Error ? error.message : 'Unable to load marketplace');
      } finally {
        if (active) setDataLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [currentUser?.id, vendorMode, refreshKey]);

  useEffect(() => {
    const expire = () => { setCurrentUser(null); setVendorMode(false); setAuthModalOpen(true); };
    window.addEventListener('vendoora:session-expired', expire);
    return () => window.removeEventListener('vendoora:session-expired', expire);
  }, []);

  // Restore authenticated session on startup
  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      const token = localStorage.getItem('vendoora_token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const payload = await response.json().catch(() => ({}));
          if (!cancelled && payload?.user) {
            setCurrentUser(payload.user);
            // Steer to correct role view
            if (payload.user.role === 'VENDOR') {
              setVendorMode(true);
            } else {
              setVendorMode(false);
            }
          }
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('vendoora_token');
          if (!cancelled) setCurrentUser(null);
        }
      } catch (error) {
        console.warn('Failed to restore session on startup:', error);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };
    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync dark class on document element if needed, though pages maintain explicit base styling
  useEffect(() => {
    if (vendorMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Scroll window to top when switching modes
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [vendorMode]);

  const handleAuthSuccess = (token: string, user: AuthUser) => {
    localStorage.setItem('vendoora_token', token);
    setCurrentUser(user);
    setAuthModalOpen(false);
    if (user.role === 'VENDOR') {
      setVendorMode(true);
    } else {
      setVendorMode(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendoora_token');
    setCurrentUser(null);
    setVendorMode(false);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role: 'CLIENT' | 'VENDOR' = 'CLIENT') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleSwitchToVendor = () => {
    if (!currentUser) { handleOpenAuth('login', 'VENDOR'); return; }
    if (currentUser && currentUser.role !== 'VENDOR') {
      if (window.confirm('The Vendor Command Center is for registered service vendors. Would you like to create or sign in to a Vendor account?')) {
        handleOpenAuth('register', 'VENDOR');
      }
      return;
    }
    setVendorMode(true);
  };

  const handleAddReel = async (newReel: any) => {
    const { reel } = await apiRequest('/api/reels', { method: 'POST', body: JSON.stringify(newReel) });
    setReels((prev) => [reel, ...prev]);
  };

  const handleDeleteReel = async (reelId: string) => {
    try {
      await apiRequest(`/api/reels/${reelId}`, { method: 'DELETE' });
      setReels((prev) => prev.filter((r) => r.id !== reelId));
    } catch (error) { setDataError(error instanceof Error ? error.message : 'Unable to delete reel'); }
  };

  const handleAddInventoryItem = async (newItem: any) => {
    const { item } = await apiRequest('/api/inventory', { method: 'POST', body: JSON.stringify(newItem) });
    setInventory((prev) => [...prev, item]);
  };

  const handleUpdateInventoryItemRates = async (itemId: string, hourly: number, daily: number) => {
    try {
      const { item } = await apiRequest(`/api/inventory/${itemId}/rates`, {
        method: 'PUT', body: JSON.stringify({ hourlyRate: hourly, dailyRate: daily }),
      });
      setInventory((prev) => prev.map((entry) => entry.id === itemId ? item : entry));
    } catch (error) { setDataError(error instanceof Error ? error.message : 'Unable to save rates'); }
  };

  const handleAddProduct = async (newProduct: any) => {
    const { product } = await apiRequest('/api/marketplace/products', {
      method: 'POST', body: JSON.stringify({ ...newProduct, condition: newProduct.condition.toUpperCase() }),
    });
    setProducts((prev) => [product, ...prev]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Restoring Vendoora Session…</p>
      </div>
    );
  }

  return (
    <div id="vendoora-app-root">
      {dataLoading && <p role="status" className="p-3 text-center">Loading marketplace…</p>}
      {dataError && <div role="alert" className="p-3 text-center text-red-500">{dataError} <button onClick={() => setRefreshKey((key) => key + 1)}>Retry</button></div>}
      {!vendorMode ? (
        <VendooraLandingPage
          id="consumer-landing"
          onSwitchToVendor={handleSwitchToVendor}
          reels={reels}
          products={products}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />
      ) : (
        <VendorCommandCenterPage
          id="vendor-dashboard"
          onBackToUserMode={() => setVendorMode(false)}
          reels={reels.filter((reel) => reel.vendorId === (currentUser?.vendor?.id || currentUser?.vendorId))}
          onAddReel={handleAddReel}
          onDeleteReel={handleDeleteReel}
          inventory={inventory}
          onAddInventoryItem={handleAddInventoryItem}
          onUpdateInventoryItemRates={handleUpdateInventoryItemRates}
          products={products.filter((product) => product.sellerId === currentUser?.id)}
          onAddProduct={handleAddProduct}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
