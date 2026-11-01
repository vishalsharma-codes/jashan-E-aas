import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LANGUAGE_OPTIONS, type VendorProfileRow } from "@/lib/vendorOptions";
import { ChipPicker, Field } from "./Bits";
import {
  CATEGORIES, allSubEvents, categoriesForServices, formatsFor, getCategory, legacyEventTypes, optionsFor,
  searchServices, shortCategory, specialityLine, subEventKey, suggestServices,
} from "@/lib/taxonomy";

type SetFn = <K extends keyof VendorProfileRow>(k: K, v: VendorProfileRow[K]) => void;
const MAX_SERVICES = 3, MAX_SPECIALTIES = 8, MAX_TAGS = 3;

export function ServicesSection({ f, set }: { f: VendorProfileRow; set: SetFn }) {
  const [q, setQ] = useState("");
  const [showCeremonies, setShowCeremonies] = useState(f.category_ids.length <= 3);
  // once the vendor changes a field by hand, we stop auto-filling it
  const touched = useRef({ cats: false, events: false, line: false, specs: false, tags: false });
  const firstRun = useRef(true);

  const shortToId = useMemo(() => new Map(CATEGORIES.map((c) => [shortCategory(c), c.id])), []);
  const results = useMemo(() => searchServices(q).filter((s) => !f.services.includes(s.name)), [q, f.services]);
  const typed = q.trim().length > 1;
  const similar = useMemo(
    () => (typed && results.length === 0 ? suggestServices(q).filter((s) => !f.services.includes(s.name)) : []),
    [q, typed, results.length, f.services],
  );
  const totalEvents = allSubEvents(f.category_ids).length;
  const specOptions = useMemo(() => {
    const o = optionsFor(f.services);
    return o.length ? o : formatsFor(f.category_ids);
  }, [f.services, f.category_ids]);

  const applyEventTypes = (cats: string[], events: string[]) => set("event_types", legacyEventTypes(cats, events));

  // Auto-fill everything downstream when the chosen services change (not on first load, so saved data survives).
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const t = touched.current;
    const cats = t.cats ? f.category_ids : categoriesForServices(f.services);
    const events = t.events ? f.sub_events.filter((e) => allSubEvents(cats).includes(e)) : allSubEvents(cats);
    const specs = t.specs ? f.specialties : optionsFor(f.services).slice(0, MAX_SPECIALTIES);
    set("category", f.services[0] ?? "");
    set("category_ids", cats);
    set("category_id", cats[0] ?? "");
    set("sub_events", events);
    set("specialties", specs);
    if (!t.line) set("subcategory", specialityLine(f.services, cats));
    if (!t.tags) set("tags", specs.slice(0, MAX_TAGS));
    applyEventTypes(cats, events);
    setShowCeremonies(cats.length <= 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.services]);

  const addService = (name: string) => {
    if (f.services.length >= MAX_SERVICES || f.services.includes(name)) return;
    setQ("");
    set("services", [...f.services, name]);
  };

  return (
    <div className="space-y-5">
      {/* 1. SERVICE: the only thing a vendor must do */}
      <Field label="Your service" required hint={`Up to ${MAX_SERVICES}. The first one is your main service.`}>
        {f.services.length > 0 && (
          <div className="mb-3">
            <ChipPicker options={f.services} value={f.services} onChange={(v) => set("services", v)} />
          </div>
        )}
        {f.services.length < MAX_SERVICES && (
          <>
            <Input value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
              placeholder="Search: photographer, decorator, DJ, caterer, pandit..." />
            <div className="mt-3">
              <ChipPicker options={results.map((s) => s.name)} value={[]} onChange={(v) => v[0] && addService(v[0])} />
            </div>
            {similar.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-muted-foreground">No exact match. Did you mean:</p>
                <ChipPicker options={similar.map((s) => s.name)} value={[]} onChange={(v) => v[0] && addService(v[0])} />
              </div>
            )}
            {typed && results.length === 0 && similar.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">Nothing similar found. Check the spelling, or add it as your own service below.</p>
            )}
            {typed && !results.some((s) => s.name.toLowerCase() === q.trim().toLowerCase()) && (
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => addService(q.trim())}>
                Use “{q.trim()}” as my service
              </Button>
            )}
          </>
        )}
      </Field>

      {f.services.length > 0 && (
        <>
          {/* 2. EVENT TYPES: replaces the old Event group dropdown, multi-select and pre-filled */}
          <Field label="Events you work at" required hint="Selected for you from your service. Tap to add or remove.">
            <ChipPicker
              options={CATEGORIES.map(shortCategory)}
              value={f.category_ids.map((id) => shortCategory(getCategory(id)!))}
              onChange={(names) => {
                const cats = names.map((n) => shortToId.get(n)!).filter(Boolean);
                touched.current.cats = true;
                const events = touched.current.events ? f.sub_events.filter((e) => allSubEvents(cats).includes(e)) : allSubEvents(cats);
                set("category_ids", cats); set("category_id", cats[0] ?? ""); set("sub_events", events);
                applyEventTypes(cats, events);
              }} />
          </Field>

          {/* 3. CEREMONIES: all pre-selected, collapsed when the vendor works at many event types */}
          {f.category_ids.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCeremonies(!showCeremonies)}>
              {showCeremonies
                ? "Hide ceremonies"
                : f.sub_events.length >= totalEvents
                  ? "All ceremonies included. Choose specific ones"
                  : `${f.sub_events.length} of ${totalEvents} ceremonies selected. Edit`}
            </Button>
          )}
          {showCeremonies && f.category_ids.map((id) => {
            const c = getCategory(id)!;
            return (
              <Field key={id} label={`${shortCategory(c)}: which ones?`}>
                <ChipPicker options={c.subEvents}
                  value={c.subEvents.filter((e) => f.sub_events.includes(subEventKey(id, e)))}
                  onChange={(picked) => {
                    touched.current.events = true;
                    const rest = f.sub_events.filter((k) => !k.startsWith(id + ":"));
                    const events = [...rest, ...picked.map((e) => subEventKey(id, e))];
                    set("sub_events", events); applyEventTypes(f.category_ids, events);
                  }} />
              </Field>
            );
          })}

          {showCeremonies && f.category_ids.length > 3 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCeremonies(false)}>
              Hide ceremonies
            </Button>
          )}

          {/* 4. SPECIALITY LINE: pre-written */}
          <Field label="Speciality line" hint="Shown under your name. We wrote one, edit it if you like.">
            <Input value={f.subcategory} maxLength={80}
              onChange={(e) => { touched.current.line = true; set("subcategory", e.target.value); }} />
          </Field>

          {/* 5. SPECIALTIES: one-tap suggestions from the blueprint */}
          <Field label="Specialties" hint={`${f.specialties.length} of ${MAX_SPECIALTIES}. Shown on your profile and compare page. Add your own if needed.`}>
            <ChipPicker options={specOptions} value={f.specialties} allowCustom max={MAX_SPECIALTIES}
              onChange={(v) => { touched.current.specs = true; set("specialties", v); }} />
          </Field>

          {/* 6. CARD TAGS: default to the first three specialties */}
          {f.specialties.length > 0 && (
            <Field label="Tags on your vendor card" hint={`${f.tags.length} of ${MAX_TAGS}. Pick from your specialties.`}>
              <ChipPicker options={f.specialties} value={f.tags} max={MAX_TAGS}
                onChange={(v) => { touched.current.tags = true; set("tags", v); }} />
            </Field>
          )}
        </>
      )}

      {/* 7. LANGUAGES */}
      <Field label="Languages you work in">
        <ChipPicker options={LANGUAGE_OPTIONS} value={f.languages} onChange={(v) => set("languages", v)} />
      </Field>
    </div>
  );
}