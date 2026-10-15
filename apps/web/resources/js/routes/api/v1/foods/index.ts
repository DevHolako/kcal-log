import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
import custom from './custom'
/**
* @see \App\Http\Controllers\Api\V1\FoodController::search
* @see app/Http/Controllers/Api/V1/FoodController.php:21
* @route '/api/v1/foods/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/v1/foods/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\FoodController::search
* @see app/Http/Controllers/Api/V1/FoodController.php:21
* @route '/api/v1/foods/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\FoodController::search
* @see app/Http/Controllers/Api/V1/FoodController.php:21
* @route '/api/v1/foods/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::search
* @see app/Http/Controllers/Api/V1/FoodController.php:21
* @route '/api/v1/foods/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::search
* @see app/Http/Controllers/Api/V1/FoodController.php:21
* @route '/api/v1/foods/search'
*/
const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::search
* @see app/Http/Controllers/Api/V1/FoodController.php:21
* @route '/api/v1/foods/search'
*/
searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::search
* @see app/Http/Controllers/Api/V1/FoodController.php:21
* @route '/api/v1/foods/search'
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
* @see \App\Http\Controllers\Api\V1\FoodController::barcode
* @see app/Http/Controllers/Api/V1/FoodController.php:51
* @route '/api/v1/foods/barcode/{barcode}'
*/
export const barcode = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barcode.url(args, options),
    method: 'get',
})

barcode.definition = {
    methods: ["get","head"],
    url: '/api/v1/foods/barcode/{barcode}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\FoodController::barcode
* @see app/Http/Controllers/Api/V1/FoodController.php:51
* @route '/api/v1/foods/barcode/{barcode}'
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
* @see \App\Http\Controllers\Api\V1\FoodController::barcode
* @see app/Http/Controllers/Api/V1/FoodController.php:51
* @route '/api/v1/foods/barcode/{barcode}'
*/
barcode.get = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: barcode.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::barcode
* @see app/Http/Controllers/Api/V1/FoodController.php:51
* @route '/api/v1/foods/barcode/{barcode}'
*/
barcode.head = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: barcode.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::barcode
* @see app/Http/Controllers/Api/V1/FoodController.php:51
* @route '/api/v1/foods/barcode/{barcode}'
*/
const barcodeForm = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: barcode.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::barcode
* @see app/Http/Controllers/Api/V1/FoodController.php:51
* @route '/api/v1/foods/barcode/{barcode}'
*/
barcodeForm.get = (args: { barcode: string | number } | [barcode: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: barcode.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::barcode
* @see app/Http/Controllers/Api/V1/FoodController.php:51
* @route '/api/v1/foods/barcode/{barcode}'
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
* @see \App\Http\Controllers\Api\V1\FoodController::show
* @see app/Http/Controllers/Api/V1/FoodController.php:75
* @route '/api/v1/foods/{food}'
*/
export const show = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/foods/{food}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\FoodController::show
* @see app/Http/Controllers/Api/V1/FoodController.php:75
* @route '/api/v1/foods/{food}'
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
* @see \App\Http\Controllers\Api\V1\FoodController::show
* @see app/Http/Controllers/Api/V1/FoodController.php:75
* @route '/api/v1/foods/{food}'
*/
show.get = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::show
* @see app/Http/Controllers/Api/V1/FoodController.php:75
* @route '/api/v1/foods/{food}'
*/
show.head = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::show
* @see app/Http/Controllers/Api/V1/FoodController.php:75
* @route '/api/v1/foods/{food}'
*/
const showForm = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::show
* @see app/Http/Controllers/Api/V1/FoodController.php:75
* @route '/api/v1/foods/{food}'
*/
showForm.get = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::show
* @see app/Http/Controllers/Api/V1/FoodController.php:75
* @route '/api/v1/foods/{food}'
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
* @see \App\Http\Controllers\Api\V1\FoodController::calculate
* @see app/Http/Controllers/Api/V1/FoodController.php:94
* @route '/api/v1/foods/{food}/calculate'
*/
export const calculate = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: calculate.url(args, options),
    method: 'post',
})

calculate.definition = {
    methods: ["post"],
    url: '/api/v1/foods/{food}/calculate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\FoodController::calculate
* @see app/Http/Controllers/Api/V1/FoodController.php:94
* @route '/api/v1/foods/{food}/calculate'
*/
calculate.url = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return calculate.definition.url
            .replace('{food}', parsedArgs.food.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\FoodController::calculate
* @see app/Http/Controllers/Api/V1/FoodController.php:94
* @route '/api/v1/foods/{food}/calculate'
*/
calculate.post = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: calculate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::calculate
* @see app/Http/Controllers/Api/V1/FoodController.php:94
* @route '/api/v1/foods/{food}/calculate'
*/
const calculateForm = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: calculate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\FoodController::calculate
* @see app/Http/Controllers/Api/V1/FoodController.php:94
* @route '/api/v1/foods/{food}/calculate'
*/
calculateForm.post = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: calculate.url(args, options),
    method: 'post',
})

calculate.form = calculateForm

const foods = {
    search: Object.assign(search, search),
    barcode: Object.assign(barcode, barcode),
    custom: Object.assign(custom, custom),
    show: Object.assign(show, show),
    calculate: Object.assign(calculate, calculate),
}

export default foods