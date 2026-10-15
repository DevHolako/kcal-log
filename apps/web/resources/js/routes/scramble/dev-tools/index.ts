import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:408
* @route '/_scramble/dev-tools/devtools.js'
*/
export const asset = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: asset.url(options),
    method: 'get',
})

asset.definition = {
    methods: ["get","head"],
    url: '/_scramble/dev-tools/devtools.js',
} satisfies RouteDefinition<["get","head"]>

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:408
* @route '/_scramble/dev-tools/devtools.js'
*/
asset.url = (options?: RouteQueryOptions) => {
    return asset.definition.url + queryParams(options)
}

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:408
* @route '/_scramble/dev-tools/devtools.js'
*/
asset.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: asset.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:408
* @route '/_scramble/dev-tools/devtools.js'
*/
asset.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: asset.url(options),
    method: 'head',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:408
* @route '/_scramble/dev-tools/devtools.js'
*/
const assetForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: asset.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:408
* @route '/_scramble/dev-tools/devtools.js'
*/
assetForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: asset.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:408
* @route '/_scramble/dev-tools/devtools.js'
*/
assetForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: asset.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

asset.form = assetForm

const devTools = {
    asset: Object.assign(asset, asset),
}

export default devTools