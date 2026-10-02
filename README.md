# nepsealpha/lagani-vitz

Lagani (investment) plans as a reusable Laravel package:

- **Filament 4 plugin** - overview page, plan resource, stats widget.
- **JSON API** - `GET /lagani/api/v1/plans`, `GET /lagani/api/v1/plans/{slug}`.
- **Next.js frontend** - a static export that Laravel serves at `/lagani`.

Composer package names are lowercase, so `laganiVitz` ships as `nepsealpha/lagani-vitz`
(namespace `NepseAlpha\LaganiVitz`).

## Layout

```
lagani-vitz/
├── composer.json                 PSR-4 NepseAlpha\LaganiVitz\ -> src/, auto-discovered provider
├── config/lagani-vitz.php        frontend path, API, admin slug, own + main database connections
├── database/migrations/          lagani_plans table (run by lagani-vitz:migrate)
├── routes/
│   ├── api.php                   /{path}/api/v1/*
│   └── web.php                   /{path}/{any}  -> HTML shell of the Next.js export
├── resources/views/filament/pages/lagani-overview.blade.php
├── src/
│   ├── LaganiVitzServiceProvider.php      config, views, migrations, routes, publishables
│   ├── Models/LaganiPlan.php
│   ├── Models/Main/               read-only models over the main app's tables (MainModel, LivePrice)
│   ├── Http/Controllers/FrontendController.php, Api/PlanController.php
│   ├── Http/Resources/PlanResource.php
│   ├── Support/FrontendShell.php          maps a URL to a file in dist/
│   ├── Support/MainDatabase.php           read-only access to the host app's tables
│   └── Filament/
│       ├── LaganiVitzPlugin.php           what a panel provider attaches
│       ├── Pages/LaganiOverview.php       -> {panel}/lagani
│       ├── Resources/LaganiPlans/...      -> {panel}/lagani/plans
│       └── Widgets/LaganiStatsWidget.php
├── frontend/                     Next.js 16 app (App Router, TypeScript)
└── dist/                         build output (git-ignored; see "Releasing")
```

## How the frontend connects to Laravel

```
browser ── GET /lagani/…            ─► Laravel: FrontendController -> dist/**/index.html
        ── GET /vendor/lagani-vitz/_next/static/*.js|css ─► web server straight from public/
        ── GET /lagani/api/v1/plans ─► Laravel: PlanController -> {"data": [...]}
```

- `next build` runs with `output: 'export'`, `basePath: '/lagani'`, `trailingSlash: true`:
  a fully static site, no Node process in production.
- **HTML shells** (and the `*.txt` RSC payloads Next's router fetches on link clicks) are served by
  `FrontendController`. Unknown paths get `404.html` with a real 404 status.
- **Hashed JS/CSS** are published to `public/vendor/lagani-vitz/_next` and referenced through
  `assetPrefix`, so nginx/Valet serve them directly (nginx `location ~* \.(js|css)$` would 404 them
  if they only existed behind PHP).
- **Same origin**: the API lives under the frontend path, so there is no CORS or token handling.
  `src/lib/api.ts` fetches `/lagani/api/v1/*`.
- Plan detail is one page, `/plan/?slug=…`, reading the slug on the client: a static export cannot
  pre-render rows that only exist in the database.
- The plan `body` is admin-authored HTML; the frontend sanitizes it with DOMPurify before rendering.
- In `next dev` (port 3100) `next.config.mjs` proxies `/lagani/api/*` to `LARAVEL_URL`, so the
  fetch URLs are identical in dev and prod.

## Installation

```bash
composer require nepsealpha/lagani-vitz
# monorepo / local development instead uses a path repository:
#   "repositories": [{"type": "path", "url": "../../packages/lagani-vitz", "options": {"symlink": true}}]
#   "require": {"nepsealpha/lagani-vitz": "@dev"}

php artisan lagani-vitz:migrate                       # lagani_plans, on the package database
php artisan vendor:publish --tag=lagani-vitz-assets   # public/vendor/lagani-vitz/_next
php artisan vendor:publish --tag=lagani-vitz-config   # optional
```

The service provider is auto-discovered. A host that lists providers by hand (or puts the package in
`extra.laravel.dont-discover`) registers `NepseAlpha\LaganiVitz\LaganiVitzServiceProvider::class`
itself.

Attach the Filament plugin to a panel:

```php
use NepseAlpha\LaganiVitz\Filament\LaganiVitzPlugin;

$panel->plugin(LaganiVitzPlugin::make());
```

A panel that builds its sidebar with `->navigation(...)` ignores page/resource navigation, so add
`LaganiVitzPlugin::navigationItems()` to it.

## Usage

| URL                              | What                               |
|----------------------------------|------------------------------------|
| `/lagani`                        | public Next.js frontend            |
| `/lagani/api/v1/plans`           | published plans (JSON)             |
| `/{panel}/lagani`                | Filament overview page + stats     |
| `/{panel}/lagani/plans`          | Filament plan resource (CRUD)      |

Only plans with **Published** switched on reach the frontend and API.

Configuration (`config/lagani-vitz.php` / env): `LAGANI_VITZ_PATH` (must match the frontend's
`LAGANI_BASE_PATH` at build time), `LAGANI_VITZ_ADMIN_SLUG`, `LAGANI_VITZ_FRONTEND_ENABLED`,
`LAGANI_VITZ_DIST_PATH`. `frontend.middleware` applies to the HTML shell only; keep
session/cookie middleware out of it.

## Databases

The package uses two Laravel connections, both decided at deploy time through env:

| Side   | Holds                                             | Env prefix            | Registered name     |
|--------|---------------------------------------------------|-----------------------|---------------------|
| `own`  | the package's tables (`lagani_plans`); migrations and models run here | `LAGANI_VITZ_DB_*`      | `lagani_vitz`      |
| `main` | the host app's data, read-only (stocks, prices, ...) | `LAGANI_VITZ_MAIN_DB_*` | `lagani_vitz_main` |

Per side, first match wins:

1. The host defines a connection with that name (`lagani_vitz` / `lagani_vitz_main`, or whatever
   `..._CONNECTION` says) in its own `config/database.php`: the package uses it. **The main app
   does this**, so it controls driver, pgbouncer options and so on.
2. else, `..._DATABASE` (or `..._URL`) is set: the package registers a connection from
   `..._DRIVER` (default `pgsql`), `_HOST`, `_PORT`, `_DATABASE`, `_USERNAME`, `_PASSWORD`,
   `_SCHEMA`, `_SSLMODE`. This is the setup for a host that does not define one.
3. else: `main` uses the host's default connection (it is the host's own data). `own` has **no
   fallback**: until `LAGANI_VITZ_DB_*` is set the package throws "The LaganiVitz database is not
   configured" instead of writing to the main database.

A host-defined connection is never overwritten by the package's env.

```dotenv
# package gets its own database, and reads the main app's database with a read-only user
LAGANI_VITZ_DB_HOST=10.0.0.5
LAGANI_VITZ_DB_DATABASE=lagani_vitz
LAGANI_VITZ_DB_USERNAME=lagani
LAGANI_VITZ_DB_PASSWORD=...

LAGANI_VITZ_MAIN_DB_HOST=10.0.0.9
LAGANI_VITZ_MAIN_DB_DATABASE=nepsealpha
LAGANI_VITZ_MAIN_DB_USERNAME=lagani_readonly
LAGANI_VITZ_MAIN_DB_PASSWORD=...
```

The database itself must exist (`createdb lagani_vitz`); the package creates tables, not databases.

```bash
php artisan lagani-vitz:migrate              # migrate, on the package database
php artisan lagani-vitz:migrate --status
php artisan lagani-vitz:migrate --pretend    # print the SQL
php artisan lagani-vitz:migrate --rollback   # last batch (hosts may prohibit destructive commands)
```

The command runs `migrate --database=<own connection>` on the package migrations only, so the
tables **and** the `migrations` bookkeeping table live in the package database and nothing is
written to the host's default connection. The host's plain `php artisan migrate` does not see
these migrations; add `lagani-vitz:migrate` to the deploy script.

Main-app tables are listed under `database.main.tables` (logical name => real table, overridable per
deployment by env). Read them with an Eloquent model or the query helper:

```php
use NepseAlpha\LaganiVitz\Models\Main\LivePrice;
use NepseAlpha\LaganiVitz\Support\MainDatabase;

LivePrice::forSymbol('NABIL')->eod()->latest('created_at')->first();   // sample model
LivePrice::latestPerSymbol()->get();                                    // newest row per stock
MainDatabase::table('live_prices')->where('symbol', 'NABIL')->first(); // same table, no model
```

[`Models\Main\LivePrice`](src/Models/Main/LivePrice.php) is the sample: a read-only mirror of the
main app's `App\Models\Prices\LivePrice` (`web_today_price`, env
`LAGANI_VITZ_MAIN_TABLE_LIVE_PRICES`). To add another, extend `Models\Main\MainModel`, return the
logical table name from `logicalTable()`, and add that name to `database.main.tables`.

`own` and `main` may be different servers: no foreign keys from package tables to main tables, no
cross-database joins. Look rows up through `MainDatabase` and combine them in PHP. The package
never writes to `main`; give its user read-only grants to enforce that.

## Developing the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3100/lagani, API proxied to Laravel
npm run build                # -> ../dist
php artisan vendor:publish --tag=lagani-vitz-assets --force
```

## Releasing

`dist/` is git-ignored. Run `npm run build` in CI and include `dist/` in the tagged release
(`git add -f dist`), otherwise Composer consumers get `503: LaganiVitz frontend is not built`.
Host applications run the `vendor:publish --tag=lagani-vitz-assets --force` step on every deploy.
