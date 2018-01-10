
# GenericWebWorker

## Features

GenericWebWorker enables the execution of javascript WebWorkers without using external js files, this WebWorkers allow the user to:

- run javascript blocking code without stoping the main thread
- pass a generic function to be executed.
- pass functions to be executed in the WebWorker.

Visit [Web Worker MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) for more information about WebWorkers

Its main features are:

#### Zero static my-web-worker.js files

The user does not have to create a /file.js:
  - Dynamic code execution inside web worker.
  - there is no need to request js files.

#### Error-events support

The code executed in the WebWorker have error catch.

#### Not-blocking js code

If there is the need to execute a piece of code that will block the main thread for a long time, for example a huge for loop, math operations or javascript bitcoin minning, you can execute it in a GenericWebWOrker

Basic usage code:

#### WIth zero parameters to the constructor

This will create a WebWorker that will not use any external function o read external data, the code inside the callback execute as it

```js
var worker = new GenericWebWorker()

worker.exec(function() {
    
    //This will block the code for a long time, but it is not in the main thread, so the web page does not freeze.
    var a = 0
    for (var i = 0; i < 100000000000; i++) //blocking code
        a += i

    return a
})
.then(res => console.log(res)) //Getitng the result back in the main thread.
.catch(()=>{})

```

## Using paramethers in the constructor

```js
var gw = new GenericWebWorker({foo: 23, bar: "ii"}, ["test"])

gw.exec(function(data, fun1){
    var a = 0
    for (var i = 0; i < 100000000000; i++) //blocking code
        a += i

    console.log(data) //{foo: 23, bar: "ii"}
	return fun1()
})
.then(data => console.log(data)) //print Hello there
.catch(e=> {})

function test () {
	return "Hello there"
}
```

## Installation

[GenericWebWorker file](genericWebWorker.js)

## How to use

To create a GenericWebWorker you have three options

#### Pass zero parameters to the constructor

This will create a WebWorker that will not use any external function o read external data, the code inside the callback execute as it

```js
var worker = new GenericWebWorker()

worker.exec(function() {

	function mult (x, y) {
		return x*y
	}

	var a = 123
	var b = 90
	var c = mult(a, b)

	return c
})
.then(res => console.log(res)) //Print 11070
.catch(()=>{})

```

### Pass data a functions, but any context

The default context is `window`.

```js
function fn_print() {
    console.log(00098)
}

var w2 = new GenericWebWorker(null, ["fn_print"])

w2.exec(function (data, printer){
    console.log("if the context is no listed, window is the default")
    printer() // 00098
    return "bla"
}).then(d => console.log(d)) // bla
.catch(e=> console.log(e))

```

### Using all paramethers


```js
var foo = {
    blockCpu: function (ms) { //Blocking CPU function 
        var now = new Date().getTime();
        var result = 0
        while(true) {
            result += Math.random() * Math.random();
            if (new Date().getTime() > now +ms)
                return;
        }   
    }
}

var data = {
    bla: "asdasd",
    ble: 12312312312,
    blu: [12,32,12312]
}

var worker = new GenericWebWorker(data, ["blockCpu"], foo) // foo is the context

worker.exec(function (data, blockCpu) {
    blockCpu(20000) // Stop execution for 20s, main thread not affected
    console.log(data) // {bla: "asdasd"...}
    return "Anakin Skywalker"
})
.then(data => console.log(data)) // Anakin Skywalker
.catch(e => console.log(e))
```

### Catch Errors

```js
var worker = new GenericWebWorker()

worker.exec(function () {
	throw new Error("Hello there error")

}).then(() => {})
.catch(e => console.log(e)) // Error: Hello there error
```

## License

[MIT](LICENSE)