import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import custom from './custom'
/**
* @see \App\Http\Controllers\FoodController::search
* @see app/Http/Controllers/FoodController.php:30
* @route '/foods/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/foods/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FoodController::search
* @see app/Http/Controllers/FoodController.php:30
* @route '/foods/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::search
* @see app/Http/Controllers/FoodController.php:30
* @route '/foods/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::search
* @see app/Http/Controllers/FoodController.php:30
* @route '/foods/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FoodController::search
* @see app/Http/Controllers/FoodController.php:30
* @route '/foods/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::search
* @see app/Http/Controllers/FoodController.php:30
* @route '/foods/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::search
* @see app/Http/Controllers/FoodController.php:30
* @route '/foods/search'
*/
searchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

search.form = searchForm

/**
* @see \App\Http\Controllers\FoodController::barcode
* @see app/Http/Controllers/FoodController.php:79
* @route '/foods/barcode/{barcode}'
*/
export const barcode = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barcode.url(args, options),
    method: 'get',
})

barcode.definition = {
    methods: ["get","head"],
    url: '/foods/barcode/{barcode}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FoodController::barcode
* @see app/Http/Controllers/FoodController.php:79
* @route '/foods/barcode/{barcode}'
*/
barcode.url = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { barcode: args }
    }

    if (Array.isArray(args)) {
        args = {
            barcode: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        barcode: args.barcode,
    }

    return barcode.definition.url
            .replace('{barcode}', parsedArgs.barcode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::barcode
* @see app/Http/Controllers/FoodController.php:79
* @route '/foods/barcode/{barcode}'
*/
barcode.get = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barcode.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::barcode
* @see app/Http/Controllers/FoodController.php:79
* @route '/foods/barcode/{barcode}'
*/
barcode.head = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: barcode.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FoodController::barcode
* @see app/Http/Controllers/FoodController.php:79
* @route '/foods/barcode/{barcode}'
*/
const barcodeForm = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: barcode.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::barcode
* @see app/Http/Controllers/FoodController.php:79
* @route '/foods/barcode/{barcode}'
*/
barcodeForm.get = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: barcode.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::barcode
* @see app/Http/Controllers/FoodController.php:79
* @route '/foods/barcode/{barcode}'
*/
barcodeForm.head = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: barcode.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

barcode.form = barcodeForm

/**
* @see \App\Http\Controllers\FoodController::index
* @see app/Http/Controllers/FoodController.php:100
* @route '/foods'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/foods',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FoodController::index
* @see app/Http/Controllers/FoodController.php:100
* @route '/foods'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::index
* @see app/Http/Controllers/FoodController.php:100
* @route '/foods'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::index
* @see app/Http/Controllers/FoodController.php:100
* @route '/foods'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FoodController::index
* @see app/Http/Controllers/FoodController.php:100
* @route '/foods'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::index
* @see app/Http/Controllers/FoodController.php:100
* @route '/foods'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::index
* @see app/Http/Controllers/FoodController.php:100
* @route '/foods'
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
* @see \App\Http\Controllers\FoodController::show
* @see app/Http/Controllers/FoodController.php:179
* @route '/foods/{food}'
*/
export const show = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/foods/{food}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FoodController::show
* @see app/Http/Controllers/FoodController.php:179
* @route '/foods/{food}'
*/
show.url = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { food: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { food: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            food: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        food: typeof args.food === 'object'
        ? args.food.id
        : args.food,
    }

    return show.definition.url
            .replace('{food}', parsedArgs.food.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::show
* @see app/Http/Controllers/FoodController.php:179
* @route '/foods/{food}'
*/
show.get = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::show
* @see app/Http/Controllers/FoodController.php:179
* @route '/foods/{food}'
*/
show.head = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FoodController::show
* @see app/Http/Controllers/FoodController.php:179
* @route '/foods/{food}'
*/
const showForm = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::show
* @see app/Http/Controllers/FoodController.php:179
* @route '/foods/{food}'
*/
showForm.get = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::show
* @see app/Http/Controllers/FoodController.php:179
* @route '/foods/{food}'
*/
showForm.head = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:200
* @route '/foods/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/foods/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:200
* @route '/foods/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:200
* @route '/foods/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:200
* @route '/foods/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:200
* @route '/foods/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

const foods = {
    search: Object.assign(search, search),
    barcode: Object.assign(barcode, barcode),
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    sync: Object.assign(sync, sync),
    custom: Object.assign(custom, custom),
}

export default foods