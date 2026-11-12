// Create the database tables and seed them from lib/data/ (events + shops).
// Safe to run more than once: tables are created only if missing, and
// seeding only happens into an empty table.
//
//   DATABASE_URL=postgres://… npm run db:setup
//
// (Get DATABASE_URL from Vercel → Storage → the Neon database → .env.local tab,
// or `vercel env pull`.) Needs Node 22.18+ to import the .ts data files.

import { neon } from '@neondatabase/serverless'
import { events } from '../lib/data/events.ts'
import { tenants } from '../lib/data/tenants.ts'

if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL first.')
  process.exit(1)
}
const sql = neon(process.env.DATABASE_URL)

const schema = [
  `create table if not exists events (
    id text primary key,
    title text not null,
    date text not null,
    time text,
    venue text not null default 'Music Hall',
    summary text not null,
    details text,
    price text,
    ticket_url text,
    flyer text,
    sample boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists tenants (
    id text primary key,
    name text not null,
    status text not null default 'open',
    blurb text not null,
    hours jsonb,
    hours_note text,
    link text,
    link_label text,
    sort int not null default 0,
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists bookings (
    id serial primary key,
    created_at timestamptz not null default now(),
    type text,
    name text not null,
    email text not null,
    date text,
    headcount text,
    message text not null,
    status text not null default 'new',
    notes text,
    archived_at timestamptz
  )`,
  // For databases created before archiving existed.
  `alter table bookings add column if not exists archived_at timestamptz`,
  `create table if not exists subscribers (
    id serial primary key,
    email text not null unique,
    token uuid not null default gen_random_uuid(),
    created_at timestamptz not null default now(),
    unsubscribed_at timestamptz
  )`,
  `create table if not exists announcements (
    id serial primary key,
    created_at timestamptz not null default now(),
    subject text not null,
    body text not null,
    recipients int not null,
    sent int not null
  )`,
  `create table if not exists login_attempts (
    ip text not null,
    at timestamptz not null default now()
  )`,
  `create index if not exists login_attempts_ip_at on login_attempts (ip, at)`,
  // Online ticket sales (Stripe). Price in cents; null = no online sales.
  `alter table events add column if not exists ticket_price_cents int`,
  `alter table events add column if not exists capacity int`,
  `create table if not exists orders (
    id serial primary key,
    created_at timestamptz not null default now(),
    stripe_session_id text not null unique,
    payment_intent text,
    event_id text not null,
    name text,
    email text not null,
    quantity int not null,
    amount_cents int not null,
    checked_in boolean not null default false,
    refunded_at timestamptz
  )`,
  `create index if not exists orders_event on orders (event_id)`,
  // Seats held while a buyer is on Stripe's checkout page (30 min max), so
  // two people can't both buy the last tickets.
  `create table if not exists ticket_holds (
    stripe_session_id text primary key,
    event_id text not null,
    quantity int not null,
    expires_at timestamptz not null
  )`,
  // One login per person. The first one is created by signing in with
  // ADMIN_PASSWORD; after that, admins add each other under Team.
  // Site-wide choices made in the admin, e.g. booking_form_url.
  `create table if not exists settings (
    key text primary key,
    value text,
    updated_at timestamptz not null default now()
  )`,
  // V2 design: event category/kind/subtitle/CTA label, space type/unit/socials/photo/fill,
  // and the fuller booking request form.
  `alter table events add column if not exists category text not null default 'music'`,
  `alter table events add column if not exists kind text`,
  `alter table events add column if not exists subtitle text`,
  `alter table events add column if not exists cta text`,
  `alter table tenants add column if not exists type text`,
  `alter table tenants add column if not exists unit text`,
  `alter table tenants add column if not exists instagram text`,
  `alter table tenants add column if not exists photo text`,
  `alter table tenants add column if not exists fill text not null default 'teal'`,
  `alter table events add column if not exists start_time text`,
  `alter table events add column if not exists end_time text`,
  `alter table bookings add column if not exists org text`,
  `alter table bookings add column if not exists phone text`,
  `alter table bookings add column if not exists backup_date text`,
  `alter table bookings add column if not exists needs text`,
  `create table if not exists admins (
    id serial primary key,
    email text not null unique,
    name text not null,
    password_hash text,
    created_at timestamptz not null default now(),
    created_by int,
    last_login_at timestamptz
  )`,
]

for (const stmt of schema) await sql.query(stmt)
console.log('Tables ready.')

const [{ n: eventCount }] = await sql.query('select count(*)::int as n from events')
if (eventCount === 0) {
  for (const e of events) {
    await sql.query(
      `insert into events (id, title, date, time, venue, summary, details, price, ticket_url, flyer, sample,
         category, kind, subtitle, cta)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [e.id, e.title, e.date, e.time ?? null, e.venue, e.summary, e.details ?? null, e.price ?? null,
       e.ticketUrl ?? null, e.flyer ?? null, Boolean(e.sample), e.category ?? 'music', e.kind ?? null,
       e.subtitle ?? null, e.cta ?? null],
    )
  }
  console.log(`Seeded ${events.length} events.`)
} else {
  console.log(`events already has ${eventCount} rows; not seeding.`)
}

const [{ n: tenantCount }] = await sql.query('select count(*)::int as n from tenants')
if (tenantCount === 0) {
  for (const [i, t] of tenants.entries()) {
    await sql.query(
      `insert into tenants (id, name, status, blurb, hours, hours_note, link, link_label, type, unit, instagram, photo, fill, sort)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [t.id, t.name, t.status, t.blurb, t.hours ? JSON.stringify(t.hours) : null, t.hoursNote ?? null,
       t.link ?? null, t.linkLabel ?? null, t.type ?? null, t.unit ?? null, t.instagram ?? null,
       t.photo ?? null, t.fill ?? 'teal', i + 1],
    )
  }
  console.log(`Seeded ${tenants.length} shops.`)
} else {
  console.log(`tenants already has ${tenantCount} rows; not seeding.`)
}
