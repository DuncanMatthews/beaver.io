'use server';


import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);



export async function signUp (prevState: any, formData: FormData)  {
  
    const origin = headers().get("origin");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
  
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
  
    if (error) {
        console.log(error)
        return redirect("/sign-up?message=Could not authenticate user");
    }

   
 
    return redirect("/sign-up?message=Check email to continue sign in process");
  };


export async function getUser() {
  const { data: userData, error } = await supabase.auth.getSession();
  if (error) {
    console.log(error);
  }

  const userDataString = JSON.stringify(userData);


  return userDataString;
}