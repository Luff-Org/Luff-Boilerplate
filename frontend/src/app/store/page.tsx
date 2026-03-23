'use client';

import { useState } from 'react';
import Script from 'next/script';
import { createPaymentOrder, verifyPayment } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const products = [
  {
    id: 'prod_1',
    name: 'Premium Subscription',
    description: 'Get access to all premium features and exclusive content.',
    price: 999,
    image:
      'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop',
  },
  {
    id: 'prod_2',
    name: 'Advanced Tools Pack',
    description: 'A collection of professional tools for developers.',
    price: 499,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'prod_3',
    name: 'Consultation Session',
    description: '1-hour dedicated consultation with our experts.',
    price: 2999,
    image:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop',
  },
];

export default function StorePage() {
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleBuy = async (product: (typeof products)[0]) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setLoading(product.id);
    try {
      const order = await createPaymentOrder(product.price);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Luff Boilerplate',
        description: product.name,
        image: 'https://luff.io/logo.png', // Replace with actual logo
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              toast.success('Payment Successful!');
              router.push('/purchases');
            } else {
              toast.error('Payment Verification Failed!');
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Something went wrong during verification');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#4F46E5', // Indigo-600
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 py-16 px-6 ${isDark ? 'bg-[#0F1115] text-gray-200' : 'bg-[#FDFBF7] text-stone-900'}`}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Premium Marketplace<span className="text-indigo-600">.</span>
          </h1>
          <p className={`text-sm font-bold max-w-xl mx-auto opacity-70 ${isDark ? 'text-gray-400' : 'text-stone-600'}`}>
            Upgrade your experience with our premium selection of tools and services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className={`group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border flex flex-col ${isDark ? 'bg-[#17191E] border-gray-800' : 'bg-white border-stone-100'}`}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className={`absolute top-4 right-4 backdrop-blur-3xl px-4 py-1.5 rounded-full text-xs font-black shadow-lg ${isDark ? 'bg-black/60 text-indigo-400 border border-white/5' : 'bg-white/90 text-indigo-600 border border-stone-50'}`}>
                  ₹{product.price}
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                <p className={`text-sm font-bold mb-6 flex-grow leading-relaxed ${isDark ? 'text-gray-400' : 'text-stone-500'}`}>
                  {product.description}
                </p>

                <button
                  onClick={() => handleBuy(product)}
                  disabled={loading === product.id}
                  className={`w-full py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 shadow-lg ${
                    loading === product.id
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {loading === product.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border shadow-sm text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'bg-black/20 border-gray-800 text-gray-600' : 'bg-white border-stone-100 text-stone-400'}`}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            Secure payments via Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}
