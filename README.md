# ModbusRTU - js (alpha)
Javascript implementation for the Modbus protocol!
Draws heavely from too-tall-nate's modbus stack and minimalmodbus from python!

Allows for the mapping of individual device registers!


## RTU Modbud Frame Format
A request using RTU is at least 4 bytes long.

_Frame_
[Slave Address] + [Function Code] + [Data] + [CRC]

2019-7-16 update
make it useable for frontend,and what we need is only frame package

refs:
http://www.bradoncode.com/tutorials/browserify-tutorial-node-js/
https://github.com/dcvice1967/jsModbus



