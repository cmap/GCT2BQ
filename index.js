const readline = require('readline');
const fs = require('fs');
const BUILD_ID = "5d64449f3d20f00b47638ec6";
const FILE_NAME = "MCGA_F.txt";

const PCL_CELL = "pcl_cell";
const PCL_SUMMARY = "pcl_summary";
const PERT_ID_CELL = "pert_id_cell";
const PERT_ID_SUMMARY = "pert_id_summary";

var async = require("async");
const ARF_DIR = "./MCGA_F/arfs";

function processLineByLine(file, r_type,callback) {
    try {
        console.log(file + " " + fs.lstatSync(file).isFile());
        var index = 1;

        const fileStream = fs.createReadStream(file);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.
        var sig_id = null;
        rl.on('line', (line) => {
            // Each line in input.txt will be successively available here as `line`.
            console.log(`Line from file: ${line}`);
            if (index === 1 || index === 2) {
                console.log(`Line from file: ${line}`);
            }
            else if (index === 3) {
                var sig_id_line = line.split("\t");
                sig_id = sig_id_line[1].trim();
                console.log(`Line3 from file: ` + sig_id);
            }
            else {
                fs.appendFileSync(FILE_NAME, sig_id + "\t" + BUILD_ID + "\t" + r_type + "\t" + line.trim() + "\n", 'utf8');
            }
            ++index;
        }).on('close', () => {
            console.log('Have a great day!');
           // process.exit(0);
            return callback();
        });
    } catch (err) {
        console.error("Failed to finish reading file: ", file);
        console.error(err);
    }
}
// create a queue object with concurrency 5
var q = async.queue(function(task, callback) {
    processLineByLine(task.file,task.r_type,callback);
    //console.log("Calling back");
    //return callback();
}, 5);
// assign a callback
q.drain(function() {
    console.log('all items have been processed');
});
// or await the end
//await q.drain()

// assign an error callback
q.error(function(err, task) {
    console.error('task experienced an error');
});
var myQueue = [];
fs.readdirSync(ARF_DIR).forEach(function (file) {
    var currentDir = ARF_DIR + "/" + file;
    if (fs.lstatSync(currentDir).isDirectory()) {
        fs.readdirSync(currentDir).forEach(function (arf) {
            //myQueue.oush()
            if (arf === PCL_CELL + ".gct") {
                myQueue.push({file: currentDir + "/" + arf,r_type: PCL_CELL});
             }
            if (arf === PCL_SUMMARY + ".gct") {
                myQueue.push({file: currentDir + "/" + arf,r_type: PCL_SUMMARY});
            }
            if (arf === PERT_ID_CELL + ".gct") {
                myQueue.push({file: currentDir + "/" + arf,r_type: PERT_ID_CELL});
            }
            if (arf === PERT_ID_SUMMARY + ".gct") {
                myQueue.push({file: currentDir + "/" + arf,r_type:PERT_ID_SUMMARY});
            }
        });
    }
});
fs.appendFileSync(FILE_NAME, "sig_id\tbuild_id\tr_type\trow_id\tscore\n", 'utf8');
console.log(myQueue.length);
for(var i =0; i < myQueue.length; i++){
   q.push(myQueue[i]);
}








