
// we create a new CPU
var cpu = new vCPU(8);
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