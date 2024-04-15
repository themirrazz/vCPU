// vCPU 0.0.1 Stable Release
// (c) themirrazz 2024
modules.export = (function () {
    var vCPUEvent = function () {
        this.trusted = true;
        this.cancelBubbles = false;
        this.cancelable = false;
    };
    vCPUEvent.prototype.toString = function () {
        return '[object vCPUEvent]';
    }
    vCPUEvent.prototype.preventDefault = function () {
        // don't. break. anything.
        return 'やった';
    };
    vCPUEvent.prototype.stopPropagation = function () {
        // don't. break. anything.
        return 'やった';
    };
    var vRegister = function () {
        this.data = 0x00;
    };
    vRegister.prototype.get = function () {
        return this.data;
    };
    vRegister.prototype.set = function (data) {
        return this.data = data;
    };
    var vCPU = function (bits) {
        // if they don't pick we like 16 bits
        if(!bits) {
            bits = 16;
        }
        if(typeof bits != 'number' || bits < 1 || bits !== Math.floor(bits)) {
            throw new TypeError("the amount of bits must be an integer number that is greater than 0");
        }
        this.bits = bits;
        // initalize the program counter, aka 'pointer'
        this.pointer = 0;
        this.GPRegisters = [];
        // event handlers
        this.__events__ = {};
        // onmemoryread and onmemorywrite events
        this.onmemoryread = function () {
            return 0x00;
        };
        this.onmemorywrite = function () {
            // do nothing by default
        };
        // prepare for adding opcodes
        this.opcodes = {};
        // our special register;
        this.SpecialRegister = new vRegister(8);
    };
    vCPU.prototype.addEventListener = function(event, handle) {
        if(!this.__events__[event]) {
            this.__events__[event] = [];
        }
        this.__events__[event].push(handle);
    };
    vCPU.prototype.removeEventListener = function(event, handle) {
        if(!this.__events__[event]) {return false}
        var kn = this.__events__[event];
        var qk = [];
        for(var i = 0; i < kn.length; i++) {
            if(kn[i]!=handle) {qk.push(kn[i])}
        }
        this.__events__[event] = qk;
        return true
    };
    vCPU.prototype.__OnEvent__ = function (event, data) {
        if(!this.__events__[event]) {return false}
        for(var i = 0; i < this.__events__.length; i++) {
            try {
                this.__events__[i](data);
            } catch (e) {
                console.error(e);
            }
        }
    }
    vCPU.prototype.addRegister = function (bits) {
        this.GPRegisters.push(new vRegister(bits));
    };
    vCPU.prototype.setOpcode = function (opcode, type) {
        this.opcodes[opcode] = type;
    };
    vCPU.prototype.clock = function () {
        if(this.pointer > Math.pow(2,this.bits)) {
            // how the hell did that happen?
            this.pointer = 0;
        }
        var self = this;
        var cb = this.comebackOpcode;
        var $value = this.onmemoryread(this.pointer)
        var op = cb || this.opcodes[$value];
        if(!op) {
            op = function () {};
        }
        if(cb) {
            // prevent harmful infinite looping
            this.comebackOpcode = undefined;
        }
        try {
            op({
                ReadMemory: function (addr) {
                    var mr = new vCPUEvent();
                    mr.address = addr;
                    return self.onmemoryread(mr)
                },
                WriteMemory: function (addr, value) {
                    var mw = new vCPUEvent();
                    mw.address = addr;
                    mw.value = value;
                    return self.onmemorywrite(mw);
                },
                SetComebackFunction: function (func) {
                    return self.comebackOpcode = func;
                },
                Registers: self.GPRegisters,
                SetPointer: function (d) {
                    // it will automatically get incremented 1 more
                    d = d - 1;
                    if(d < 0) {
                        // this is as low as you can go
                        self.pointer = -1;
                    } else {
                        while(d > Math.pow(2,self.bits)) {
                            // no memory leaks, okay!
                            d = d - Math.pow(2,self.bits);
                        }
                        if(d < 0) {
                            // I legit don't know how that happened
                            self.pointer = -1;
                        } else {
                            self.pointer = d;
                        }
                    }
                },
                GetPointer: function (d) {
                    return self.pointer;
                },
                ToHex: function (n) {
                    if(Math.floor(n)!==n || n < 0 || n > 255) {
                        throw new TypeError();
                    }
                    var hex = n.toString(16);
                    if(hex.length === 1) {
                        return '0'+hex;
                    } else {
                        return hex;
                    }
                },
                SplitHex: function (n) {
                    // split hex numbers apart into groups of one byte
                    // very useful function indeed
                    if(Math.floor(n)!==n || n < 0) {
                        throw new TypeError();
                    }
                    var hex = n.toString(16);
                    if(Math.floor(hex/2)!==hex/2) {
                        // only time 0 is omitted is beginning
                        hex = "0"+hex;
                    }
                    var arr = [];
                    var d = '';
                    for(var i = 0; i < hex.length; i++) {
                        if(Math.floor(i/2) === i/2) {
                            d = hex[i];
                        } else {
                            arr.push(d+hex[i]);
                        }
                    }
                    return arr;
                },
                data: $value
            });
        } catch (error) {
            // the manufacturing company did a bad job
            this.clock = function () {
                throw new TypeError("'clock' cannot be called on type 'FkedUpVirtualCPU', buy a new one");
            }
            console.error(error);
            var event = new vCPUEvent();
            event.error = error;
            // tell the whole damn world
            this.__OnEvent__('fatalerror', event);
            try {
                vCPU.onfatalerror(event)
            } catch (yetAnotherError) {
                // does it matter? the cpu's already fried www
                return;
            }
        }
        this.pointer ++;
        if(this.pointer > Math.pow(2,this.bits)) {
            this.pointer = 0;
        }
    };
    return vCPU;
})();
