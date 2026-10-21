import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\FoodController::store
* @see app/Http/Controllers/FoodController.php:320
* @route '/foods/custom'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/foods/custom',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FoodController::store
* @see app/Http/Controllers/FoodController.php:320
* @route '/foods/custom'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::store
* @see app/Http/Controllers/FoodController.php:320
* @route '/foods/custom'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::store
* @see app/Http/Controllers/FoodController.php:320
* @route '/foods/custom'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FoodController::store
* @see app/Http/Controllers/FoodController.php:320
* @route '/foods/custom'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\FoodController::update
* @see app/Http/Controllers/FoodController.php:334
* @route '/foods/custom/{food}'
*/
export const update = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/foods/custom/{food}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\FoodController::update
* @see app/Http/Controllers/FoodController.php:334
* @route '/foods/custom/{food}'
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
* @see \App\Http\Controllers\FoodController::update
* @see app/Http/Controllers/FoodController.php:334
* @route '/foods/custom/{food}'
*/
update.put = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\FoodController::update
* @see app/Http/Controllers/FoodController.php:334
* @route '/foods/custom/{food}'
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
* @see \App\Http\Controllers\FoodController::update
* @see app/Http/Controllers/FoodController.php:334
* @route '/foods/custom/{food}'
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
* @see \App\Http\Controllers\FoodController::destroy
* @see app/Http/Controllers/FoodController.php:348
* @route '/foods/custom/{food}'
*/
export const destroy = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/foods/custom/{food}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FoodController::destroy
* @see app/Http/Controllers/FoodController.php:348
* @route '/foods/custom/{food}'
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
* @see \App\Http\Controllers\FoodController::destroy
* @see app/Http/Controllers/FoodController.php:348
* @route '/foods/custom/{food}'
*/
destroy.delete = (args: { food: number | { id: number } } | [food: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\FoodController::destroy
* @see app/Http/Controllers/FoodController.php:348
* @route '/foods/custom/{food}'
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
* @see \App\Http\Controllers\FoodController::destroy
* @see app/Http/Controllers/FoodController.php:348
* @route '/foods/custom/{food}'
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
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default custom