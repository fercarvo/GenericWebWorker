//This file is not used, just for development purpose.
//Used in line 39 of genericWebWorker.js
self.addEventListener('message', function(e) { 
	var functions = {}; 
	var args = [];

	e.data.functions.forEach(fn => {
		functions[fn.name] = new Function(fn.args, fn.body);
		args = [...args, fn.name]; //["fn_1", "fn_2", "fn_3"]
	});

	var callback = new Function( e.data.callback.args, e.data.callback.body); //fn to execute

	args = args.map(fn_name => functions[fn_name]);
	args.unshift(e.data.data);

	try {
		var result = callback.apply(this, args);
		self.postMessage( result );
	} catch (e) {
		self.postMessage({error: e.toString()});
	}

}, false);

//The WebWorker to be embebed in Blob
var string_ww = "self.addEventListener('message',function(e){var functions = {};var args = [];e.data.functions.forEach(fn => {functions[fn.name] = new Function(fn.args, fn.body);args = [...args, fn.name];});var callback = new Function( e.data.callback.args, e.data.callback.body);args = args.map(fn_name => functions[fn_name]);args.unshift(e.data.data);try {var result = callback.apply(this, args);self.postMessage( result );} catch (e) {self.postMessage({error: e.toString()});}}, false);"
