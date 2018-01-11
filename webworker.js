//This file is not used, just for development purpose.
//Used in line 39 of genericWebWorker.js
onmessage = function (e) {
	try {
		var functions = {}; 
		var args = [];

		e.data.functions.forEach(fn => {
			functions[fn.name] = new Function(fn.args, fn.body);
			args = [...args, fn.name]; //["fn_1", "fn_2", "fn_3"]
		});

		var callback = new Function( e.data.callback.args, e.data.callback.body); //fn to execute

		args = args.map(fn_name => functions[fn_name]);
		args = [e.data.data, ...args];

		try {
			var result = callback.apply(this, args);
			postMessage( result ); close();
		} catch (e) {
			throw new Error(`FunctionError: ${e}`);
		}
	} catch (e) {
		postMessage({error: e.toString()}); close();
	}
}

//The WebWorker to be embebed in Blob
//onmessage = function (e) { try { var functions = {}; var args = []; e.data.functions.forEach(fn => { functions[fn.name] = new Function(fn.args, fn.body); args = [...args, fn.name];}); var callback = new Function( e.data.callback.args, e.data.callback.body); args = args.map(fn_name => functions[fn_name]); args = [e.data.data, ...args]; try { var result = callback.apply(this, args); postMessage(result); close(); } catch (e) { throw new Error(`FunctionError: ${e}`);}} catch (e) {postMessage({error: e.toString()}); close();} }
var string_ww = "onmessage = function (e) { try { var functions = {}; var args = []; e.data.functions.forEach(fn => { functions[fn.name] = new Function(fn.args, fn.body); args = [...args, fn.name];}); var callback = new Function( e.data.callback.args, e.data.callback.body); args = args.map(fn_name => functions[fn_name]); args = [e.data.data, ...args]; try { var result = callback.apply(this, args); postMessage(result); close(); } catch (e) { throw new Error(`FunctionError: ${e}`);}} catch (e) {postMessage({error: e.toString()}); close();} }"
