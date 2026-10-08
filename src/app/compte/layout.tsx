import { AccountShell } from "@/components/account/account-shell";

export default function AccountLayout({ children }: LayoutProps<"/compte">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <AccountShell>{children}</AccountShell>
    </div>
  );
}
