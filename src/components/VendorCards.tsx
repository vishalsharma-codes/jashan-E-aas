import { useNavigate } from 'react-router-dom';

export type ChatVendorPackage = {
  id: string;
  name: string;
  price: number | null;
  inclusions: unknown;
};

export type ChatVendorCard = {
  id: string;
  name: string;
  category: string;
  images: string[];
  packages: ChatVendorPackage[];
};

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Props = {
  cards?: ChatVendorCard[];
  onNavigate?: () => void;
};

export default function VendorCards({ cards, onNavigate }: Props) {
  const navigate = useNavigate();
  if (!cards?.length) return null;

  const openVendor = (card: ChatVendorCard, pkg?: ChatVendorPackage) => {
    onNavigate?.();
    const packageQuery = pkg?.id ? `?package=${encodeURIComponent(pkg.id)}` : '';
    navigate(`/vendors/${slugify(card.name)}-${encodeURIComponent(card.id)}${packageQuery}`);
  };

  return (
    <div className="mt-3 flex gap-3 overflow-x-auto snap-x pb-2 -mx-1 px-1">
      {cards.map((card) => {
        const packages = Array.isArray(card.packages) ? card.packages : [];
        const cheapest = [...packages]
          .filter((pkg) => pkg.price != null && Number.isFinite(Number(pkg.price)))
          .sort((a, b) => Number(a.price) - Number(b.price))[0];
        const bookablePackage = cheapest ?? packages[0];
        const images = Array.isArray(card.images) ? card.images.slice(0, 3) : [];

        return (
          <article
            key={card.id}
            className="snap-start shrink-0 w-[260px] rounded-2xl border border-pink-200 bg-[#FFF7F2] p-3 text-[#4A1D3F]"
          >
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-1 mb-2">
                {images.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-16 w-full rounded-lg object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}
            <p className="font-bold text-sm">{card.name}</p>
            <p className="text-xs text-neutral-500">{card.category}</p>
            <p className="mt-1 text-sm font-bold text-[#C84B6B]">
              {cheapest ? `From ₹${Number(cheapest.price).toLocaleString('en-IN')}` : 'Custom quote'}
            </p>
            <button
              type="button"
              onClick={() => openVendor(card, bookablePackage)}
              className="mt-3 w-full rounded-full bg-[#C84B6B] py-2 text-sm font-bold text-white"
            >
              {bookablePackage ? 'Book / Lock Escrow' : 'Request quote'}
            </button>
          </article>
        );
      })}
    </div>
  );
}
