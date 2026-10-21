import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import water from './water'
import weight from './weight'
import measurements from './measurements'
import exercises from './exercises'
/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/diary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
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
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:76
* @route '/diary'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/diary',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:76
* @route '/diary'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:76
* @route '/diary'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:76
* @route '/diary'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:76
* @route '/diary'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\DiaryController::quickAdd
* @see app/Http/Controllers/DiaryController.php:117
* @route '/diary/quick-add'
*/
export const quickAdd = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: quickAdd.url(options),
    method: 'post',
})

quickAdd.definition = {
    methods: ["post"],
    url: '/diary/quick-add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::quickAdd
* @see app/Http/Controllers/DiaryController.php:117
* @route '/diary/quick-add'
*/
quickAdd.url = (options?: RouteQueryOptions) => {
    return quickAdd.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::quickAdd
* @see app/Http/Controllers/DiaryController.php:117
* @route '/diary/quick-add'
*/
quickAdd.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: quickAdd.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::quickAdd
* @see app/Http/Controllers/DiaryController.php:117
* @route '/diary/quick-add'
*/
const quickAddForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: quickAdd.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::quickAdd
* @see app/Http/Controllers/DiaryController.php:117
* @route '/diary/quick-add'
*/
quickAddForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: quickAdd.url(options),
    method: 'post',
})

quickAdd.form = quickAddForm

/**
* @see \App\Http\Controllers\DiaryController::update
* @see app/Http/Controllers/DiaryController.php:90
* @route '/diary/{entry}'
*/
export const update = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/diary/{entry}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\DiaryController::update
* @see app/Http/Controllers/DiaryController.php:90
* @route '/diary/{entry}'
*/
update.url = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { entry: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { entry: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            entry: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        entry: typeof args.entry === 'object'
        ? args.entry.id
        : args.entry,
    }

    return update.definition.url
            .replace('{entry}', parsedArgs.entry.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::update
* @see app/Http/Controllers/DiaryController.php:90
* @route '/diary/{entry}'
*/
update.put = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\DiaryController::update
* @see app/Http/Controllers/DiaryController.php:90
* @route '/diary/{entry}'
*/
const updateForm = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::update
* @see app/Http/Controllers/DiaryController.php:90
* @route '/diary/{entry}'
*/
updateForm.put = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:104
* @route '/diary/{entry}'
*/
export const destroy = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/diary/{entry}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:104
* @route '/diary/{entry}'
*/
destroy.url = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { entry: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { entry: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            entry: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        entry: typeof args.entry === 'object'
        ? args.entry.id
        : args.entry,
    }

    return destroy.definition.url
            .replace('{entry}', parsedArgs.entry.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:104
* @route '/diary/{entry}'
*/
destroy.delete = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:104
* @route '/diary/{entry}'
*/
const destroyForm = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:104
* @route '/diary/{entry}'
*/
destroyForm.delete = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const diary = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    quickAdd: Object.assign(quickAdd, quickAdd),
    water: Object.assign(water, water),
    weight: Object.assign(weight, weight),
    measurements: Object.assign(measurements, measurements),
    exercises: Object.assign(exercises, exercises),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default diary