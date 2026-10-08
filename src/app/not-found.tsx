import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-7xl">🫥</p>
      <h1 className="mt-6 font-display text-4xl font-extrabold">Oups, sachet vide !</h1>
      <p className="mt-4 text-lg text-muted">Cette page (ou cette saveur) n&apos;existe pas, ou plus.</p>
      <Link href="/produits" className="mt-8 btn bg-primary">
        Retour à la boutique
      </Link>
    </div>
  );
}
