import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, shopName } = await req.json()
    
    const cashfreeAppId = Deno.env.get('CASHFREE_APP_ID')
    const cashfreeSecretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    
    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create Cashfree order
    const cashfreeResponse = await fetch('https://sandbox.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: 50,
        order_currency: 'INR',
        customer_details: {
          customer_id: email.replace('@', '_').replace('.', '_'),
          customer_email: email,
          customer_phone: '9999999999', // Default phone
        },
        order_meta: {
          return_url: `${req.headers.get('origin')}/payment-success?order_id={order_id}`,
          notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-payment`,
        },
      }),
    })

    const cashfreeData = await cashfreeResponse.json()
    
    if (!cashfreeResponse.ok) {
      console.error('Cashfree error:', cashfreeData)
      throw new Error(cashfreeData.message || 'Failed to create payment order')
    }

    return new Response(
      JSON.stringify({
        orderId: orderId,
        paymentSessionId: cashfreeData.payment_session_id,
        orderToken: cashfreeData.order_token,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
