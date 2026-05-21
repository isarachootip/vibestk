import "./globals.css";

export const metadata = {
  title: "STK - Sales Tracking System",
  description: "ระบบบันทึกยอดขายและการติดตามลูกค้าไทวัสดุ (Thai Watsadu Sales Tracking System)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* FontAwesome Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Chart.js library */}
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      </head>
      <body className="theme-dark">
        {children}
      </body>
    </html>
  );
}
