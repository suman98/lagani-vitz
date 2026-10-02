<?php

namespace NepseAlpha\LaganiVitz\Http\Controllers;

use Illuminate\Http\Response;
use NepseAlpha\LaganiVitz\Support\FrontendShell;

class FrontendController
{
    public function __invoke(FrontendShell $shell, ?string $path = null): Response
    {
        abort_unless(
            $shell->isBuilt(),
            503,
            'LaganiVitz frontend is not built. Run `npm run build` in the package frontend/ directory.',
        );

        [$file, $status, $contentType] = $shell->resolve($path) ?? abort(404);

        return response(file_get_contents($file), $status, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'no-cache',
        ]);
    }
}
