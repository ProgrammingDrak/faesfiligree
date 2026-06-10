import { WalkthroughProductForm } from "./WalkthroughProductForm";

export const metadata = {
  title: "Inventory Walkthrough Capture",
};

export default function InventoryAdminWalkthroughPage() {
  return (
    <main className="min-h-screen bg-charcoal/95 p-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl text-warm-white">New Product</h1>
      </div>
      <WalkthroughProductForm />
    </main>
  );
}
