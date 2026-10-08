"use client";

import { LogoutButton } from "./logout-button";
import { RequireAuth } from "./require-auth";

export function AccountHome() {
  return (
    <RequireAuth>
      {(user) => (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Bonjour {user.firstName} 👋</h1>
            <p className="mt-2 text-muted">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      )}
    </RequireAuth>
  );
}
