/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {

    db.put(key, value, function (err) {
        if (err) return console.log('Block ' + key + ' submission failed', err);
        console.log("key:" + key + ",value:" + value + " added");
    })
}

// Get data from levelDB with key
function getLevelDBData(key) {
    let v = undefined;
    db.get(key, function (err, value) {
        if (err) {
            return console.log('Not found!', err);
        }
        console.log("key:" + key + ', Value = ' + value);
        v = value;
    });
    return v;
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
    let i = 0;
    db.createReadStream().on('data', function (data) {
        i++;
    }).on('error', function (err) {
        return console.log('Unable to read data stream!', err)
    }).on('close', function () {
        console.log('Block #' + i);
        addLevelDBData(i, value);
    });
}

function getCount() {
    for (let i = 0; ; i++) {
        let v = getLevelDBData(i);
        if (v == undefined) {
            return i;
        }
    }

    return undefined;
}


function dump() {
    let i = 0;
    console.log("dump---------------")
    db.createReadStream().on('data', function (data) {
        i++;
        console.log("index:" + i + ",data:" + data);
    }).on('error', function (err) {
        return console.log('Unable to read data stream!', err)
    }).on('close', function () {
        console.log("dump-----------end")
    });
    return i;
}


/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(1);

// setTimeout(function () {
//   getCount();
// }, 1000);

exports.put = addLevelDBData
exports.get = getLevelDBData
exports.length = getCount
exports.dump = dump