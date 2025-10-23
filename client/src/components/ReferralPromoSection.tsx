import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, X, CheckCircle } from 'lucide-react';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface ReferralPromoSectionProps {
  subtotal: number;
  onPromoApplied?: (promo: any) => void;
  onReferralApplied?: (referral: any) => void;
  onPromoRemoved?: () => void;
  onReferralRemoved?: () => void;
  appliedPromo?: any;
  appliedReferral?: any;
  className?: string;
}

export const ReferralPromoSection: React.FC<ReferralPromoSectionProps> = ({
  subtotal,
  onPromoApplied,
  onReferralApplied,
  onPromoRemoved,
  onReferralRemoved,
  appliedPromo,
  appliedReferral,
  className = ""
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [referralLoading, setReferralLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [referralError, setReferralError] = useState('');

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    setPromoError('');
    
    try {
      const response = await apiService.applyPromoCode(promoCode, subtotal);
      
      if (response.success) {
        const payload: any = response.data as any;
        onPromoApplied?.(payload);
        setPromoCode('');
        toast.success(`Promo code applied! You saved ₹${payload.discountAmount}`);
      } else {
        setPromoError(response.error || 'Invalid promo code');
        toast.error(response.error || 'Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to apply promo code');
      toast.error('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) return;
    
    setReferralLoading(true);
    setReferralError('');
    
    try {
      const response = await apiService.redeemReferralPromo(referralCode);
      if (response.success) {
        const payload: any = response.data as any;
        onReferralApplied?.({
          code: referralCode,
          discountAmount: payload.discountAmount,
          description: 'Referral 5% off',
        });
        setReferralCode('');
        toast.success(`Referral code applied — you saved ₹${payload.discountAmount}`);
      } else {
        setReferralError(response.error || 'Invalid referral code');
        toast.error(response.error || 'Invalid referral code');
      }
    } catch (error: any) {
      console.error('Failed to apply referral code', error);
      setReferralError('Failed to apply referral code');
      toast.error(error?.response?.data?.message || 'Failed to apply referral code');
    } finally {
      setReferralLoading(false);
    }
  };

  // Saved referral apply flow removed to keep cart input as the single entry path

  const removePromoCode = () => {
    onPromoRemoved?.();
    setPromoError('');
    toast.info('Promo code removed');
  };

  const removeReferralCode = () => {
    onReferralRemoved?.();
    setReferralError('');
    toast.info('Referral code removed');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Promo & Referral Codes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Promo Code Section */}
        <div className="space-y-2">
          <Label htmlFor="promoCode">Promo Code</Label>
          <div className="flex gap-2">
            <Input
              id="promoCode"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              disabled={promoLoading || !!appliedPromo}
            />
            <Button
              onClick={handleApplyPromoCode}
              disabled={promoLoading || !promoCode.trim() || !!appliedPromo}
              size="sm"
            >
              {promoLoading ? "Applying..." : "Apply"}
            </Button>
          </div>
          {promoError && (
            <p className="text-sm text-red-500">{promoError}</p>
          )}
          {appliedPromo && (
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  {appliedPromo.description} - ₹{appliedPromo.discountAmount} off
                </span>
              </div>
              <Button
                onClick={removePromoCode}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Referral Code Section */}
        <div className="space-y-2">
          <Label htmlFor="referralCode">Referral Code</Label>
          <div className="flex gap-2">
            <Input
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
              disabled={referralLoading || !!appliedReferral}
            />
            <Button
              onClick={handleApplyReferralCode}
              disabled={referralLoading || !referralCode.trim() || !!appliedReferral}
              size="sm"
            >
              {referralLoading ? "Applying..." : "Apply"}
            </Button>
          </div>
          {/* Removed extra button per UX request; users should enter the referral code in the input above and click Apply */}
          {referralError && (
            <p className="text-sm text-red-500">{referralError}</p>
          )}
          {appliedReferral && (
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {appliedReferral.description} - ₹{appliedReferral.discountAmount} off
                </span>
              </div>
              <Button
                onClick={removeReferralCode}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500">
          💡 You can use both promo and referral codes together for maximum savings!
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralPromoSection;
