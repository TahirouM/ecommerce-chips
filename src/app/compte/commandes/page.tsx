import type { Metadata } from "next";
import { MyOrders } from "@/components/orders/my-orders";

export const metadata: Metadata = { title: "Mes commandes" };

export default function Page() {
  return <MyOrders />;
}
