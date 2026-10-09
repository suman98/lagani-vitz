<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public frontend (Next.js)
    |--------------------------------------------------------------------------
    |
    | The Next.js app in `frontend/` is built as a static export. Laravel serves
    | its HTML shell at `/{path}`; the hashed JS/CSS chunks are published to
    | `public/vendor/lagani-viz` and served by the web server directly.
    |
    | `path` must match the `basePath` the frontend was built with
    | (LAGANI_BASE_PATH, default "/lagani").
    |
    | `middleware` is applied to the HTML shell only. Keep it free of
    | session/cookie middleware so the shell stays cacheable.
    |
    */
    'frontend' => [
        'enabled' => env('LAGANI_VIZ_FRONTEND_ENABLED', true),
        'path' => env('LAGANI_VIZ_PATH', 'lagani'),
        'dist_path' => env('LAGANI_VIZ_DIST_PATH'), // null = <package>/dist
        'middleware' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | JSON API consumed by the frontend
    |--------------------------------------------------------------------------
    |
    | Mounted at `/{frontend.path}/{prefix}`, i.e. same origin as the frontend,
    | so no CORS setup is needed.
    |
    */
    'api' => [
        'prefix' => 'api/v1',
        'middleware' => ['throttle:60,1'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Filament plugin
    |--------------------------------------------------------------------------
    |
    | `slug` is appended to the host panel's path, e.g. panel `admin/v2` +
    | slug `lagani` => `/admin/v2/lagani`.
    |
    */
    'admin' => [
        'slug' => env('LAGANI_VIZ_ADMIN_SLUG', 'lagani'),
        'navigation_group' => 'Lagani',
    ],

    /*
    |--------------------------------------------------------------------------
    | Databases
    |--------------------------------------------------------------------------
    |
    | The package talks to two databases through two Laravel connections:
    |
    |   own   the package's own tables (lagani_plans, ...). Migrations and the
    |         models run here.
    |   main  the host application's database, read-only, for data the package
    |         borrows (stocks, prices, ...). List the tables under `tables` and
    |         read them with a Models\Main\* model or
    |         MainDatabase::table('logical_name').
    |
    | Resolution, per side (deployment decides, all via env):
    |
    |   1. The host defines a connection named `connection` (default
    |      "lagani_viz" / "lagani_viz_main") in its config/database.php:
    |      the package uses it. This is how the main app does it.
    |   2. else, when `config` is filled (`url` or `database` set, via env), the
    |      package registers that connection itself, with its own credentials.
    |      Use a read-only database user for `main`.
    |   3. else: `main` quietly uses the host's default connection (it is the
    |      host's own data). `own` has NO fallback: the package refuses to touch
    |      any database until LAGANI_VIZ_DB_* is set, so its tables can never
    |      land in the main application's database by accident.
    |
    | `own` migrations run through `php artisan lagani-viz:migrate`, which keeps
    | the tables and the `migrations` bookkeeping table in the package database.
    | They are not loaded into the host's plain `php artisan migrate`.
    |
    | Do not add foreign keys from `own` tables to `main` tables, and do not
    | join across them: they may be different servers. Look rows up through
    | MainDatabase and combine in PHP.
    |
    */
    'database' => [
        'own' => [
            'connection' => env('LAGANI_VIZ_DB_CONNECTION'),
            'config' => [
                'driver' => env('LAGANI_VIZ_DB_DRIVER', 'pgsql'),
                'url' => env('LAGANI_VIZ_DB_URL'),
                'host' => env('LAGANI_VIZ_DB_HOST', '127.0.0.1'),
                'port' => env('LAGANI_VIZ_DB_PORT', '5432'),
                'database' => env('LAGANI_VIZ_DB_DATABASE'),
                'username' => env('LAGANI_VIZ_DB_USERNAME'),
                'password' => env('LAGANI_VIZ_DB_PASSWORD'),
                'schema' => env('LAGANI_VIZ_DB_SCHEMA', 'public'),
                'sslmode' => env('LAGANI_VIZ_DB_SSLMODE', 'prefer'),
                'charset' => 'utf8',
                'prefix' => '',
            ],
            'tables' => [
                'plans' => 'lagani_plans',
                'share_ownerships' => 'share_ownerships',
            ],
        ],

        'main' => [
            'connection' => env('LAGANI_VIZ_MAIN_DB_CONNECTION'),
            'config' => [
                'driver' => env('LAGANI_VIZ_MAIN_DB_DRIVER', 'pgsql'),
                'url' => env('LAGANI_VIZ_MAIN_DB_URL'),
                'host' => env('LAGANI_VIZ_MAIN_DB_HOST', '127.0.0.1'),
                'port' => env('LAGANI_VIZ_MAIN_DB_PORT', '5432'),
                'database' => env('LAGANI_VIZ_MAIN_DB_DATABASE'),
                'username' => env('LAGANI_VIZ_MAIN_DB_USERNAME'),
                'password' => env('LAGANI_VIZ_MAIN_DB_PASSWORD'),
                'schema' => env('LAGANI_VIZ_MAIN_DB_SCHEMA', 'public'),
                'sslmode' => env('LAGANI_VIZ_MAIN_DB_SSLMODE', 'prefer'),
                'charset' => 'utf8',
                'prefix' => '',
            ],
            // logical name => table in the main database. Read through
            // MainDatabase::table('name') or a Models\Main\* model.
            'tables' => [
                'live_prices' => env('LAGANI_VIZ_MAIN_TABLE_LIVE_PRICES', 'web_today_price'),
            ],
        ],
    ],
];
