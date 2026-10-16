import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:161
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
* @see app/Http/Controllers/FoodController.php:161
* @route '/foods/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:161
* @route '/foods/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:161
* @route '/foods/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::sync
* @see app/Http/Controllers/FoodController.php:161
* @route '/foods/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

/**
* @see \App\Http\Controllers\FoodController::storeCustom
* @see app/Http/Controllers/FoodController.php:208
* @route '/foods/custom'
*/
export const storeCustom = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCustom.url(options),
    method: 'post',
})

storeCustom.definition = {
    methods: ["post"],
    url: '/foods/custom',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FoodController::storeCustom
* @see app/Http/Controllers/FoodController.php:208
* @route '/foods/custom'
*/
storeCustom.url = (options?: RouteQueryOptions) => {
    return storeCustom.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::storeCustom
* @see app/Http/Controllers/FoodController.php:208
* @route '/foods/custom'
*/
storeCustom.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCustom.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::storeCustom
* @see app/Http/Controllers/FoodController.php:208
* @route '/foods/custom'
*/
const storeCustomForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCustom.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::storeCustom
* @see app/Http/Controllers/FoodController.php:208
* @route '/foods/custom'
*/
storeCustomForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCustom.url(options),
    method: 'post',
})

storeCustom.form = storeCustomForm

/**
* @see \App\Http\Controllers\FoodController::destroyCustom
* @see app/Http/Controllers/FoodController.php:222
* @route '/foods/custom/{food}'
*/
export const destroyCustom = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyCustom.url(args, options),
    method: 'delete',
})

destroyCustom.definition = {
    methods: ["delete"],
    url: '/foods/custom/{food}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FoodController::destroyCustom
* @see app/Http/Controllers/FoodController.php:222
* @route '/foods/custom/{food}'
*/
destroyCustom.url = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyCustom.definition.url
            .replace('{food}', parsedArgs.food.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::destroyCustom
* @see app/Http/Controllers/FoodController.php:222
* @route '/foods/custom/{food}'
*/
destroyCustom.delete = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyCustom.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\FoodController::destroyCustom
* @see app/Http/Controllers/FoodController.php:222
* @route '/foods/custom/{food}'
*/
const destroyCustomForm = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyCustom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::destroyCustom
* @see app/Http/Controllers/FoodController.php:222
* @route '/foods/custom/{food}'
*/
destroyCustomForm.delete = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyCustom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyCustom.form = destroyCustomForm

const FoodController = { search, barcode, index, sync, storeCustom, destroyCustom }

export default FoodController