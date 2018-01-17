setInterval(function(){
    console.log("This run in the main thread, web workers in a diferent one" + Math.random())
}, 10000)


//context that have functions
var foo = {
    //Function that block CPU for n ms
    blockCpu: function (ms) {
        var now = new Date().getTime();
        var result = 0
        while(true) {
            result += Math.random() * Math.random();
            if (new Date().getTime() > now +ms)
                return;
        }   
    },
    foo: function () {
        return 1231234321312*234234234
    }
}

var data = {
    bla: "asdasd",
    ble: 12312312312,
    blu: [12,32,12312]
}

//1st parameter is data to be passed.
//2nd array of functions names that belong to the context.
//3rd context that have the functions 
var worker = new GenericWebWorker(data,  foo.blockCpu, foo.foo) //Foo is the context of the functions

worker.exec(function (data, passedfunction, foo) {
    console.log(foo()) //The foo function
    passedfunction(20000) //The blockCpu function
    console.log(data)
    return "Anakin Skywalker"
})
.then(data => console.log(data))
.catch(e => console.log(e))









function fn_print() {
    console.log(8978967699999999)
}

var w2 = new GenericWebWorker(null, fn_print)

w2.exec(function (data, printer){
    console.log("if the context is no listed, window is the default")
    printer()
    return "bla"
}).then(d => console.log(d))
.catch(e=> console.log(e))









var w3 = new GenericWebWorker()

w3.exec(function(){
    console.log("You can also pass zero arguments")
}).then(()=>{}).catch(e=> {})

w3.exec(function(){
    var a = 0
    for (var i = 0; i < 100000000000; i++)
        a += i

    console.log("After a long long time, in a galaxy far far away")    
}).then(()=>{}).catch(e=> {})