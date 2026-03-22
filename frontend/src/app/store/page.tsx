'use client';

import { useState } from 'react';
import Script from 'next/script';
import { createPaymentOrder, verifyPayment } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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
              alert('Payment Successful!');
            } else {
              alert('Payment Verification Failed!');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Something went wrong during verification');
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
      alert('Failed to initiate payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Premium Marketplace
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upgrade your experience with our premium selection of tools and services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-indigo-600">
                  ₹{product.price}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow">{product.description}</p>

                <button
                  onClick={() => handleBuy(product)}
                  disabled={loading === product.id}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all transform active:scale-95 ${
                    loading === product.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200'
                  }`}
                >
                  {loading === product.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Secure payments via Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}
