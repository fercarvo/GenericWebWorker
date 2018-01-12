/**
* GenericWebWOrker v1.01
* 
* A Generic Javascript WebWorker that allows the user to execute and pass functions
* Is Fileless, for what the user does not need a file.js to request
*
* @author, Edgar Fernando Carvajal Ulloa <efcu93@gmail.com>, <efcarvaj@espol.edu.ec>
* {@link https://github.com/fercarvo/GenericWebWorker}
*/
class GenericWebWorker {
    /**
    * @param    {any}    data       Any value to be passed to the WW, is the first parameter of the callback
    * @param    {Array}  functions  Array of functions names presented in the context
    * @param    {object} context    Context where the functions are, window default.
    */
    constructor(data, functions, context = window) {
        this.data = data
        this.functions = []
        this.callback = null 

        if (context && Array.isArray(functions) && functions.length > 0) {
            if (functions.some(fn => 'function' !== typeof context[fn] )) {
                throw new Error(`Some of these next (${functions}) are not functions`)
            }
            this.functions = functions.map(fn => this.fn_string( context[fn] ))
        }
    }

    exec(cb) {
        return new Promise((resolve, reject) => {
            if (typeof cb !== 'function'){
                throw new Error(`(${cb}) is not a function`)
            }
            this.callback = this.fn_string(cb)

            if (this.callback.args.split(',').length !== this.functions.length + 1) {
                throw new Error("Invalid number of arguments, use ex. (data, fn1, fn2...)")
            }
            var worker_string = this.fn_string(this.worker).body
            var worker_link = window.URL.createObjectURL( new Blob([worker_string]) )
            var worker = new Worker(worker_link)

            worker.postMessage({ 
                callback: this.callback, 
                functions: this.functions, 
                data: this.data 
            })

            worker.onmessage = e => {
                if (e.data && e.data.error)
                    reject(e.data.error)
                else
                    resolve(e.data)

                worker.terminate() //Se termina el worker
                window.URL.revokeObjectURL(worker_link) //Blob is deleted
                worker = null, worker_link = null //Se elimina las referencias
            }

            worker.onerror = e => {
                reject(e.message)
                worker.terminate()
                window.URL.revokeObjectURL(worker_link) 
                worker = null, worker_link = null
            }
        })
    }

    //The WebWorker that makes the magic, 1st to string and then to Blob
    worker() {
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
    }

    fn_string(fn) {
        var name = fn.name 
        var fn = fn.toString()

        return { name: name, 
            args: fn.substring(fn.indexOf("(") + 1, fn.indexOf(")")),
            body: fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"))
        }        
    }
}