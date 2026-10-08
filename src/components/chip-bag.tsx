import type { Product } from "@/lib/products";

const BRAND = "CRAAK!";

// Sachet de chips dessiné en SVG : bords crantés, bandeaux sombres, pastille avec l'emoji.
function bagPath() {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let x = 30, i = 0; x <= 170; x += 10, i++) {
    top.push(`${x},${i % 2 ? 22 : 30}`);
    bottom.unshift(`${x},${i % 2 ? 222 : 214}`);
  }
  return `M${top.join(" L")} Q182,122 ${bottom[0]} L${bottom.join(" L")} Q18,122 30,30 Z`;
}

const PATH = bagPath();

export function ChipBag({
  product,
  className,
}: {
  product: Pick<Product, "slug" | "short" | "color" | "emoji">;
  className?: string;
}) {
  const clipId = `bag-${product.slug}`;
  const nameSize = product.short.length <= 8 ? 22 : product.short.length <= 11 ? 18 : 15;

  return (
    <svg viewBox="0 0 200 244" className={className} role="img" aria-label={`Sachet ${product.short}`}>
      <defs>
        <clipPath id={clipId}>
          <path d={PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="200" height="244" fill={product.color} />
        <rect width="200" height="56" fill="#000" opacity="0.18" />
        <rect y="196" width="200" height="48" fill="#000" opacity="0.18" />
        <ellipse cx="58" cy="120" rx="14" ry="70" fill="#fff" opacity="0.22" />
      </g>
      <path d={PATH} fill="none" stroke="#1A1A2E" strokeWidth="4" strokeLinejoin="round" />
      <text
        x="100"
        y="46"
        textAnchor="middle"
        fill="#fff"
        fontSize="20"
        fontWeight="800"
        style={{ fontFamily: "var(--font-display)", letterSpacing: 1 }}
      >
        {BRAND}
      </text>
      <circle cx="100" cy="116" r="42" fill="#fff" stroke="#1A1A2E" strokeWidth="4" />
      <text x="100" y="132" textAnchor="middle" fontSize="44">
        {product.emoji}
      </text>
      <text
        x="100"
        y="186"
        textAnchor="middle"
        fill="#fff"
        stroke="#1A1A2E"
        strokeWidth="4"
        paintOrder="stroke"
        fontSize={nameSize}
        fontWeight="800"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {product.short}
      </text>
    </svg>
  );
}

/** Fond coloré + sachet, utilisé partout où il y avait une photo produit. */
export function ProductVisual({
  product,
  className = "",
  bagClassName = "",
}: {
  product: Pick<Product, "slug" | "short" | "color" | "emoji">;
  className?: string;
  bagClassName?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: `${product.color}2e` }}
    >
      <ChipBag product={product} className={`h-[82%] w-auto drop-shadow-[4px_6px_0_rgba(26,26,46,0.18)] ${bagClassName}`} />
    </div>
  );
}
