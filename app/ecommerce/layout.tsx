import type { ReactNode } from "react";
import { EditorialFrame } from "@/components/ecommarce/fashion/EditorialFrame";
import CustomerNotificationPoller from "@/components/ecommarce/CustomerNotificationPoller";

export default function EcommerceLayout({ children }: { children: ReactNode }) {
  return <EditorialFrame>{children}<CustomerNotificationPoller /></EditorialFrame>;
}
