import "./globals.css"
import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import Header from "./components/Header"
import { Toaster } from "@/components/ui/toaster"



export const metadata: Metadata = {
  title: "Beaver.io",
  description: "Repurpose your video content into engaging blog posts and articles.",
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}


export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      
      <body suppressHydrationWarning={true} className=''>
      <Header />
       {children}<Toaster />
      </body>
    </html>
  )
}
