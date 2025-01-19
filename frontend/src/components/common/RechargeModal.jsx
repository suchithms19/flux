import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function RechargeModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  // Check if Razorpay is loaded
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        return true;
      }
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const handleRecharge = async () => {
    try {
      setIsLoading(true);

      if (!window.Razorpay) {
        toast.error('Payment system is loading. Please try again in a moment.');
        return;
      }
      
      // Create order on backend
      const response = await axios.post(
        `${API_URL}/payments/create-order`,
        { amount: parseInt(amount) },
        { withCredentials: true }
      );

      // Initialize Razorpay
      const options = {
        key: response.data.keyId,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'Flux',
        description: 'Wallet Recharge',
        order_id: response.data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API_URL}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { withCredentials: true }
            );

            toast.success('Payment successful!');
            onSuccess(verifyResponse.data.balance);
            onClose();
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#ffe05d',
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Recharge error:', error);
      toast.error('Failed to initiate recharge');
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedAmounts = [100, 200, 500, 1000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Recharge Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Amount</label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedAmounts.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant={amount === amt.toString() ? "default" : "outline"}
                  onClick={() => setAmount(amt.toString())}
                  className={amount === amt.toString() ? "bg-customYellow text-black hover:bg-customYellow" : ""}
                >
                  ₹{amt}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Or Enter Custom Amount</label>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="border-gray-300"
            />
          </div>
          <Button
            onClick={handleRecharge}
            disabled={!amount || isLoading}
            className="w-full bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Recharge ₹${amount || '0'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 