import "./globals.css";

export const metadata = {
  title: "AMV Light Price List",
  description: "PDF replica viewer"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
