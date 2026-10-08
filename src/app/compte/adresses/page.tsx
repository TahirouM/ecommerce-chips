import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";

export const metadata: Metadata = { title: "Mes adresses" };

export default function Page() {
  return <AddressBook />;
}
