import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useAuthStore from '@/store/authStore';

const PRESET_AMOUNTS = [50, 100, 500, 1000, 2000];

const RechargeModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleRecharge = async () => {
    if (!amount || isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseInt(amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Flux",
        description: "Add Money to Wallet",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: parseInt(amount),
              }),
            });

            if (verifyResponse.ok) {
              toast.success('Payment successful! Wallet updated.');
              onSuccess();
              onClose();
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#ffd72c",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-white overflow-hidden">
        {/* Header with Yellow Background */}
        <div className="bg-customYellow p-6 text-center relative">
          <DialogTitle className="text-2xl font-bold mb-2">Add Money to Wallet</DialogTitle>
        
        </div>

        {/* Content */}
        <div className="p-6">

          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PRESET_AMOUNTS.map((value) => (
              <Button
                key={value}
                variant={amount === value.toString() ? "default" : "outline"}
                onClick={() => handleAmountSelect(value)}
                className={`w-full h-12 text-lg font-semibold ${
                  amount === value.toString() 
                    ? 'bg-customYellow hover:bg-customYellow/90 text-black'
                    : 'hover:bg-customYellow/10'
                }`}
              >
                ₹{value}
              </Button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="amount" className="text-sm font-medium">
              Enter Custom Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="h-12 text-lg "
            />
          </div>

          {/* Pay Button */}
          <Button
            onClick={handleRecharge}
            disabled={loading || !amount}
            className="w-full h-12 text-lg font-bold bg-black text-white"
          >
            {loading ? "Processing..." : `Pay ₹${amount || '0'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeModal; 