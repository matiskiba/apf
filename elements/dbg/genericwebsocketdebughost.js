if (apf.hasRequireJS) require.def("apf/elements/dbg/genericwebsocketdebughost",
    ["debug/WSGenericDebuggerService",
     "debug/PythonDebugger",
     "apf/elements/dbg/genericdebugger"],
    function(WSGenericDebuggerService, GenericDebugger, APFGenericDebugger) {

var GenericWebSocketDebugHost = function(socket) {
    this.$socket = socket;
    this.$debugger = null;
    
    this.$init();
};

(function() {
     
    this.$connect = function(callback) {
        if (this.state != "connected")
            this.$v8ds = new WSGenericDebuggerService(this.$socket);
        
        this.state = "connected";
        this.dispatchEvent("connect");
        callback.call(this);
    };
    
    this.loadTabs = function(model) {
        model.load("<tabs><tab id='0'>V8</tab></tabs>");
    };
    
    this.attach = function(tabId, callback) {
		console.debug("CALLBACK");
		console.debug(callback);
        var dbg = this.$debugger;
        
        if (dbg)
            return callback(null, dbg)

        var self = this;
        this.$connect(function() {
            self.$v8ds.attach(0, function() {
                dbg = new APFGenericDebugger(new GenericDebugger(0, self.$v8ds), this);
                self.$debugger = dbg;
                callback(null, dbg);
            });
        });
    };
    
    this.detach = function(dbg, callback) {        
        if (!dbg || this.$debugger !== dbg)
            return callback();
        
        this.$debugger = null;

        var self = this;
        this.$v8ds.detach(0, function(err) {
            dbg.dispatchEvent("detach");
            self.dispatchEvent("disconnect", {});
            callback && callback(err);
        });                
    };  
    
    this.disconnect = function(callback) {
        this.detach(this.$debugger, callback);
    };
    
}).call(GenericWebSocketDebugHost.prototype = new apf.Class());

return GenericWebSocketDebugHost;
});