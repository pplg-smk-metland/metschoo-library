// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from "npm:@supabase/supabase-js"
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Resend } from "npm:resend@4.0.0"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") as string
const resend = new Resend(RESEND_API_KEY)

Deno.serve(async () => {
  let { data, error } = await supabase
    .from("peminjaman")
    .select(
      "*, buku(judul), pengguna(user_id, nama, kelas, email), peminjaman_detail(state_id, created_at)"
    )
    .order("created_at", { ascending: false, referencedTable: "peminjaman_detail" })

  if (error) {
    console.error(error)
    return new Response(
      JSON.stringify({
        message: "ada sebuah kesalahan",
      }),
      { status: 500 }
    )
  }

  if (!data || !data.length) {
    return new Response(JSON.stringify({ message: "tidak ada pengguna terlambat" }), {
      status: 404,
    })
  }

  data = data.filter((d) => d.peminjaman_detail[0].state_id === 2)

  const emails = data.map(({ pengguna }) => pengguna.email)

  if (!emails.length) {
    return new Response(
      JSON.stringify({
        message: "tidak ada pengguna terlambat (array email)",
      }),
      { status: 404 }
    )
  }

  const { data: emailResult, error: emailError } = await resend.emails.send({
    from: "Metschoo Library <contact@library.smkmetland.net>",
    to: emails,
    subject: "Peminjaman terlambat",
    html: `<h1>Peminjaman terlambat</h1>`,
  })

  if (emailError) {
    console.error(emailError)

    return new Response(
      JSON.stringify({
        message: "gagal mengirim email: " + emailError.message,
      }),
      { status: 500 }
    )
  }

  return new Response(
    JSON.stringify({
      message: "sukses mengirim email ke pengguna yang terlambat.",
      data: { emailResult },
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify-late-peminjaman' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
