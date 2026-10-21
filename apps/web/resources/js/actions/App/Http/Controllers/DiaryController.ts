import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/dashboard'
*/
const index42a740574ecbfbac32f8cc353fc32db9 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index42a740574ecbfbac32f8cc353fc32db9.url(options),
    method: 'get',
})

index42a740574ecbfbac32f8cc353fc32db9.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/dashboard'
*/
index42a740574ecbfbac32f8cc353fc32db9.url = (options?: RouteQueryOptions) => {
    return index42a740574ecbfbac32f8cc353fc32db9.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/dashboard'
*/
index42a740574ecbfbac32f8cc353fc32db9.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index42a740574ecbfbac32f8cc353fc32db9.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/dashboard'
*/
index42a740574ecbfbac32f8cc353fc32db9.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index42a740574ecbfbac32f8cc353fc32db9.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/dashboard'
*/
const index42a740574ecbfbac32f8cc353fc32db9Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index42a740574ecbfbac32f8cc353fc32db9.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/dashboard'
*/
index42a740574ecbfbac32f8cc353fc32db9Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index42a740574ecbfbac32f8cc353fc32db9.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/dashboard'
*/
index42a740574ecbfbac32f8cc353fc32db9Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index42a740574ecbfbac32f8cc353fc32db9.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index42a740574ecbfbac32f8cc353fc32db9.form = index42a740574ecbfbac32f8cc353fc32db9Form
/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
const index8540ff38185d94c16e1581215dfd09bc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index8540ff38185d94c16e1581215dfd09bc.url(options),
    method: 'get',
})

index8540ff38185d94c16e1581215dfd09bc.definition = {
    methods: ["get","head"],
    url: '/diary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index8540ff38185d94c16e1581215dfd09bc.url = (options?: RouteQueryOptions) => {
    return index8540ff38185d94c16e1581215dfd09bc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index8540ff38185d94c16e1581215dfd09bc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index8540ff38185d94c16e1581215dfd09bc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index8540ff38185d94c16e1581215dfd09bc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index8540ff38185d94c16e1581215dfd09bc.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
const index8540ff38185d94c16e1581215dfd09bcForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8540ff38185d94c16e1581215dfd09bc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index8540ff38185d94c16e1581215dfd09bcForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8540ff38185d94c16e1581215dfd09bc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DiaryController::index
* @see app/Http/Controllers/DiaryController.php:49
* @route '/diary'
*/
index8540ff38185d94c16e1581215dfd09bcForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8540ff38185d94c16e1581215dfd09bc.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index8540ff38185d94c16e1581215dfd09bc.form = index8540ff38185d94c16e1581215dfd09bcForm

/**
* Multiple routes resolve to \App\Http\Controllers\DiaryController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/dashboard': index42a740574ecbfbac32f8cc353fc32db9,
    '/diary': index8540ff38185d94c16e1581215dfd09bc,
}

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
* @see \App\Http\Controllers\DiaryController::storeWater
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
export const storeWater = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWater.url(options),
    method: 'post',
})

storeWater.definition = {
    methods: ["post"],
    url: '/diary/water',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::storeWater
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
storeWater.url = (options?: RouteQueryOptions) => {
    return storeWater.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::storeWater
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
storeWater.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWater.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeWater
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
const storeWaterForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWater.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeWater
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
storeWaterForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWater.url(options),
    method: 'post',
})

storeWater.form = storeWaterForm

/**
* @see \App\Http\Controllers\DiaryController::destroyWater
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
*/
export const destroyWater = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWater.url(args, options),
    method: 'delete',
})

destroyWater.definition = {
    methods: ["delete"],
    url: '/diary/water/{waterLog}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DiaryController::destroyWater
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
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
* @see \App\Http\Controllers\DiaryController::destroyWater
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
*/
destroyWater.delete = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWater.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DiaryController::destroyWater
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
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
* @see \App\Http\Controllers\DiaryController::destroyWater
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
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
* @see \App\Http\Controllers\DiaryController::storeWeight
* @see app/Http/Controllers/DiaryController.php:158
* @route '/diary/weight'
*/
export const storeWeight = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWeight.url(options),
    method: 'post',
})

storeWeight.definition = {
    methods: ["post"],
    url: '/diary/weight',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::storeWeight
* @see app/Http/Controllers/DiaryController.php:158
* @route '/diary/weight'
*/
storeWeight.url = (options?: RouteQueryOptions) => {
    return storeWeight.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::storeWeight
* @see app/Http/Controllers/DiaryController.php:158
* @route '/diary/weight'
*/
storeWeight.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWeight.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeWeight
* @see app/Http/Controllers/DiaryController.php:158
* @route '/diary/weight'
*/
const storeWeightForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWeight.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeWeight
* @see app/Http/Controllers/DiaryController.php:158
* @route '/diary/weight'
*/
storeWeightForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWeight.url(options),
    method: 'post',
})

storeWeight.form = storeWeightForm

/**
* @see \App\Http\Controllers\DiaryController::destroyWeight
* @see app/Http/Controllers/DiaryController.php:176
* @route '/diary/weight'
*/
export const destroyWeight = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWeight.url(options),
    method: 'delete',
})

destroyWeight.definition = {
    methods: ["delete"],
    url: '/diary/weight',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DiaryController::destroyWeight
* @see app/Http/Controllers/DiaryController.php:176
* @route '/diary/weight'
*/
destroyWeight.url = (options?: RouteQueryOptions) => {
    return destroyWeight.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::destroyWeight
* @see app/Http/Controllers/DiaryController.php:176
* @route '/diary/weight'
*/
destroyWeight.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWeight.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DiaryController::destroyWeight
* @see app/Http/Controllers/DiaryController.php:176
* @route '/diary/weight'
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
* @see \App\Http\Controllers\DiaryController::destroyWeight
* @see app/Http/Controllers/DiaryController.php:176
* @route '/diary/weight'
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
* @see \App\Http\Controllers\DiaryController::storeMeasurements
* @see app/Http/Controllers/DiaryController.php:190
* @route '/diary/measurements'
*/
export const storeMeasurements = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeMeasurements.url(options),
    method: 'post',
})

storeMeasurements.definition = {
    methods: ["post"],
    url: '/diary/measurements',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::storeMeasurements
* @see app/Http/Controllers/DiaryController.php:190
* @route '/diary/measurements'
*/
storeMeasurements.url = (options?: RouteQueryOptions) => {
    return storeMeasurements.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::storeMeasurements
* @see app/Http/Controllers/DiaryController.php:190
* @route '/diary/measurements'
*/
storeMeasurements.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeMeasurements.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeMeasurements
* @see app/Http/Controllers/DiaryController.php:190
* @route '/diary/measurements'
*/
const storeMeasurementsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeMeasurements.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeMeasurements
* @see app/Http/Controllers/DiaryController.php:190
* @route '/diary/measurements'
*/
storeMeasurementsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeMeasurements.url(options),
    method: 'post',
})

storeMeasurements.form = storeMeasurementsForm

/**
* @see \App\Http\Controllers\DiaryController::destroyMeasurements
* @see app/Http/Controllers/DiaryController.php:207
* @route '/diary/measurements'
*/
export const destroyMeasurements = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyMeasurements.url(options),
    method: 'delete',
})

destroyMeasurements.definition = {
    methods: ["delete"],
    url: '/diary/measurements',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DiaryController::destroyMeasurements
* @see app/Http/Controllers/DiaryController.php:207
* @route '/diary/measurements'
*/
destroyMeasurements.url = (options?: RouteQueryOptions) => {
    return destroyMeasurements.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::destroyMeasurements
* @see app/Http/Controllers/DiaryController.php:207
* @route '/diary/measurements'
*/
destroyMeasurements.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyMeasurements.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DiaryController::destroyMeasurements
* @see app/Http/Controllers/DiaryController.php:207
* @route '/diary/measurements'
*/
const destroyMeasurementsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyMeasurements.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::destroyMeasurements
* @see app/Http/Controllers/DiaryController.php:207
* @route '/diary/measurements'
*/
destroyMeasurementsForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyMeasurements.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyMeasurements.form = destroyMeasurementsForm

/**
* @see \App\Http\Controllers\DiaryController::storeExercise
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
export const storeExercise = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeExercise.url(options),
    method: 'post',
})

storeExercise.definition = {
    methods: ["post"],
    url: '/diary/exercises',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::storeExercise
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
storeExercise.url = (options?: RouteQueryOptions) => {
    return storeExercise.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::storeExercise
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
storeExercise.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeExercise.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeExercise
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
const storeExerciseForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeExercise.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::storeExercise
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
storeExerciseForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeExercise.url(options),
    method: 'post',
})

storeExercise.form = storeExerciseForm

/**
* @see \App\Http\Controllers\DiaryController::destroyExercise
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
export const destroyExercise = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyExercise.url(args, options),
    method: 'delete',
})

destroyExercise.definition = {
    methods: ["delete"],
    url: '/diary/exercises/{exerciseLog}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DiaryController::destroyExercise
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
destroyExercise.url = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { exerciseLog: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { exerciseLog: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            exerciseLog: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        exerciseLog: typeof args.exerciseLog === 'object'
        ? args.exerciseLog.id
        : args.exerciseLog,
    }

    return destroyExercise.definition.url
            .replace('{exerciseLog}', parsedArgs.exerciseLog.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::destroyExercise
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
destroyExercise.delete = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyExercise.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DiaryController::destroyExercise
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
const destroyExerciseForm = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyExercise.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::destroyExercise
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
destroyExerciseForm.delete = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyExercise.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyExercise.form = destroyExerciseForm

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

const DiaryController = { index, store, quickAdd, storeWater, destroyWater, storeWeight, destroyWeight, storeMeasurements, destroyMeasurements, storeExercise, destroyExercise, update, destroy }

export default DiaryController