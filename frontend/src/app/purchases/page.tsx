'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import axios from 'axios';
import { ShoppingBag, Calendar, CheckCircle, CreditCard } from 'lucide-react';

interface Purchase {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function PurchasesPage() {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:4000/payments/my-purchases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.purchases as Purchase[];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen transition-all duration-500 flex flex-col ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
        <div className="flex-1 flex items-center justify-center">
          <p className={`text-lg font-bold ${isDark ? 'text-gray-500' : 'text-stone-400'}`}>Please sign in to view your purchases.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 flex flex-col ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction Ledger</h1>
            <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-stone-500'}`}>Absolute precision history of your orders.</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-colors ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            {data?.length || 0} Orders
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-24 rounded-2xl animate-pulse border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-stone-100'}`}
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/10 text-red-500 p-6 rounded-2xl font-black text-xs uppercase tracking-widest text-center">
            Failed to synchronize purchases.
          </div>
        ) : data?.length === 0 ? (
          <div className={`rounded-3xl border-2 border-dashed p-16 text-center transition-colors ${isDark ? 'bg-black/20 border-gray-800' : 'bg-stone-50 border-stone-100'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <ShoppingBag className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-stone-200'}`} />
            </div>
            <h3 className={`text-xl font-black ${isDark ? 'text-gray-700' : 'text-stone-300'}`}>No purchases found</h3>
            <p className={`text-sm font-bold mt-2 max-w-sm mx-auto opacity-50 ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
              Your universe is waiting for its first premium upgrade.
            </p>
          </div>
        ) : (
          <div className={`rounded-3xl border overflow-hidden shadow-sm transition-all duration-500 ${isDark ? 'bg-[#17191E] border-gray-800' : 'bg-white border-stone-100'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-black/30 border-b border-gray-800' : 'bg-stone-50 border-b border-stone-100'}`}>
                  <th className={`px-8 py-4 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                    Order Details
                  </th>
                  <th className={`px-8 py-4 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                    Date
                  </th>
                  <th className={`px-8 py-4 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                    Amount
                  </th>
                  <th className={`px-8 py-4 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm font-bold ${isDark ? 'divide-gray-800' : 'divide-stone-50'}`}>
                {data?.map((purchase) => (
                  <tr key={purchase.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {purchase.orderId}
                          </div>
                          <div className={`text-[10px] font-mono font-bold mt-0.5 ${isDark ? 'text-gray-600' : 'text-stone-400'}`}>
                            {purchase.paymentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs">
                      <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-stone-600'}`}>
                        <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-gray-600' : 'text-stone-300'}`} />
                        {new Date(purchase.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {(purchase.amount / 100).toLocaleString(undefined, {
                          style: 'currency',
                          currency: purchase.currency,
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                            purchase.status === 'SUCCESS'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/10'
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'
                          }`}
                        >
                          {purchase.status === 'SUCCESS' && (
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                          )}
                          {purchase.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
