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
	this.formRequestBuffer=function(deviceAddr,fc,regAddr,regCnt,value){
		assert(typeof deviceAddr === 'number')
		assert(typeof fc === 'number')
		assert(typeof regAddr === 'number')
		assert(typeof regCnt === 'number')
		if(typeof value !== 'undefined') assert(typeof value === 'number')

		if(fc === 3 || fc === 4){
			// Just read multi-registers
			var putMessage = Put()
				.word8(deviceAddr)
				.word8(fc)
				.word16be(regAddr)
				.word16be(regCnt)
				.buffer()
		}else if(fc === 6){
			// Write to multi-registers
			var putMessage = Put()
				.word8(deviceAddr)
				.word8(fc)
				.word16be(regAddr)
				.word16be(value)
				.buffer()
		}else if(fc === 16){
			// Write to multi-registers
			var putMessage = Put()
				.word8(deviceAddr)
				.word8(fc)
				.word16be(regAddr)
				.word16be(regCnt)
				.word8(regCnt*2)
				.word16be(value)//TODO:xx
				.buffer()
		}

		var finalMessage = bufferlist()

		finalMessage.push(putMessage)
		finalMessage.push(Put().word16le(crc.crc16modbus(putMessage)).buffer())
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
}

////// Necesarry Functions
ModbusRTU.prototype.getProductInfo = function() {
    return this.formRequestBuffer(1,3,0,32);
};

ModbusRTU.prototype.getRTCDatetime = function() {
    return this.formRequestBuffer(1,3,32,5);
};

ModbusRTU.prototype.getStorageStatus = function() {
    return this.formRequestBuffer(1,3,37,2);
};

ModbusRTU.prototype.getSensorStatus = function() {
    return this.formRequestBuffer(1,3,39,16);
};

ModbusRTU.prototype.getConfiguration = function() {
    return this.formRequestBuffer(1,3,100,2);
};

ModbusRTU.prototype.getEscalatorData = function() {
    return this.formRequestBuffer(1,3,200,16);
};

ModbusRTU.prototype.getSensorData = function() {
    return this.formRequestBuffer(1,3,1000,104);
};

//vibration6~ 7.5
ModbusRTU.prototype.getSensorKPIData = function() {
    return this.formRequestBuffer(1,3,2000,122);
};

//vibration7.5~ end
ModbusRTU.prototype.getSensorKPIData2 = function() {
    return this.formRequestBuffer(1,3,2122,120);
};


//////export module
module.exports= ModbusRTU;