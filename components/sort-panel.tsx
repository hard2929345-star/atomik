import Link from "next/link";
import { buildQueryString, DIRECTIONS, type SortDirection } from "@/lib/sort";

export type SortOption = { value: string; label: string };

function Row({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-[#080808]"
    >
      <span className={`text-[15px] ${active ? "font-bold text-[#e7e9ea]" : "text-[#71767b]"}`}>
        {label}
      </span>
      <span
        className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
          active ? "border-[#1d9bf0]" : "border-[#536471]"
        }`}
      >
        {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#1d9bf0]" /> : null}
      </span>
    </Link>
  );
}

export function SortPanel({
  title,
  basePath,
  fields,
  activeField,
  activeDirection,
  range,
  paidOnly = false,
}: {
  title: string;
  basePath: string;
  fields?: SortOption[];
  activeField?: string;
  activeDirection: SortDirection;
  range: { from?: string; to?: string };
  paidOnly?: boolean;
}) {
  const link = (overrides: Record<string, string | undefined>) =>
    `${basePath}${buildQueryString({
      sort: activeField,
      dir: activeDirection,
      from: range.from,
      to: range.to,
      paid: paidOnly ? "1" : undefined,
      ...overrides,
    })}`;

  return (
    <section className="rounded-2xl border border-[#2f3336]">
      <h2 className="px-4 py-3 text-xl font-bold text-[#e7e9ea]">{title}</h2>

      {fields && activeField ? (
        <>
          {fields.map((field) => (
            <Row
              key={field.value}
              href={link({ sort: field.value })}
              label={field.label}
              active={field.value === activeField}
            />
          ))}
          <div className="mx-4 border-t border-[#2f3336]" />
        </>
      ) : null}

      {DIRECTIONS.map((direction) => (
        <Row
          key={direction.value}
          href={link({ dir: direction.value })}
          label={direction.label}
          active={direction.value === activeDirection}
        />
      ))}
      <div className="pb-1.5" />
    </section>
  );
}
