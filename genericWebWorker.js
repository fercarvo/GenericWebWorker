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
    * @param {any} data, Any kind of arguments that will be used in the callback, functions too
    */
    constructor(...data) {
        //The arguments that will be passed to the callback
        this.args = data.map(a => (typeof a === 'function') ? this.fn_string(a) : a)
    }

    exec(cb) {
        return new Promise((resolve, reject) => {

            var callback = this.fn_string(cb)            
            var wk_string = this.fn_string(this.worker).body
            var wk_link = window.URL.createObjectURL( new Blob([wk_string]) )
            var wk = new Worker(wk_link)

            wk.postMessage({ callback, args: this.args });

            wk.onmessage = e => {
                if (e.data && e.data.error)
                    reject(e.data.error)
                else
                    resolve(e.data)
                end()                
            }

            wk.onerror = e => {
                reject(e.message), end()
            }

            function end () {
                wk.terminate(), window.URL.revokeObjectURL(wk_link)
                wk = null, wk_link = null
            }
        })
    }

    //The WebWorker that makes the magic
    worker() {
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
    }

    fn_string(fn) {
        if (typeof fn !== 'function')
            throw new Error(`(${fn}) is not a function`);

        var name = fn.name 
        var fn = fn.toString()
        return { type: 'fn', name: name, 
            args: fn.substring(fn.indexOf("(") + 1, fn.indexOf(")")),
            body: fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"))
        }        
    }
}