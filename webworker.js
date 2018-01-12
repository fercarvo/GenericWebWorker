//This file is not used, just for development purpose.
onmessage = function (e) {
    try {
        var functions = {} 
        var args = []

        e.data.functions.forEach(fn => {
            functions[fn.name] = new Function(fn.args, fn.body)
            args = [...args, fn.name] //["fn_1", "fn_2", "fn_3"]
        })

        var callback = new Function( e.data.callback.args, e.data.callback.body) //fn to execute

        args = args.map(fn_name => functions[fn_name])
        args = [e.data.data, ...args]

        try {
            var result = callback.apply(this, args)

            if (!isPromise(result)) //If not a promise
                return postMessage(result)

            result.then(res => postMessage(res))
            result.catch(e => postMessage({error: e}))

        } catch (e) {
            throw new Error(`FunctionError: ${e}`)
        }
    } catch (e) {
        postMessage({error: e.message})
    }
}

function isPromise(obj) { //Check if the return of a function is a promise
    return !!obj && (typeof obj === 'object' && typeof obj.then === 'function')
}