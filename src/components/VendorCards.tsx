import { useNavigate } from 'react-router-dom';

export type ChatVendor = {
  vendor_id: string;
  package_id: string | null;
  business_name: string;
  category: string;
  package_name: string;
  package_price: number | null;
  inclusions: unknown;
  portfolio_image_urls: string[];
  avg_rating: number;
  review_count: number;
};

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/[\n,;•]+/).map((item) => item.trim()).filter(Boolean);
  return [];
}

type Props = {
  vendors: ChatVendor[];
  onNavigate?: () => void;
};

export default function VendorCards({ vendors, onNavigate }: Props) {
  const navigate = useNavigate();
  if (!vendors?.length) return null;

  const openVendor = (vendor: ChatVendor) => {
    onNavigate?.();
    const packageQuery = vendor.package_id
      ? `?package=${encodeURIComponent(vendor.package_id)}`
      : '';
    navigate(`/vendors/${slugify(vendor.business_name)}-${encodeURIComponent(vendor.vendor_id)}${packageQuery}`);
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      {vendors.map((vendor, index) => {
        const inclusions = toList(vendor.inclusions);
        const images = Array.isArray(vendor.portfolio_image_urls)
          ? vendor.portfolio_image_urls.slice(0, 3)
          : [];

        return (
          <article
            key={`${vendor.vendor_id}-${vendor.package_id || index}`}
            className="overflow-hidden rounded-xl border border-[#E9D3C6] bg-[#FFF6EE] text-[#4A1D3F]"
          >
            {images.length > 0 && (
              <div className="flex gap-0.5">
                {images.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${vendor.business_name} portfolio`}
                    loading="lazy"
                    className="h-20 min-w-0 flex-1 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}

            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold">{vendor.business_name}</h4>
                  <p className="text-xs opacity-70">
                    {vendor.category}
                    {vendor.review_count > 0
                      ? `, ★ ${Number(vendor.avg_rating || 0).toFixed(1)} (${vendor.review_count})`
                      : ''}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#C94F6D]">
                  {vendor.package_price != null
                    ? inr.format(Number(vendor.package_price))
                    : 'Custom Quote'}
                </p>
              </div>

              {vendor.package_name && <p className="mt-2 text-xs font-medium">{vendor.package_name}</p>}

              {inclusions.length > 0 && (
                <ul className="mt-1.5 flex flex-wrap gap-1">
                  {inclusions.slice(0, 4).map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-full bg-[#F6E3D8] px-2 py-0.5 text-[11px]">
                      {item}
                    </li>
                  ))}
                  {inclusions.length > 4 && (
                    <li className="px-1 py-0.5 text-[11px] opacity-70">+{inclusions.length - 4} more</li>
                  )}
                </ul>
              )}

              <button
                type="button"
                onClick={() => openVendor(vendor)}
                className="mt-3 w-full rounded-lg bg-[#C94F6D] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#B3425F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1D3F]"
              >
                Book / Lock Escrow
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
