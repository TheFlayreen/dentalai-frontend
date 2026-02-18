export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-2 py-2">
      {children}
    </main>
  );
}
