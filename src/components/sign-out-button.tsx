"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        })
      }
    >
      Sign Out
    </Button>
  );
}
