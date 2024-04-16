// help from https://stackoverflow.com/questions/34708980/generate-sine-wave-and-play-it-in-the-browser

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var cpu = new vCPU(8, 16); // we only need 8 bits
cpu.addRegister(8);
var data = 0;

var WAV = [];
var PROGRAM = [];
WAV.forEach(CHUNK => {});

// LD d8,(d16)
cpu.setOpcode(0x92, function(Opcode) {
    Opcode.SetComebackFunction(function (c0) {
        var d8 = c0.value;
        Opcode.SetComebackFunction(function (c1) {
            var k = c1.value.toString('16');
            if(k.length === 1) { k = '0'+k }
            Opcode.SetComebackFunction(function (c2) {
                var k = c1.value.toString('16');
                if(k.length === 1) { k = '0'+k }
            });
        });
    });
})

cpu.onmemorywrite = function (event) {
    if(event.address === 0xFFFF) {
        data = event.value;
    }
};

cpu.onmemoryread = function (event) {
    var addr = event.address;
    if(addr === 0xFFFF) {
        return data;
    }
    if(PROGRAM[event.address]) {
        return PROGRAM[event.address]
    }
    return 0x00
};