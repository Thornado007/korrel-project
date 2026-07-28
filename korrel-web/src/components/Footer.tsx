export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted sm:px-8">
        © {new Date().getFullYear()} Korrel
      </div>
    </footer>
  );
}
