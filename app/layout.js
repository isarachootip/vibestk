import "./globals.css";

export const metadata = {
  title: "CRM Track Sales — Central Department Store",
  description: "ระบบ CRM Track Sales สำหรับบริหารลูกค้าและติดตามยอดขาย Central Department Store (CDS)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <meta charSet="UTF-8" />
        {/* FontAwesome Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Chart.js library */}
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
