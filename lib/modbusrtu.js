/**
 *
 * Created User: ventrius
 * On Date: 5/28/13
 * At Time: 1:18 PM
 *
 * Please write a descripton here of what you're writing!
 */

// Import Dependecies
var Put = require('put')
    , buffer = require('buffer')
    , bufferlist = require('buffers') /* Note the difference */
    , Binary = require('binary')
    , crc = require('crc')
    , assert = require('assert');
	

/**
 * Main ModbusTcpClient object which is initialized by consumer and exposes all the functions.
 * **/
var ModbusRTU = function () {
    var self = this;
			
	// formation function
	this.formRequestBuffer=function (slave, fc, register, value){
		assert(typeof slave === 'number')
		assert(typeof fc === 'number')
		assert(typeof register === 'number')
		if(typeof value !== 'undefined') assert(typeof value === 'number')

		if(fc === 3 || fc === 4){
			// Just read a register
			var putMessage = Put()
				.word8(slave)
				.word8(fc)
				.word16be(register)
				.word16be(1)
				.buffer()
		}

		else if(fc === 6){
			// Write to a register
			var putMessage = Put()
				.word8(slave)
				.word8(fc)
				.word16be(register)
				.word16be(value)
				.buffer()
		}

		var finalMessage = bufferlist()

		finalMessage.push(putMessage)
		finalMessage.push(Put().word16le(crc.crcModbusHex(putMessage)).buffer())
		return finalMessage.slice();
	};


	// Parser Function
	this.parserFunction = function(){
		var b = bufferlist();
		var bufferLim = 7;
		var response = {};

		return function(emitter, buffer){
			b.push(buffer)
			if(b.length > 7){
			   // console.log(b)
				response = Binary.parse(b)
					.word8('address')
					.word8('function')
					.word8('byteCount')
					.word16bs('value')
					.word16bu('crc')
					.vars

				if(response.function === 6){
					response = Binary.parse(b)
						.word8('address')
						.word8('function')
						.word16bu('regAddress')
						.word16bs('value')
						.word16bu('crc')
						.vars
					b.splice(0,8)
					emitter.emit('6', response)
					return
				}
				emitter.emit('3', response)
				b.splice(0,7)
				return
			}
		}
	};


};	



////// Necesarry Functions
ModbusRTU.prototype.getProductInfo = function(slaveAddr,address) {
    return this.formRequestBuffer(slaveAddr,3,address,32);
};


//////export module
module.exports = ModbusRTU;
