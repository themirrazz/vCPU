
// we create a new 8-bit CPU with 16 address lines
var cpu = new vCPU(8, 16);
cpu.addRegister(8); // Register A [0]
cpu.addRegister(8); // Register B [1]
cpu.addRegister(8); // Register C [2]
cpu.addRegister(8); // Register D [3]
cpu.addRegister(8); // Register E [4]
cpu.addRegister(8); // Register F [5]
cpu.addRegister(8); // Register G [6]
cpu.addRegister(8); // Register H [7]

// Load BC,d16
cpu.setOpcode(0x01, function (Opcode) {
    Opcode.SetComebackFunction(function (Comeback0) {
        Comeback0.Registers[1].data = Comeback0.Data;
        Comeback0.SetComebackFunction(function (Comeback1) {
            Comeback0.Registers[2].data = Comeback0.Data;
        });
    });
});

// Load (BC),A
cpu.setOpcode(0x02, function (Opcode) {
    var dataB = Opcode.ToHex(Opcode.Registers[1].data);
    var dataC = Opcode.ToHex(Opcode.Registers[2].data);
    var dataA = Opcode.Registers[0].data;
    var address = Number('0x'+dataB+dataC);
    Opcode.WriteMemory(address, dataA);
});

// Increment BC
cpu.setOpcode(0x03, function (Opcode) {
    var dataB = Opcode.Registers[1].data;
    var dataC = Opcode.Registers[2].data;
    if(dataC > 0xFE) {
        dataC = 0x00;
        if(dataB < 0xFF) {
            dataB++;
        }
    } else {
        dataC++;
    }
    Opcode.Registers[1].data = Number('0x'+Opcode.ToHex(dataB));
    Opcode.Registers[2].data = Number('0x'+Opcode.ToHex(dataC));
});

// Increment B
cpu.setOpcode(0x03, function (Opcode) {
    var dataB = Opcode.Registers[1].data;
    if(dataB < 0xFF) {
        dataB++
    }
    Opcode.Registers[1].data = Number('0x'+Opcode.ToHex(dataB));
});