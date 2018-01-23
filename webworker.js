//This file is not used, just for development purpose.
onmessage = async function (e) {
    try {                
        var cb = new Function(`return ${e.data.callback}`)();
        var args = e.data.args.map(p => (p.type == 'fn') ? new Function(`return ${p.fn}`)() : p);

        try {
            var result = await cb.apply(this, args); //If it is a promise or async function
            return postMessage(result)

        } catch (e) { throw new Error(`CallbackError: ${e}`) }
    } catch (e) { postMessage({error: e.message}) }
}