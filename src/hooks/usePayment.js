import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function usePayment() {
  const { user } = useAuth();

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Called after payment verified (or 100% promo) — creates Zoom meeting + saves purchase
  const finaliseBooking = useCallback(async ({
    planKey, planName, amount, billingPeriod,
    scheduledDate, scheduledSlot, weeklyDay, weeklySlot,
    isGhostDeal, isTopperOffer, promoCodeId, discountPct,
    razorpayOrderId, razorpayPaymentId,
  }) => {
    // 1. Create Zoom meeting
    let zoomData = null;
    try {
      const zoomRes = await fetch('/api/create-zoom-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          planName,
          userName: user?.user_metadata?.full_name || user?.email,
          scheduledDate,
          scheduledSlot,
          weeklyDay,
          weeklySlot,
        }),
      });
      if (zoomRes.ok) {
        zoomData = await zoomRes.json();
      } else {
        console.warn('Zoom meeting creation failed — booking saved without link');
      }
    } catch (e) {
      console.warn('Zoom API unreachable:', e.message);
    }

    // 2. Save purchase to Supabase (with Zoom data if available)
    const insertData = {
      user_id: user.id,
      plan_key: planKey,
      plan_name: planName,
      amount,
      billing_period: billingPeriod,
      status: 'paid',
      is_ghost_deal: isGhostDeal || false,
      is_topper_offer: isTopperOffer || false,
      promo_code_id: promoCodeId || null,
      discount_pct: discountPct || null,
    };

    if (razorpayOrderId)   insertData.razorpay_order_id   = razorpayOrderId;
    if (razorpayPaymentId) insertData.razorpay_payment_id = razorpayPaymentId;
    if (scheduledDate)     insertData.scheduled_date = scheduledDate;
    if (scheduledSlot)     insertData.scheduled_slot = scheduledSlot;
    if (weeklyDay !== undefined && weeklyDay !== null) insertData.weekly_day = weeklyDay;
    if (weeklySlot)        insertData.weekly_slot = weeklySlot;

    if (zoomData) {
      insertData.zoom_meeting_id = String(zoomData.meeting_id);
      insertData.zoom_join_url   = zoomData.join_url;
      insertData.zoom_password   = zoomData.password;
      insertData.zoom_start_time = zoomData.start_time;
    }

    const { data: purchase } = await supabase
      .from('purchases')
      .insert(insertData)
      .select()
      .single();

    // 3. Record promo use if applicable
    if (promoCodeId) {
      await supabase.from('promo_uses').insert({
        code_id: promoCodeId,
        user_id: user.id,
        purchase_id: purchase?.id,
      });
    }

    return {
      success: true,
      zoomJoinUrl: zoomData?.join_url || null,
      zoomPassword: zoomData?.password || null,
      zoomStartTime: zoomData?.start_time || null,
      purchaseId: purchase?.id,
    };
  }, [user]);

  const initiatePayment = useCallback(async ({
    planKey, planName, amount, billingPeriod = 'one_time',
    scheduledDate, scheduledSlot, weeklyDay, weeklySlot,
    isGhostDeal = false, isTopperOffer = false,
    promoCodeId = null, discountPct = null,
  }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load payment gateway. Please check your connection.');
      return { success: false };
    }

    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: { planKey, userId: user?.id || 'guest' },
      }),
    });

    if (!orderRes.ok) {
      alert('Could not create order. Please try again.');
      return { success: false };
    }

    const { order_id, amount: orderAmount, currency } = await orderRes.json();

    return new Promise((resolve) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency,
        name: 'ArpanMentors',
        description: planName,
        order_id,
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
        },
        theme: { color: '#7C3AED' },
        handler: async (response) => {
          // Verify payment signature
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok && user) {
            const result = await finaliseBooking({
              planKey, planName, amount, billingPeriod,
              scheduledDate, scheduledSlot, weeklyDay, weeklySlot,
              isGhostDeal, isTopperOffer, promoCodeId, discountPct,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
            resolve(result);
          } else {
            alert('Payment verification failed. Contact support: ' + response.razorpay_payment_id);
            resolve({ success: false });
          }
        },
        modal: { ondismiss: () => resolve({ success: null }) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res) => {
        alert('Payment failed: ' + res.error.description);
        resolve({ success: false });
      });
      rzp.open();
    });
  }, [user, loadRazorpayScript, finaliseBooking]);

  return { initiatePayment, finaliseBooking };
}
