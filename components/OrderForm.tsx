"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import site from "@/data/site.json";
import { ORDER_EVENT, type OrderIntent } from "@/components/OrderLink";
import { PhoneIcon, PlusIcon, CloseIcon, CheckIcon, WhatsAppIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { fill } from "@/lib/i18n";
import { formatDay } from "@/lib/format";
import { addDays, isOpenDay, slotsOn } from "@/lib/hours";
import { earliestPickup, emptyLine, isEmail, isPhone, KINDS, orderText, PORTIONS, PRODUCTS, SIZES, SLOTS, waLink, type Order, type OrderLine, type SlotId } from "@/lib/order";

type Errors = Partial<Record<"lines" | "date" | "slot" | "name" | "phone" | "email" | "send", string>>;
type Sent = { notified: boolean; confirmed: boolean; text: string; email: string };

/** Créneaux proposés selon les horaires du jour choisi. */
function slotsFor(day: string): SlotId[] {
  const s = slotsOn(day);
  if (!s.length) return [];
  const open = s[0][0];
  const close = s[s.length - 1][1];
  return SLOTS.filter((id) => (id === "morning" ? open < "12:00" : id === "midday" ? open < "15:00" && close > "12:00" : close > "15:00"));
}

export function OrderForm() {
  const { lang, d } = useLocale();
  const t = d.order;
  const [lines, setLines] = useState<OrderLine[]>([emptyLine()]);
  const touched = useRef(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<SlotId | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  // Jours de retrait possibles : seulement les jours d'ouverture, après le délai de commande
  const days = useMemo(() => {
    if (!now) return [];
    const first = earliestPickup(now);
    return Array.from({ length: 60 }, (_, i) => addDays(first, i)).filter(isOpenDay);
  }, [now]);

  useEffect(() => {
    setNow(new Date());
    const apply = (intent: OrderIntent) => {
      const line: OrderLine = { ...emptyLine(intent.product, intent.detail ?? ""), ...(intent.kind ? { kind: intent.kind } : {}) };
      const keep = touched.current;
      touched.current = true;
      setLines((ls) => (keep ? [...ls, line] : [line]));
    };
    try {
      const saved = sessionStorage.getItem(ORDER_EVENT);
      if (saved) {
        sessionStorage.removeItem(ORDER_EVENT);
        apply(JSON.parse(saved) as OrderIntent);
      }
    } catch {}
    const onIntent = (e: Event) => apply((e as CustomEvent<OrderIntent>).detail);
    window.addEventListener(ORDER_EVENT, onIntent);
    return () => window.removeEventListener(ORDER_EVENT, onIntent);
  }, []);

  const update = (i: number, patch: Partial<OrderLine>) => {
    touched.current = true;
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  };
  const changeProduct = (i: number, product: OrderLine["product"]) => update(i, { ...emptyLine(product), qty: lines[i].qty });

  const daySlots = date ? slotsFor(date) : [];

  function validate(): Errors {
    const e: Errors = {};
    if (!lines.length || lines.some((l) => l.product === "other" && !l.detail.trim())) e.lines = t.errors.lines;
    if (!date) e.date = t.errors.date;
    if (!slot) e.slot = t.errors.slot;
    if (!name.trim()) e.name = t.errors.name;
    if (!isPhone(phone)) e.phone = t.errors.phone;
    if (email.trim() && !isEmail(email)) e.email = t.errors.email;
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector<HTMLElement>(`[data-err="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    const order: Order = { lines, date, slot, name: name.trim(), phone: phone.trim(), email: email.trim(), message: message.trim() };
    setSending(true);
    try {
      const res = await fetch("/api/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lang, order }) });
      const json = (await res.json()) as { ok: boolean; notified?: boolean; confirmed?: boolean };
      if (!res.ok || !json.ok) throw new Error("send");
      setSent({ notified: !!json.notified, confirmed: !!json.confirmed, text: orderText(order, lang, d), email: order.email });
      document.getElementById("commander")?.scrollIntoView({ block: "start" });
    } catch {
      setErrors({ send: t.errors.send });
    } finally {
      setSending(false);
    }
  }

  const call = (
    <a href={`tel:${site.phoneIntl}`} className="btn-line">
      <PhoneIcon />
      {d.nav.call} · {site.phone}
    </a>
  );

  if (sent) {
    const wa = waLink(sent.text);
    return (
      <div className="fade-in border border-line bg-cream p-6 md:p-10" role="status">
        {sent.notified ? <CheckIcon className="h-8 w-8 text-sage-ink" /> : <PhoneIcon className="h-8 w-8 text-crust-ink" />}
        <h3 className="display mt-4 text-[2rem]">{sent.notified ? t.done.title : t.done.pendingTitle}</h3>
        <p className="lead mt-3">{sent.notified ? t.done.text : t.done.pendingText}</p>
        {sent.confirmed && <p className="mt-3 text-muted">{fill(t.done.mail, { email: sent.email })}</p>}
        <pre className="mt-6 border-s border-crust/40 ps-4 font-[family-name:var(--font-jost)] text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink">{sent.text}</pre>
        <div className="mt-8 flex flex-wrap gap-3">
          {call}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-line">
              <WhatsAppIcon className="h-5 w-5" />
              {t.whatsapp}
            </a>
          )}
          <button
            type="button"
            className="link-line ms-2 self-center text-sm text-muted"
            onClick={() => {
              setSent(null);
              setLines([emptyLine()]);
              touched.current = false;
              setDate("");
              setSlot("");
              setMessage("");
            }}
          >
            {t.done.again}
          </button>
        </div>
      </div>
    );
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-2 text-sm text-terracotta">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Errors) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `err-${k}` : undefined, "data-err": k });

  return (
    <form onSubmit={submit} noValidate className="space-y-12">
      {/* 1. Produits */}
      <fieldset>
        <legend className="display mb-5 text-[1.6rem]">
          <span className="me-3 text-crust">1</span>
          {t.productsTitle}
        </legend>
        <ul className="space-y-4">
          {lines.map((l, i) => (
            <li key={i} className="relative border border-line bg-cream p-4 md:p-5">
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-[1.4fr_1fr_6rem]">
                <label className="block">
                  <span className="label">{t.product}</span>
                  <select className="field" value={l.product} onChange={(e) => changeProduct(i, e.target.value as OrderLine["product"])} {...(i === 0 ? aria("lines") : {})}>
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {t.products[p]}
                      </option>
                    ))}
                  </select>
                </label>
                {l.product === "battu" && (
                  <label className="block">
                    <span className="label">{t.size}</span>
                    <select className="field" value={l.size} onChange={(e) => update(i, { size: e.target.value as OrderLine["size"] })}>
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {t.sizes[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {l.product === "plateau" && (
                  <label className="block">
                    <span className="label">{t.kind}</span>
                    <select className="field" value={l.kind} onChange={(e) => update(i, { kind: e.target.value as OrderLine["kind"] })}>
                      {KINDS.map((k) => (
                        <option key={k} value={k}>
                          {t.kinds[k]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {l.product === "galette" && (
                  <label className="block">
                    <span className="label">{t.portions}</span>
                    <select className="field" value={l.portions} onChange={(e) => update(i, { portions: Number(e.target.value) })}>
                      {PORTIONS.map((n) => (
                        <option key={n} value={n}>
                          {fill(t.portionsValue, { n })}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {l.product === "other" && <span className="hidden sm:block" />}
                <label className="block">
                  <span className="label">{t.quantity}</span>
                  <input type="number" inputMode="numeric" min={1} max={site.order.maxPerLine} className="field" value={l.qty} onChange={(e) => update(i, { qty: Math.min(site.order.maxPerLine, Math.max(1, Number(e.target.value) || 1)) })} />
                </label>
              </div>
              {(l.product === "other" || l.product === "plateau" || l.detail) && (
                <label className="mt-5 block">
                  <span className="label">{l.product === "plateau" ? t.composition : t.product}</span>
                  <input className="field" value={l.detail} maxLength={400} placeholder={l.product === "other" ? t.otherPh : ""} onChange={(e) => update(i, { detail: e.target.value })} />
                </label>
              )}
              {lines.length > 1 && (
                <button type="button" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className="absolute end-1 top-1 flex h-10 w-10 items-center justify-center text-muted hover:text-ink" aria-label={t.removeLine}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {lines.length < 8 && (
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              setLines((ls) => [...ls, emptyLine("other")]);
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-crust-ink"
          >
            <PlusIcon />
            <span className="link-line">{t.addLine}</span>
          </button>
        )}
        {err("lines")}
      </fieldset>

      {/* 2. Retrait */}
      <fieldset>
        <legend className="display mb-2 text-[1.6rem]">
          <span className="me-3 text-crust">2</span>
          {t.pickupTitle}
        </legend>
        <p className="mb-5 text-sm text-muted">{fill(t.lead, { hours: site.order.leadHours })}</p>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <label className="block">
            <span className="label">
              {t.date} <span className="sr-only">({t.required})</span>
            </span>
            <select
              className="field"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (slot && !slotsFor(e.target.value).includes(slot)) setSlot("");
              }}
              required
              {...aria("date")}
            >
              <option value="">—</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {formatDay(day, lang)}
                </option>
              ))}
            </select>
            {err("date")}
          </label>
          <div role="radiogroup" aria-label={t.slot} aria-describedby={errors.slot ? "err-slot" : undefined}>
            <span className="label mb-3">{t.slot}</span>
            <div className="flex flex-wrap gap-2">
              {(date ? daySlots : SLOTS).map((s, i) => (
                <label key={s} className="chip !text-[0.875rem]">
                  <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => setSlot(s)} className="sr-only" {...(i === 0 ? { "data-err": "slot" } : {})} />
                  {t.slots[s]}
                </label>
              ))}
            </div>
            {err("slot")}
          </div>
        </div>
      </fieldset>

      {/* 3. Coordonnées */}
      <fieldset>
        <legend className="display mb-5 text-[1.6rem]">
          <span className="me-3 text-crust">3</span>
          {t.contactTitle}
        </legend>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <label className="block">
            <span className="label">{t.name}</span>
            <input className="field" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required {...aria("name")} />
            {err("name")}
          </label>
          <label className="block">
            <span className="label">{t.phone}</span>
            <input className="field" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required {...aria("phone")} />
            {err("phone")}
          </label>
          <label className="block sm:col-span-2">
            <span className="label">{t.email}</span>
            <input className="field" name="email" type="email" spellCheck={false} inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...aria("email")} />
            <span className="mt-2 block text-[0.8125rem] text-muted">{t.emailHint}</span>
            {err("email")}
          </label>
          <label className="block sm:col-span-2">
            <span className="label">{t.message}</span>
            <textarea name="message" className="field min-h-24 resize-y" maxLength={1500} placeholder={t.messagePh} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
        </div>
      </fieldset>

      <div>
        <button type="submit" className="btn w-full sm:w-auto" disabled={sending}>
          {sending ? t.sending : t.submit}
        </button>
        <p className="mt-4 text-[0.8125rem] text-muted">{t.payNote}</p>
        {errors.send && (
          <div className="mt-5 space-y-4" role="alert">
            <p className="text-terracotta">{errors.send}</p>
            {call}
          </div>
        )}
      </div>
    </form>
  );
}
