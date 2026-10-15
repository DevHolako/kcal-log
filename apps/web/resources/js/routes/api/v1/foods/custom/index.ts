import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::index
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:29
* @route '/api/v1/foods/custom'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/foods/custom',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::index
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:29
* @route '/api/v1/foods/custom'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::index
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:29
* @route '/api/v1/foods/custom'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::index
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:29
* @route '/api/v1/foods/custom'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::index
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:29
* @route '/api/v1/foods/custom'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::index
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:29
* @route '/api/v1/foods/custom'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::index
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:29
* @route '/api/v1/foods/custom'
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
* @see \App\Http\Controllers\Api\V1\CustomFoodController::store
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:46
* @route '/api/v1/foods/custom'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/foods/custom',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::store
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:46
* @route '/api/v1/foods/custom'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::store
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:46
* @route '/api/v1/foods/custom'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::store
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:46
* @route '/api/v1/foods/custom'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::store
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:46
* @route '/api/v1/foods/custom'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::show
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:63
* @route '/api/v1/foods/custom/{food}'
*/
export const show = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/foods/custom/{food}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::show
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:63
* @route '/api/v1/foods/custom/{food}'
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
* @see \App\Http\Controllers\Api\V1\CustomFoodController::show
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:63
* @route '/api/v1/foods/custom/{food}'
*/
show.get = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::show
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:63
* @route '/api/v1/foods/custom/{food}'
*/
show.head = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::show
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:63
* @route '/api/v1/foods/custom/{food}'
*/
const showForm = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::show
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:63
* @route '/api/v1/foods/custom/{food}'
*/
showForm.get = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::show
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:63
* @route '/api/v1/foods/custom/{food}'
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
* @see \App\Http\Controllers\Api\V1\CustomFoodController::update
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:82
* @route '/api/v1/foods/custom/{food}'
*/
export const update = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/v1/foods/custom/{food}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::update
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:82
* @route '/api/v1/foods/custom/{food}'
*/
update.url = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{food}', parsedArgs.food.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::update
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:82
* @route '/api/v1/foods/custom/{food}'
*/
update.put = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::update
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:82
* @route '/api/v1/foods/custom/{food}'
*/
const updateForm = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::update
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:82
* @route '/api/v1/foods/custom/{food}'
*/
updateForm.put = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::destroy
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:99
* @route '/api/v1/foods/custom/{food}'
*/
export const destroy = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/foods/custom/{food}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::destroy
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:99
* @route '/api/v1/foods/custom/{food}'
*/
destroy.url = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{food}', parsedArgs.food.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::destroy
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:99
* @route '/api/v1/foods/custom/{food}'
*/
destroy.delete = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::destroy
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:99
* @route '/api/v1/foods/custom/{food}'
*/
const destroyForm = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\CustomFoodController::destroy
* @see app/Http/Controllers/Api/V1/CustomFoodController.php:99
* @route '/api/v1/foods/custom/{food}'
*/
destroyForm.delete = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const custom = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default custom