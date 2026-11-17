import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

// Be Vietnam Pro covers full Vietnamese diacritics (Geist does not).
const font = Be_Vietnam_Pro({
  variable: "--font-ui",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Random Meal — hôm nay ăn gì?",
  description: "Quay ngẫu nhiên món ăn, lọc theo bữa, vùng và nguyên liệu.",
};

export const viewport = { themeColor: "#0b0b0e" };

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={font.variable}>{children}</body>
    </html>
  );
}
