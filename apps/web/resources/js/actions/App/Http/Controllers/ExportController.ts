import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ExportController::index
* @see app/Http/Controllers/ExportController.php:28
* @route '/reports'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExportController::index
* @see app/Http/Controllers/ExportController.php:28
* @route '/reports'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExportController::index
* @see app/Http/Controllers/ExportController.php:28
* @route '/reports'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::index
* @see app/Http/Controllers/ExportController.php:28
* @route '/reports'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExportController::index
* @see app/Http/Controllers/ExportController.php:28
* @route '/reports'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::index
* @see app/Http/Controllers/ExportController.php:28
* @route '/reports'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::index
* @see app/Http/Controllers/ExportController.php:28
* @route '/reports'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\ExportController::store
* @see app/Http/Controllers/ExportController.php:48
* @route '/reports/exports'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/reports/exports',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ExportController::store
* @see app/Http/Controllers/ExportController.php:48
* @route '/reports/exports'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExportController::store
* @see app/Http/Controllers/ExportController.php:48
* @route '/reports/exports'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExportController::store
* @see app/Http/Controllers/ExportController.php:48
* @route '/reports/exports'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExportController::store
* @see app/Http/Controllers/ExportController.php:48
* @route '/reports/exports'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\ExportController::download
* @see app/Http/Controllers/ExportController.php:62
* @route '/reports/exports/{export}/download'
*/
export const download = (args: { export: number | { id: number } } | [exportParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/reports/exports/{export}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExportController::download
* @see app/Http/Controllers/ExportController.php:62
* @route '/reports/exports/{export}/download'
*/
download.url = (args: { export: number | { id: number } } | [exportParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { export: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { export: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            export: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        export: typeof args.export === 'object'
        ? args.export.id
        : args.export,
    }

    return download.definition.url
            .replace('{export}', parsedArgs.export.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExportController::download
* @see app/Http/Controllers/ExportController.php:62
* @route '/reports/exports/{export}/download'
*/
download.get = (args: { export: number | { id: number } } | [exportParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::download
* @see app/Http/Controllers/ExportController.php:62
* @route '/reports/exports/{export}/download'
*/
download.head = (args: { export: number | { id: number } } | [exportParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExportController::download
* @see app/Http/Controllers/ExportController.php:62
* @route '/reports/exports/{export}/download'
*/
const downloadForm = (args: { export: number | { id: number } } | [exportParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::download
* @see app/Http/Controllers/ExportController.php:62
* @route '/reports/exports/{export}/download'
*/
downloadForm.get = (args: { export: number | { id: number } } | [exportParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::download
* @see app/Http/Controllers/ExportController.php:62
* @route '/reports/exports/{export}/download'
*/
downloadForm.head = (args: { export: number | { id: number } } | [exportParam: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

download.form = downloadForm

const ExportController = { index, store, download }

export default ExportController