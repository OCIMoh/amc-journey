"use client";

import Image from "next/image";
import { getMedia, site } from "@/content/site";

export function Emergency() {
  const asset = getMedia("11-emergency");
  const phone = site.verified.phone;

  return (
    <section
      id="emergency"
      className="relative overflow-hidden bg-amber-deep text-ivory"
    >
      <div className="absolute inset-0 opacity-30">
        <Image
          src={asset.src}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          aria-hidden
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-deep via-amber-deep/92 to-amber-deep/75" />

      <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-24 lg:px-16">
        <div>
          <p className="text-[0.97rem] uppercase tracking-wideish text-amber-soft">
            Always reachable
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.65rem,calc(5.5vw+4px),4.45rem)] leading-[1.02] tracking-tightish">
            {site.verified.emergencyHoursLabel}
          </h2>
          <p className="mt-6 max-w-xl text-[1.33rem] leading-relaxed text-ivory/85">
            {site.ending.contactHeadline} {site.ending.contactBody}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="magnetic-item bg-ivory px-5 py-4 text-[1.05rem] font-semibold uppercase tracking-wideish text-amber-deep transition hover:bg-teal-mist"
              >
                Call {phone}
              </a>
            ) : (
              <a
                href="#location"
                className="magnetic-item bg-ivory px-5 py-4 text-[1.05rem] font-semibold uppercase tracking-wideish text-amber-deep transition hover:bg-teal-mist"
              >
                Open contact for emergency number
              </a>
            )}
            <a
              href="#location"
              className="border border-ivory/50 px-5 py-4 text-[1.05rem] font-semibold uppercase tracking-wideish text-ivory transition hover:bg-ivory/10"
            >
              Get directions
            </a>
          </div>
        </div>

        <div className="border-l border-ivory/30 bg-ivory/[0.07] p-6 md:p-8">
          <p className="font-display text-[1.75rem] leading-tight">
            Reach AMC
          </p>
          <ul className="mt-6 space-y-4 text-[1.2rem] leading-relaxed text-ivory/85">
            <li>
              <strong className="text-ivory">Clinic:</strong>{" "}
              {site.verified.name}
            </li>
            <li>
              <strong className="text-ivory">Area:</strong>{" "}
              {site.verified.locality}, {site.verified.landmark}
            </li>
            <li>
              <strong className="text-ivory">Phone:</strong>{" "}
              {phone ?? "Confirm the public emergency number to publish here."}
            </li>
            <li>
              <strong className="text-ivory">Hours:</strong> Open 24 hours, every
              day
            </li>
            <li>
              <strong className="text-ivory">Instagram:</strong>{" "}
              <a
                href={site.verified.instagram}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ivory/40 underline-offset-2 transition hover:text-ivory"
              >
                {site.verified.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Location() {
  const mapsQuery = encodeURIComponent(
    "Animal Medical Center Opposite Community Center Sector 70 Mohali"
  );

  return (
    <section
      id="location"
      className="bg-ivory-soft px-5 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-[0.97rem] uppercase tracking-wideish text-teal">
            Location
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.35rem,calc(4.5vw+4px),3.55rem)] leading-[1.08] tracking-tightish text-ink">
            Find AMC in Sector 70, Mohali
          </h2>
          <dl className="mt-9 space-y-6 text-[1.27rem] leading-relaxed text-ink-muted">
            <div>
              <dt className="text-[0.95rem] uppercase tracking-wideish text-teal">
                Address
              </dt>
              <dd className="mt-2 text-ink">
                {site.verified.name}
                <br />
                {site.verified.landmark}
                <br />
                {site.verified.locality}
                <br />
                {site.verified.region}
              </dd>
            </div>
            <div>
              <dt className="text-[0.95rem] uppercase tracking-wideish text-teal">
                Serving
              </dt>
              <dd className="mt-2">{site.verified.serving}</dd>
            </div>
          </dl>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noreferrer"
            className="magnetic-item mt-9 inline-flex bg-teal-deep px-5 py-4 text-[1rem] font-semibold uppercase tracking-wideish text-ivory transition hover:bg-teal"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="relative min-h-[320px] overflow-hidden bg-teal-mist md:min-h-[420px]">
          <iframe
            title="Map search for Animal Medical Center Sector 70 Mohali"
            src={`https://maps.google.com/maps?q=${mapsQuery}&z=15&output=embed`}
            className="absolute inset-0 h-full w-full border-0 grayscale-[20%] contrast-[1.05]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ivory/10 bg-ink px-5 py-8 pb-24 text-ivory/55 md:px-10 md:pb-8 lg:px-16">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-[1.35rem] text-ivory/80">
            {site.brand.name}
          </p>
          <a
            href={site.verified.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-[1.03rem] text-ivory/70 transition hover:text-ivory"
          >
            Follow {site.verified.instagramHandle} on Instagram
          </a>
        </div>
        <p className="max-w-xl text-[1.03rem] leading-relaxed">
          {site.assetDisclaimer}
        </p>
      </div>
    </footer>
  );
}
