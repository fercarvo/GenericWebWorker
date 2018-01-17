//This file is not used, just for development purpose.
onmessage = function (e) {
    try {                
        var cb = new Function(e.data.callback.args, e.data.callback.body); //fn to execute
        var args = e.data.args.map(p => (p.type === 'fn') ? new Function(p.args, p.body) : p);

        try {
            var result = cb.apply(this, args)

            if (!isPromise(result)) //If not a promise
                return postMessage(result)

            result.then(res => postMessage(res) )
            result.catch(e => postMessage({error: e}) )

        } catch (e) { throw new Error(`FunctionError: ${e}`) }
    } catch (e) { postMessage({error: e.message}) }
}

function isPromise(obj) { //Check if the return of a function is a promise
    return !!obj && (typeof obj === 'object' && typeof obj.then === 'function')
}