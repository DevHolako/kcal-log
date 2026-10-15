import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DiaryController::index
* @see app/Http/Controllers/Api/V1/DiaryController.php:43
* @route '/api/v1/diary'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/diary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::index
* @see app/Http/Controllers/Api/V1/DiaryController.php:43
* @route '/api/v1/diary'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::index
* @see app/Http/Controllers/Api/V1/DiaryController.php:43
* @route '/api/v1/diary'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::index
* @see app/Http/Controllers/Api/V1/DiaryController.php:43
* @route '/api/v1/diary'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::index
* @see app/Http/Controllers/Api/V1/DiaryController.php:43
* @route '/api/v1/diary'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::index
* @see app/Http/Controllers/Api/V1/DiaryController.php:43
* @route '/api/v1/diary'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::index
* @see app/Http/Controllers/Api/V1/DiaryController.php:43
* @route '/api/v1/diary'
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
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:58
* @route '/api/v1/diary'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/diary',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:58
* @route '/api/v1/diary'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:58
* @route '/api/v1/diary'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:58
* @route '/api/v1/diary'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:58
* @route '/api/v1/diary'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::quickAdd
* @see app/Http/Controllers/Api/V1/DiaryController.php:107
* @route '/api/v1/diary/quick-add'
*/
export const quickAdd = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: quickAdd.url(options),
    method: 'post',
})

quickAdd.definition = {
    methods: ["post"],
    url: '/api/v1/diary/quick-add',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::quickAdd
* @see app/Http/Controllers/Api/V1/DiaryController.php:107
* @route '/api/v1/diary/quick-add'
*/
quickAdd.url = (options?: RouteQueryOptions) => {
    return quickAdd.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::quickAdd
* @see app/Http/Controllers/Api/V1/DiaryController.php:107
* @route '/api/v1/diary/quick-add'
*/
quickAdd.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: quickAdd.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::quickAdd
* @see app/Http/Controllers/Api/V1/DiaryController.php:107
* @route '/api/v1/diary/quick-add'
*/
const quickAddForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: quickAdd.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::quickAdd
* @see app/Http/Controllers/Api/V1/DiaryController.php:107
* @route '/api/v1/diary/quick-add'
*/
quickAddForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: quickAdd.url(options),
    method: 'post',
})

quickAdd.form = quickAddForm

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:124
* @route '/api/v1/diary/water'
*/
export const storeWater = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWater.url(options),
    method: 'post',
})

storeWater.definition = {
    methods: ["post"],
    url: '/api/v1/diary/water',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:124
* @route '/api/v1/diary/water'
*/
storeWater.url = (options?: RouteQueryOptions) => {
    return storeWater.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:124
* @route '/api/v1/diary/water'
*/
storeWater.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWater.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:124
* @route '/api/v1/diary/water'
*/
const storeWaterForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWater.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:124
* @route '/api/v1/diary/water'
*/
storeWaterForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWater.url(options),
    method: 'post',
})

storeWater.form = storeWaterForm

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:141
* @route '/api/v1/diary/water/{waterLog}'
*/
export const destroyWater = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWater.url(args, options),
    method: 'delete',
})

destroyWater.definition = {
    methods: ["delete"],
    url: '/api/v1/diary/water/{waterLog}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:141
* @route '/api/v1/diary/water/{waterLog}'
*/
destroyWater.url = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { waterLog: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { waterLog: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            waterLog: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        waterLog: typeof args.waterLog === 'object'
        ? args.waterLog.id
        : args.waterLog,
    }

    return destroyWater.definition.url
            .replace('{waterLog}', parsedArgs.waterLog.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:141
* @route '/api/v1/diary/water/{waterLog}'
*/
destroyWater.delete = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWater.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:141
* @route '/api/v1/diary/water/{waterLog}'
*/
const destroyWaterForm = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyWater.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWater
* @see app/Http/Controllers/Api/V1/DiaryController.php:141
* @route '/api/v1/diary/water/{waterLog}'
*/
destroyWaterForm.delete = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyWater.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyWater.form = destroyWaterForm

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:156
* @route '/api/v1/diary/weight'
*/
export const storeWeight = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWeight.url(options),
    method: 'post',
})

storeWeight.definition = {
    methods: ["post"],
    url: '/api/v1/diary/weight',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:156
* @route '/api/v1/diary/weight'
*/
storeWeight.url = (options?: RouteQueryOptions) => {
    return storeWeight.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:156
* @route '/api/v1/diary/weight'
*/
storeWeight.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWeight.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:156
* @route '/api/v1/diary/weight'
*/
const storeWeightForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWeight.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::storeWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:156
* @route '/api/v1/diary/weight'
*/
storeWeightForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWeight.url(options),
    method: 'post',
})

storeWeight.form = storeWeightForm

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:177
* @route '/api/v1/diary/weight'
*/
export const destroyWeight = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWeight.url(options),
    method: 'delete',
})

destroyWeight.definition = {
    methods: ["delete"],
    url: '/api/v1/diary/weight',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:177
* @route '/api/v1/diary/weight'
*/
destroyWeight.url = (options?: RouteQueryOptions) => {
    return destroyWeight.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:177
* @route '/api/v1/diary/weight'
*/
destroyWeight.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWeight.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:177
* @route '/api/v1/diary/weight'
*/
const destroyWeightForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyWeight.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroyWeight
* @see app/Http/Controllers/Api/V1/DiaryController.php:177
* @route '/api/v1/diary/weight'
*/
destroyWeightForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyWeight.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyWeight.form = destroyWeightForm

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::update
* @see app/Http/Controllers/Api/V1/DiaryController.php:75
* @route '/api/v1/diary/{entry}'
*/
export const update = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/v1/diary/{entry}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::update
* @see app/Http/Controllers/Api/V1/DiaryController.php:75
* @route '/api/v1/diary/{entry}'
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
* @see \App\Http\Controllers\Api\V1\DiaryController::update
* @see app/Http/Controllers/Api/V1/DiaryController.php:75
* @route '/api/v1/diary/{entry}'
*/
update.put = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::update
* @see app/Http/Controllers/Api/V1/DiaryController.php:75
* @route '/api/v1/diary/{entry}'
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
* @see \App\Http\Controllers\Api\V1\DiaryController::update
* @see app/Http/Controllers/Api/V1/DiaryController.php:75
* @route '/api/v1/diary/{entry}'
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
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:92
* @route '/api/v1/diary/{entry}'
*/
export const destroy = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/diary/{entry}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:92
* @route '/api/v1/diary/{entry}'
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
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:92
* @route '/api/v1/diary/{entry}'
*/
destroy.delete = (args: { entry: number | { id: number } } | [entry: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:92
* @route '/api/v1/diary/{entry}'
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
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:92
* @route '/api/v1/diary/{entry}'
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

const DiaryController = { index, store, quickAdd, storeWater, destroyWater, storeWeight, destroyWeight, update, destroy }

export default DiaryController