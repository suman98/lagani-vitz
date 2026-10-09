# Lagani Viz — Setup Guide (from zero)

This repo is a **Laravel package** (`nepsealpha/lagani-viz`), not a standalone app. It plugs into
a host Laravel + Filament application. Since nothing is installed yet, this guide starts from a
bare machine and ends with the package running inside a fresh host app.

Checked on this machine already:
- PostgreSQL 16 — **installed and running** ✓ (skip DB server install)
- Node 24 / npm 11 — **installed** ✓ (skip Node install)
- PHP — **not installed**
- Composer — **not installed**

---

## Part 0 — Install PHP and Composer

(Linux Mint / Ubuntu-based. Package needs PHP 8.2+.)

```bash
sudo apt update
sudo apt install -y software-properties-common ca-certificates lsb-release apt-transport-https
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt install -y php8.3 php8.3-cli php8.3-common php8.3-pgsql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-gd php8.3-intl
```

Verify:

```bash
php -v
```

Install Composer (PHP's package manager):

```bash
curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
sudo php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm /tmp/composer-setup.php
composer -V
```

---

## Part 1 — Create the host Laravel app

The package needs something to live inside. Create it as a **sibling folder** of `lagani-viz/`
(not inside it):

```bash
cd /home/arbin
composer create-project laravel/laravel lagani-host
cd lagani-host
```

Install Filament 4 (admin panel the package's UI attaches to):

```bash
composer require filament/filament:"^4.0"
php artisan filament:install --panels
```

This creates an admin panel provider at `app/Providers/Filament/AdminPanelProvider.php` and the
panel is reachable at `/admin` once a user exists:

```bash
php artisan make:filament-user
```

Quick check it all works before adding the package:

```bash
php artisan serve
# visit http://127.0.0.1:8000/admin and log in
```

---

## Part 2 — Install the lagani-viz package into the host app

Since this package isn't published to Packagist, point Composer at the local folder with a path
repository. In **`lagani-host/composer.json`**, add:

```json
{
  "repositories": [
    { "type": "path", "url": "../lagani-viz", "options": { "symlink": true } }
  ],
  "require": {
    "nepsealpha/lagani-viz": "@dev"
  }
}
```

Then, from `lagani-host/`:

```bash
composer update nepsealpha/lagani-viz
```

The service provider is auto-discovered — nothing else to register.

Attach the plugin to the panel. Open `app/Providers/Filament/AdminPanelProvider.php` and add:

```php
use NepseAlpha\LaganiViz\Filament\LaganiVizPlugin;

// inside the ->panel(...) chain:
->plugin(LaganiVizPlugin::make())
```

---

## Part 3 — Why two databases (what your senior means)

This is already designed into the package — [config/lagani-viz.php](config/lagani-viz.php) — you
just need to configure it, not build it.

| Connection | Holds | Env prefix | Access |
|---|---|---|---|
| **own** | the package's own table(s): `lagani_plans` | `LAGANI_VIZ_DB_*` | read + write (migrations run here) |
| **main** | the host app's existing data (stocks, prices, ...) | `LAGANI_VIZ_MAIN_DB_*` | **read-only** |

Why split them: the package must never accidentally write into the main app's data, and in
production the two may sit on different DB servers entirely. No foreign keys, no cross-database
joins — the package reads `main` rows in PHP and combines them itself.

**Resolution order** (decided per side by env, checked in this order):
1. Host app already defines a connection named `lagani_viz` / `lagani_viz_main` in its own
   `config/database.php` → package uses that connection as-is.
2. Else, if `LAGANI_VIZ_DB_DATABASE` (or `_URL`) is set → package registers its own connection
   from `LAGANI_VIZ_DB_*` env vars.
3. Else: `main` quietly falls back to the host's default DB connection. `own` has **no fallback**
   — until `LAGANI_VIZ_DB_*` is set, touching it throws `"The LaganiViz database is not
   configured."` This is intentional, so the package's tables can never land in the wrong database
   by accident.

Since you're starting from scratch with no separate "main app" yet, this guide creates **two
Postgres databases on the same local server** so you can see the split working end-to-end. In
production these can be swapped to point at the real main app's database later — nothing in the
package code changes, only env vars.

---

## Part 4 — Set up the two databases

### Step 1 — create both databases

```bash
sudo -u postgres createuser --superuser $USER   # only if your OS user has no Postgres role yet
createdb lagani_viz        # package's own database
createdb lagani_host_main   # stand-in for "the main app's database"
```

### Step 2 — create a read-only role for the main database

```bash
psql -d lagani_host_main <<'SQL'
CREATE ROLE lagani_readonly WITH LOGIN PASSWORD 'change-me';
GRANT CONNECT ON DATABASE lagani_host_main TO lagani_readonly;
GRANT USAGE ON SCHEMA public TO lagani_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO lagani_readonly;
SQL
```

(`ALTER DEFAULT PRIVILEGES` makes future tables in `lagani_host_main` readable too — handy since
the host app's own migrations haven't run yet.)

### Step 3 — add env vars to `lagani-host/.env`

```dotenv
# --- Host app's own default DB (Laravel's normal DB_*) ---
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=lagani_host_main
DB_USERNAME=postgres
DB_PASSWORD=

# --- lagani-viz package's own database ---
LAGANI_VIZ_DB_HOST=127.0.0.1
LAGANI_VIZ_DB_PORT=5432
LAGANI_VIZ_DB_DATABASE=lagani_viz
LAGANI_VIZ_DB_USERNAME=postgres
LAGANI_VIZ_DB_PASSWORD=

# --- lagani-viz package's read-only view of the "main" database ---
LAGANI_VIZ_MAIN_DB_HOST=127.0.0.1
LAGANI_VIZ_MAIN_DB_PORT=5432
LAGANI_VIZ_MAIN_DB_DATABASE=lagani_host_main
LAGANI_VIZ_MAIN_DB_USERNAME=lagani_readonly
LAGANI_VIZ_MAIN_DB_PASSWORD=change-me
```

Note `DB_DATABASE` and `LAGANI_VIZ_MAIN_DB_DATABASE` point at the **same** database here — that's
the point: `main` is just "wherever the host app's data already lives." The package's `own` data
(`lagani_viz`) stays physically separate.

Run the host app's own migrations too (users table, etc.), using the superuser creds from
`DB_*`:

```bash
php artisan migrate
```

### Step 4 — run the package's migrations

```bash
php artisan lagani-viz:migrate              # creates lagani_plans on the `own` connection
php artisan lagani-viz:migrate --status     # check what ran
```

This touches only `lagani_viz`, never `lagani_host_main`.

### Step 5 — (optional) register main-app tables to read from the package

Edit `config/lagani-viz.php` → `database.main.tables`:

```php
'tables' => [
    'live_prices' => env('LAGANI_VIZ_MAIN_TABLE_LIVE_PRICES', 'web_today_price'),
],
```

Read it with:

```php
use NepseAlpha\LaganiViz\Support\MainDatabase;

MainDatabase::table('live_prices')->where('symbol', 'NABIL')->first();
```

Or build a dedicated read-only model under `src/Models/Main/` extending `MainModel` (see
`LivePrice` for the pattern).

---

## Part 5 — Publish config and frontend assets

```bash
cd /home/arbin/lagani-host
php artisan vendor:publish --tag=lagani-viz-config    # optional, copies config file to host
php artisan vendor:publish --tag=lagani-viz-assets    # required, copies built frontend JS/CSS
```

If this errors with `503: LaganiViz frontend is not built`, the package's `dist/` is empty — do
Part 6 first.

---

## Part 6 — Build the frontend (Next.js)

```bash
cd /home/arbin/lagani-viz/frontend
cp .env.example .env.local
npm install
npm run build          # outputs to ../dist
```

Then, back in the host app:

```bash
cd /home/arbin/lagani-host
php artisan vendor:publish --tag=lagani-viz-assets --force
```

For live frontend development instead of a one-off build:

```bash
cd /home/arbin/lagani-viz/frontend
npm run dev            # http://localhost:3100/lagani, proxies API to LARAVEL_URL in .env.local
```

---

## Part 7 — Run it

```bash
cd /home/arbin/lagani-host
php artisan serve
```

- `http://127.0.0.1:8000/admin/lagani` — Filament plan management (CRUD)
- `http://127.0.0.1:8000/lagani` — public Next.js frontend

---

## Part 8 — Reflecting lagani-viz changes into lagani-host

The path repo is symlinked (`options: { symlink: true }`), so most edits inside
`lagani-viz/` reach `lagani-host` immediately with **no action needed**:

- PHP code: models, Filament resources/pages/tables, controllers, migration *files* themselves.

Some things still need a manual step, from `lagani-host/`:

| Changed in lagani-viz | Run in lagani-host |
|---|---|
| New/edited migration | `php artisan lagani-viz:migrate` |
| `config/lagani-viz.php` (host already has its own published copy — a frozen snapshot) | `php artisan vendor:publish --tag=lagani-viz-config --force` |
| Frontend (`frontend/` Next.js source) | rebuild then republish: `cd ../lagani-viz/frontend && npm run build`, then `php artisan vendor:publish --tag=lagani-viz-assets --force` |
| `composer.json` of the package (new dependency added) | `composer update nepsealpha/lagani-viz` |

After any change, a safe blanket step: `php artisan optimize:clear` (clears cached
config/routes/views so stale cache doesn't hide the update).

---

## Checklist

- [ ] PHP 8.2+, Composer installed
- [ ] `lagani-host` Laravel app created, Filament installed, admin user made
- [ ] `lagani-viz` required via path repo in `lagani-host/composer.json`
- [ ] `LaganiVizPlugin::make()` attached to the admin panel
- [ ] `lagani_viz` and `lagani_host_main` databases created
- [ ] `lagani_readonly` role created with SELECT-only grants
- [ ] `.env` has both `DB_*`/`LAGANI_VIZ_DB_*` and `LAGANI_VIZ_MAIN_DB_*`
- [ ] `php artisan migrate` (host) and `php artisan lagani-viz:migrate` (package) both ran
- [ ] frontend built (`npm run build`) and assets published
- [ ] `/admin/lagani` and `/lagani` both load
