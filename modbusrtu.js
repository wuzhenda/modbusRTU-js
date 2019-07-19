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
			
// formation function
function formRequestBuffer(deviceAddr,fc,regAddr,regCnt,value){
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
function parserFunction(){
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


////// Necesarry Functions

//////export module
module.exports.request = function(deviceAddr,fc,regAddr,regCnt) {
    return formRequestBuffer(deviceAddr,fc,regAddr,regCnt);
};

module.exports.getProductInfo = function() {
    return formRequestBuffer(1,3,0,32);
};

module.exports.getRTCDatetime = function() {
    return formRequestBuffer(1,3,32,5);
};

module.exports.getStorageStatus = function() {
    return formRequestBuffer(1,3,37,2);
};

module.exports.getSensorStatus = function() {
    return formRequestBuffer(1,3,39,12);
};

module.exports.getConfiguration = function() {
    return formRequestBuffer(1,3,100,2);
};

module.exports.getSensorData = function() {
    return formRequestBuffer(1,3,1000,80);
};

module.exports.getSensorKPIData = function() {
    return this.formRequestBuffer(1,3,2000,112);
};

module.exports.getSensorKPIData2 = function() {
    return this.formRequestBuffer(1,3,2112,58);
};

