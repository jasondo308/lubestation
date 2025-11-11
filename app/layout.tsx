import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LubeStation - Đặt Hàng Trước | powered by TheGioiRubik",
  description: "Đặt hàng trước dầu bôi trơn cube cao cấp từ TheCubicle và SpeedCubeShop. LubeStation - powered by TheGioiRubik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
