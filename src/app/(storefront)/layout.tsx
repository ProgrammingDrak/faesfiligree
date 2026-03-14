import { Navbar, Footer, CustomCursor } from "@/components/layout";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className="pt-16 sm:pt-20">{children}</main>
      <Footer />
    </>
  );
}
