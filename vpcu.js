(function () {
    var vRegister = function (bits) {
        if(!bits) {
            bits = 16;
        }
        this.bits = bits;
        if(typeof bits != 'number' || bits < 1 || bits !== Math.floor(bits)) {
            throw new TypeError("the amount of bits must be an integer number that is greater than 0");
        }
        this.data = [];
        for(var i = 0; i < bits; i++) {
            this.data.push(false);
        }
    };
    vRegister.prototype.get = function (index) {
        if(typeof index != 'number' || index < 0 || index >= this.data.length || Math.floor(index) !== index) {
            throw new TypeError('invalid register index');
        }
        return this.data[index];
    };
    vRegister.prototype.set = function (index, data) {
        if(typeof index != 'number' || index < 0 || index >= this.data.length || Math.floor(index) !== index) {
            throw new TypeError('invalid register index');
        }
        // we can only store a 1 or a 0
        this.data[index] = Boolean(data);
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
        // onmemoryread and onmemorywrite events
        this.onmemoryread = function () {
            return 0x00;
        };
        this.onmemorywrite = function () {
            // do nothing by default
        };
        // prepare for adding opcodes
        this.opcodes = {};
    };
    vCPU.prototype.addRegister = function (bits) {
        this.GPRegisters.push(new vRegister(bits));
    };
    vCPU.prototype.setOpcode = function (opcode, type) {}
})();
