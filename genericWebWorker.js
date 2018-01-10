/*
    GenericWebWorker v1.0
    
    Author, Edgar Fernando Carvajal Ulloa <efcu93@gmail.com>, <efcarvaj@espol.edu.ec>
    A Generic Javascript WebWorker where the user can execute and pass functions.

    This WebWorker does not require a external WW file.
*/
class GenericWebWorker {
    /*  data, information to be passed to the ww
        context, the context where the functions are, if not mention, window
        functions, Array of functions manes to be passed ej ["fn_1", "printerData"]
    */
    constructor(data, functions, context = window) {
        this.data = data
        this.functions = []
        this.callback = null 

        if (context && Array.isArray(functions) && functions.length > 0) {
            if (functions.some(fn => 'function' !== typeof context[fn] ))
                throw new Error(`Some of these next (${functions}) are not functions`)

            this.functions = functions.map(fn => this.fn_string( context[fn] ))
        }
    }

    exec(cb) {
        return new Promise((resolve, reject) => {
            if (typeof cb !== 'function')
                throw new Error(`(${cb}) is not a function`)

            var params = cb.toString()
            if (params.substring(params.indexOf('(')+1,params.indexOf(')')).split(',').length !== this.functions.length+1)
                throw new Error("Invalid number of arguments, use ex. (data, fn1, fn2...)")

            this.callback = this.fn_string(cb)

            var worker_link = window.URL.createObjectURL( new Blob(["self.addEventListener('message',function(e){var functions = {};var args = [];e.data.functions.forEach(fn => {functions[fn.name] = new Function(fn.args, fn.body);args = [...args, fn.name];});var callback = new Function( e.data.callback.args, e.data.callback.body);args = args.map(fn_name => functions[fn_name]);args.unshift(e.data.data);try {var result = callback.apply(this, args);self.postMessage( result );} catch (e) {self.postMessage({error: e.toString()});}}, false);"]))
            var worker = new Worker(worker_link)

            worker.postMessage({ 
                callback: this.callback, 
                functions: this.functions, 
                data: this.data 
            })

            worker.addEventListener('error', error => reject(error.message) )

            worker.addEventListener('message', function(e) {
                if (e.data && e.data.error)
                    reject(e.data.error)
                else
                    resolve(e.data)

                worker.terminate()
            }, false)
        })
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