// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Resend } from "npm:resend@4.0.0"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") as string
const resend = new Resend(RESEND_API_KEY)

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const { email, type } = await req.json()
  let subject: string
  let html: string

  if ("accepted" === type) {
    subject = "Yey, request buku anda diterima! 🚀"
    html =
      "<p>buku yang kamu request akan segera ditambahkan ke dalam koleksi Metschoo Library. Stay tuned ya!</p>"
  } else {
    subject = "Oh tidak, request buku anda ditolak. 😢"
    html =
      "<p>Sepertinya admin tidak suka buku yang kamu request. Jangan berkecil hati ya, kamu bisa request buku baru lagi di bulan depan!</p>"
  }

  const { data: resendResult, error: resendError } = await resend.emails.send({
    from: "Metschoo Library <contact@library.smkmetland.net>",
    to: email,
    subject,
    html,
  })

  if (resendError) {
    return new Response(
      JSON.stringify({
        message: "failed to send email",
        data: { error: resendError },
      })
    )
  }

  return new Response(
    JSON.stringify({
      message: "succesfully sent email!",
      data: resendResult,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify-admin-user-request' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
