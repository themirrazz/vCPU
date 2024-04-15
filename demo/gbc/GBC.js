
// we create a new CPU
var cpu = new vCPU(8);
cpu.addRegister(8); // Register A
cpu.addRegister(8); // Register B
cpu.addRegister(8); // Register C
cpu.addRegister(8); // Register D
cpu.addRegister(8); // Register E
cpu.addRegister(8); // Register F
cpu.addRegister(8); // Register G
cpu.addRegister(8); // Register H

// Load BC,d16
cpu.setOpcode(0x01, function (opcode) {});