import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { structuredData } from "./home/metadata";

export { metadata } from "./home/metadata";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
