import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:365
* @route '/docs/api'
*/
export const ui = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ui.url(options),
    method: 'get',
})

ui.definition = {
    methods: ["get","head"],
    url: '/docs/api',
} satisfies RouteDefinition<["get","head"]>

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:365
* @route '/docs/api'
*/
ui.url = (options?: RouteQueryOptions) => {
    return ui.definition.url + queryParams(options)
}

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:365
* @route '/docs/api'
*/
ui.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ui.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:365
* @route '/docs/api'
*/
ui.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ui.url(options),
    method: 'head',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:365
* @route '/docs/api'
*/
const uiForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ui.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:365
* @route '/docs/api'
*/
uiForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ui.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:365
* @route '/docs/api'
*/
uiForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ui.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ui.form = uiForm

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:386
* @route '/docs/api.json'
*/
export const document = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(options),
    method: 'get',
})

document.definition = {
    methods: ["get","head"],
    url: '/docs/api.json',
} satisfies RouteDefinition<["get","head"]>

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:386
* @route '/docs/api.json'
*/
document.url = (options?: RouteQueryOptions) => {
    return document.definition.url + queryParams(options)
}

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:386
* @route '/docs/api.json'
*/
document.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:386
* @route '/docs/api.json'
*/
document.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: document.url(options),
    method: 'head',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:386
* @route '/docs/api.json'
*/
const documentForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:386
* @route '/docs/api.json'
*/
documentForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(options),
    method: 'get',
})

/**
* @see vendor/dedoc/scramble/src/ScrambleServiceProvider.php:386
* @route '/docs/api.json'
*/
documentForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

document.form = documentForm

const docs = {
    ui: Object.assign(ui, ui),
    document: Object.assign(document, document),
}

export default docs