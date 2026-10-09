<?php

namespace NepseAlpha\LaganiViz\Support;

/**
 * Locates the pages of the Next.js static export (`next build` with
 * `output: 'export'` and `trailingSlash: true`).
 *
 * Only two kinds of files are ever returned from under the dist root:
 *   - `*.html`  the page shells;
 *   - `*.txt`   the RSC payloads Next's client router fetches for soft
 *               navigation (`/plan/index.txt`); without them every link click
 *               degrades to a full page load.
 * Hashed assets under `_next/` are served by the web server from
 * `public/vendor/lagani-viz`, never by PHP.
 */
class FrontendShell
{
    public const HTML = 'text/html; charset=UTF-8';

    /** Next accepts text/plain for payloads of a static export. */
    public const PAYLOAD = 'text/plain; charset=UTF-8';

    public function __construct(private readonly string $root) {}

    public function isBuilt(): bool
    {
        return is_file($this->root.'/index.html');
    }

    /**
     * @return array{0: string, 1: int, 2: string}|null [absolute file path, HTTP status, Content-Type]
     */
    public function resolve(?string $path): ?array
    {
        $path = trim((string) $path, '/');

        if (str_ends_with($path, '.txt')) {
            $file = $this->within($path);

            return $file ? [$file, 200, self::PAYLOAD] : null;
        }

        foreach ($this->pageCandidates($path) as $candidate) {
            if ($file = $this->within($candidate)) {
                return [$file, 200, self::HTML];
            }
        }

        $notFound = $this->within('404.html');

        return $notFound ? [$notFound, 404, self::HTML] : null;
    }

    /**
     * @return list<string>
     */
    private function pageCandidates(string $path): array
    {
        return $path === '' ? ['index.html'] : [$path.'/index.html', $path.'.html'];
    }

    private function within(string $relative): ?string
    {
        foreach (explode('/', $relative) as $segment) {
            if ($segment === '' || $segment === '.' || $segment === '..' || str_contains($segment, "\0")) {
                return null;
            }
        }

        $root = realpath($this->root);
        $file = realpath($this->root.'/'.$relative);

        if ($root === false || $file === false || ! is_file($file)) {
            return null;
        }

        return str_starts_with($file, $root.DIRECTORY_SEPARATOR) ? $file : null;
    }
}
