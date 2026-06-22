import Link from "next/link";
import { HelpWalkthrough } from "@/components/admin/HelpWalkthrough";

export const metadata = {
  title: "Admin Help",
};

export default function AdminHelpPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-copper">Admin Help</p>
          <h1 className="font-heading text-3xl text-warm-white">Inventory walkthrough</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-warm-white/60">
            Replay the archived product setup demo as in-app steps. The guide uses the June 10,
            2026 capture frames and captions, so it stays available without a separate video file.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-lg bg-copper px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-copper-dark"
        >
          Open New Product
        </Link>
      </div>

      <HelpWalkthrough />
    </div>
  );
}
