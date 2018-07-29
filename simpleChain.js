/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
    constructor(data) {
        this.hash = "",
            this.height = 0,
            this.body = data,
            this.time = 0,
            this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {
        this.chain = db;
        let i = 0;
        let self = this;
        this.chain.createReadStream().on('data', function (data) {
            i++;
            // console.log("index:" + i + ",data:" + data);
        }).on('error', function (err) {
            console.log('Unable to read data stream!', err)
            process.exit(-1);
        }).on('close', function () {
            if (i == 0) {// this is the genesis block!
                self.addBlock(new Block("First block in the chain - Genesis block"));
            }
        });

    }

    // Add new block
    addBlock(newBlock) {

        let i = 0;
        let self = this;
        this.chain.createReadStream().on('data', function (data) {
            i++;
            // console.log("index:" + i + ",data:" + data);
        }).on('error', function (err) {
            console.log('Unable to read data stream!', err)
            process.exit(-1);
        }).on('close', function () { // find the last block
            // Block height
            newBlock.height = i;
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            // previous block hash
            if (i > 0) { // has previous block
                db.get(i - 1, function (err, value) {
                    if (err) {
                        return console.log('previous block Not found!', err);
                    }
                    newBlock.previousBlockHash = JSON.parse(value).hash;

                    // Block hash with SHA256 using newBlock and converting to a string
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                    // Adding block object to chain
                    self.chain.put(i, JSON.stringify(newBlock), function (err) {
                        if (err) return console.log('Block ' + i + ' submission failed', err);
                        console.log("key:" + i + ",value:" + JSON.stringify(newBlock) + " added");
                    });
                });
            } else { // genesis block
                newBlock.previousBlockHash = "";

                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                self.chain.put(i, JSON.stringify(newBlock), function (err) {
                    if (err) return console.log('Block ' + i + ' submission failed', err);
                    console.log("key:" + i + ",value:" + JSON.stringify(newBlock) + " added");
                });
            }
        });
    }

    dumpChain() {
        console.log("dump---------------")
        this.chain.createReadStream().on('data', function (data) {
            console.log("key:" + data.key + ",data:" + JSON.stringify(data.value));
        }).on('error', function (err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function () {
            console.log("dump-----------end")
        });
    }

// validate block
    validateBlockHash(block) {
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            return true;
        } else {
            console.log('Block #' + block.height + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }

// Validate blockchain
    validateChain() {
        let errorLog = [];

        let self = this;
        this.chain.createReadStream().on('data', function (data) {
            let block = JSON.parse(data.value);

            // validate hash
            if (!self.validateBlockHash(block)) errorLog.push(block.height);

            // validate previous hash
            if (block.height > 0) {
                db.get(block.height - 1, function (err, value) {
                    if (err) {
                        return console.log('previous block Not found!', err);
                    }

                    if (block.previousBlockHash != JSON.parse(value).hash) {
                        errorLog.push(block.height);
                    }
                });
            }
        }).on('error', function (err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function () {
            if (errorLog.length > 0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: ' + errorLog);
            } else {
                console.log('No errors detected');
            }
        });
    }
}


let bc = new Blockchain();


// testBuildBlock();
testValidation();

function testBuildBlock() {
    (function theLoop(i) {
        setTimeout(function () {
            bc.addBlock(new Block("test block"));
            bc.dumpChain();
            bc.validateChain();
            if (--i) theLoop(i);
        }, 500);
    })(10);
}


function testValidation() {
    let inducedErrorBlocks = [2, 4, 7];

    for (var i = 0; i < inducedErrorBlocks.length; i++) {
        let k = inducedErrorBlocks[i];

        bc.chain.get(k, function (err, value) {
            if (err) {
                return console.log('previous block Not found!', err);
            }

            let block = JSON.parse(value);

            block.body = 'induced chain error';
            let v = JSON.stringify(block);
            bc.chain.put(k, v, function (err) {
                if (err) return console.log('Block ' + k + ' submission failed', err);
                console.log("key:" + k + ",value:" + v + " added");
            })

        });
    }

    bc.validateChain();
}