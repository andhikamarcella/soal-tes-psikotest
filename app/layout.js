import "./globals.css";

export const metadata = {
  title: "Latihan Psikotes Interaktif",
  description: "Latihan psikotes model form dengan nilai otomatis per materi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
