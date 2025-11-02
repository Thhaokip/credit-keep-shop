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
    const { orderId, userId } = await req.json()
    
    const cashfreeAppId = Deno.env.get('CASHFREE_APP_ID')
    const cashfreeSecretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    
    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    // Verify payment with Cashfree
    const cashfreeResponse = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
    })

    const paymentData = await cashfreeResponse.json()
    
    if (!cashfreeResponse.ok) {
      console.error('Cashfree verification error:', paymentData)
      throw new Error('Payment verification failed')
    }

    const isPaid = paymentData.order_status === 'PAID'
    
    // Update user profile if payment is successful
    if (isPaid && userId) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          has_paid: true,
          payment_date: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating profile:', error)
        throw new Error('Failed to update payment status')
      }
    }

    return new Response(
      JSON.stringify({
        success: isPaid,
        orderStatus: paymentData.order_status,
        amount: paymentData.order_amount,
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
