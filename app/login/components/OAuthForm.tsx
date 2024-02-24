import { Button } from "@/components/ui/button";
import React from "react";
import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();

const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });
};

export default function OAuthForm() {
  return <Button onClick={signInWithGoogle} className="w-full">Login With Google</Button>;
}
