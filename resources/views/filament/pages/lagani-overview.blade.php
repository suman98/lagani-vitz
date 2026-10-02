<x-filament-panels::page>
    @php($frontend = $this->getFrontendInfo())

    <x-filament::section heading="Public frontend" description="The Next.js app served by this package.">
        <div class="flex flex-wrap items-center gap-3">
            <x-filament::link :href="$frontend['url']" target="_blank" icon="heroicon-m-arrow-top-right-on-square">
                {{ $frontend['url'] }}
            </x-filament::link>

            @if ($frontend['built'])
                <x-filament::badge color="success">Built</x-filament::badge>
            @else
                <x-filament::badge color="danger">Not built</x-filament::badge>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    Run <code>npm run build</code> in the package <code>frontend/</code> directory.
                </span>
            @endif
        </div>
    </x-filament::section>
</x-filament-panels::page>
