
// we create a new 8-bit CPU with 16 address lines
var cpu = new vCPU(8, 16);
cpu.addRegister(8); // Register A [0]
cpu.addRegister(8); // Register B [1]
cpu.addRegister(8); // Register C [2]
cpu.addRegister(8); // Register D [3]
cpu.addRegister(8); // Register E [4]
cpu.addRegister(8); // Register F [5]
cpu.addRegister(8); // Register H [6]
cpu.addRegister(8); // Register L [7]

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
    if(dataC < 0xFF) {
        dataC++;
    } else {
        dataC = 0x00;
        if(dataB < 0xFF) {
            dataB++;
        }
    }
    Opcode.Registers[1].data = Number('0x'+Opcode.ToHex(dataB));
    Opcode.Registers[2].data = Number('0x'+Opcode.ToHex(dataC));
});

// Increment B
cpu.setOpcode(0x04, function (Opcode) {
    var dataB = Opcode.Registers[1].data;
    if(dataB < 0xFF) {
        dataB++
    }
    Opcode.Registers[1].data = Number('0x'+Opcode.ToHex(dataB));
});

// Decrease B
cpu.setOpcode(0x05, function (Opcode) {
    var dataB = Opcode.Registers[1].data;
    if(dataB > 0x00) {
        dataB--
    }
    Opcode.Registers[1].data = Number('0x'+Opcode.ToHex(dataB));
});

// Load B,d8
cpu.setOpcode(0x06, function (Opcode) {
    Opcode.SetComebackFunction(function (Comeback0) {
        Comeback0.Registers[1].data = Comeback0.Data;
    });
});

// Rotate Left Circular Accumulator
cpu.setOpcode(0x07, function (Opcode) {
    var accumulator = Opcode.Registers[0].data;
    var carry = (accumulator & 0x80) >> 7; // Get the most significant bit as carry
    accumulator = ((accumulator << 1) | carry) & 0xFF; // Rotate left and preserve 8 bits
    Opcode.Registers[0].data = accumulator; // Update the accumulator register
    Opcode.Flags().Carry = carry; // Update the carry flag
});

cpu.setOpcode(0x07, function (Opcode) {});