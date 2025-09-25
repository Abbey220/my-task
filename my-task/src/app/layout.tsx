import './globals.css';

export const metadata = {
  title: 'Data Sharing Platform',
  description: 'Share data between users securely',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}