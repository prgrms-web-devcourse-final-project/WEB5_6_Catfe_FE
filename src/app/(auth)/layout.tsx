export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-dvh flex items-center justify-center">
      <div className="w-full max-w-[1200px] mx-auto">{children}</div>
    </main>
  );
}
