// help from https://stackoverflow.com/questions/34708980/generate-sine-wave-and-play-it-in-the-browser

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var tempo = 120; // bpm
var cpu = new vCPU(8); // we only need 8 bits
cpu.addRegister(8);
var freq = 0;
var xFE = 0;
var xFF = 0;

function updateFreq() {
    var sFE = xFE.toString('16');
    var sFF = xFF.toString('16');
    if(sFE.length === 1) {sFE='0'+sFE;}
    if(sFF.length === 1) {sFF='0'+sFF;}
    freq = Number('0x'+sFE+sFF)
}

cpu.onmemorywrite = function (event) {
    if(event.address === 0xFE) {
        xFE = event.value;
    } else if(event.address === 0xFF) {
        xFF = event.value;
        updateFreq();
    }
};

cpu.onmemoryread = function (event) {
    var addr = event.address;
    if(addr === 0xFF) {
        return xFF;
    }
    if(addr === 0xFE) {
        return xFE;
    }
    var even = true;
    if(Math.floor(addr/2) !== (addr/2)) {
        addr = addr - 1;
        even = false;
    }
    addr = addr / 2;
    var note = notes[addr];
    if(!note) {
        return 0x00; // rest
    }
    if(even) {
        return note[0]
    } else {
        return note[1]
    }
};

// you can have 127 notes
var notes = [
    // the cool part
    [0x01,0x49],
    [0x01,0x49],
    [0x01,0x26],
    [0x01,0x26],
    [0x01,0x06],
    [0x01,0x06],
    [0x01,0x06],
    [0x00,0x00],
    // repeat
    [0x01,0x49],
    [0x01,0x49],
    [0x01,0x26],
    [0x01,0x26],
    [0x01,0x06],
    [0x01,0x06],
    [0x01,0x06],
    [0x00,0x00],
    // cccc
    [0x01,0x06],
    [0x00,0x00],
    [0x01,0x06],
    [0x00,0x00],
    [0x01,0x06],
    [0x00,0x00],
    [0x01,0x06],
    [0x00,0x00],
    // dddd
    [0x01,0x26],
    [0x00,0x00],
    [0x01,0x26],
    [0x00,0x00],
    [0x01,0x26],
    [0x00,0x00],
    [0x01,0x26],
    [0x00,0x00],
    // we repeat the outro again
    [0x01,0x49],
    [0x01,0x49],
    [0x01,0x26],
    [0x01,0x26],
    [0x01,0x06],
    [0x01,0x06],
    [0x01,0x06],
    [0x00,0x00],
    // the end
    [0xFF,0x00]
];

var int;

cpu.setOpcode(0x00, function (Opcode) {
    Opcode.SetComebackFunction(function (Op0) {
        if(Op0.data === 0x00) {
            Op0.WriteMemory(0xFE, 0x00);
            Op0.WriteMemory(0xFF, 0x00);
        } else if(Op0.data > 0x3B) {
            Op0.WriteMemory(0xFE, 0x00);
            Op0.WriteMemory(0xFF, Op0.Data);
        }
    });
});

for(var i = 0x01; i < 0x4E; i++) {
    (function (k) {
        cpu.setOpcode(k, function (Opcode) {
            Opcode.SetComebackFunction(function (Op0) {
                Op0.WriteMemory(0xFE, k);
                Op0.WriteMemory(0xFF, Op0.Data);
            });
        });
    })(i);
}

cpu.setOpcode(0x4E, function (Opcode) {
    Opcode.SetComebackFunction(function (Op0) {
        if(Op0.data < 0x21) {
            Op0.WriteMemory(0xFE, 0x4E);
            Op0.WriteMemory(0xFF, Op0.Data);
        }
    });
});

cpu.setOpcode(0xFF, function (Opcode) {
    Opcode.SetComebackFunction(function (Op0) {
        Op0.SetPointer(Op0.Data);
    });
});

var context = new AudioContext();

function playSound(arr) {
    var buf = new Float32Array(arr.length)
    for (var i = 0; i < arr.length; i++) buf[i] = arr[i]
    var buffer = context.createBuffer(1, buf.length, context.sampleRate)
    buffer.copyToChannel(buf, 0)
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
}

function sineWaveAt(sampleNumber, tone) {
    var sampleFreq = context.sampleRate / tone
    return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
};

setInterval(function () {
    cpu.clock()
}, (tempo/60)*1000);

function GenerateSineWave(hertz) {
    var arr = [],
    volume = 0.2,
    seconds = 0.25,
    tone = hertz
    for (var i = 0; i < context.sampleRate * seconds; i++) {
        arr[i] = sineWaveAt(i, tone) * volume
    }
    playSound(arr)
}

setInterval(function () {
    GenerateSineWave(freq);
},250);