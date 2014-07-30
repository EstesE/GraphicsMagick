var gm = require('gm');
var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var src = process.argv[2];
var dst = process.argv[3];
var now = new Date();
var jsonDate = now.toJSON();

var processQueue = async.queue(function (task, callback) {
    var basename = path.basename(task.file.toLowerCase(), '.jpg');
    var dirname = path.dirname(task.file);
    var newfile = dirname.replace(src, dst) + '\\' + basename + task.suffix + '.jpg';

    fs.ensureDir(dirname.replace(src, dst), function (err) {
        if (!err) {
            gm(dirname + '\\' + basename + '.jpg')
                .resize(task.width)
                .write(newfile, function (err) {
                    if (err) {
                        console.log('Uh Oh: ' + err);
                        fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                        return console.dir(arguments);
                    }
                    console.log('-----------------------------------------------\n');
                    console.log("Created " + arguments[3]);
                    console.log('-----------------------------------------------\n\n');
                });
            callback(null);
        }
    })
}, 10);


var walk = function (root) {

    if (src && dst) {
        var files = fs.readdirSync(root);

        // Make directories
        for (var x in files) {
            var file = path.join(root, files[x]);
            var stat = fs.statSync(file);


            if (stat.isDirectory()) {
                // Create Directories
                fs.ensureDir(file.replace(src, dst), function (err) {
                    if (err) {
                        fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                    }
                });
                walk(file);
            } else {
                // Handle files
                var ext = path.extname(file);

                if (file.indexOf('gallery-photos') > -1 && ext.toLowerCase() === '.jpg') {
                    // ------ Gallery-Photos ------
                    processQueue.push({ file: file, width: 360, suffix: '_sm' }, function (err) {
                        if (err) {
                            fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                        }
                    });

                    processQueue.push({ file: file, width: 800, suffix: '' }, function (err) {
                        if (err) {
                            fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                        }
                    });
                } else if (file.indexOf('index-photos') > -1 && ext.toLowerCase() === '.jpg') {
                    // ------ Index-Photos ------
                    processQueue.push({ file: file, width: 760, suffix: '_md' }, function (err) {
                        if (err) {
                            fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                        }
                    });

                    processQueue.push({ file: file, width: 2048, suffix: '' }, function (err) {
                        if (err) {
                            fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                        }
                    });
                } else if (file.indexOf('index-photos') == -1 && file.indexOf('gallery-photos') == -1 && file.indexOf('floorplans') == -1 && file.indexOf('forms') == -1 && ext.toLowerCase() === '.jpg') {
                    // ------ Other (jpg) images ------
                    processQueue.push({ file: file, width: 800, suffix: '_sm' }, function (err) {
                        if (err) {
                            fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                        }
                    });

                    processQueue.push({ file: file, width: 2048, suffix: '' }, function (err) {
                        if (err) {
                            fs.appendFileSync('error.log', jsonDate + '\t\t' + err);
                        }
                    });
                } else {
                    var ext = path.extname(file);
                    // Just copy over the other files...
                    if (ext == '.pdf' || ext == '.jpg' || ext == '.png')
                        fs.copy(file, file.replace(src, dst), function (err) {
                            if (err) {
                                fs.appendFileSync('error.log', err);
                            }
                        })
                }
            }
        }
    } else {
        console.log('\nIncorrect number of parameters. Please provide a source and destination.\n\tExample: node GraphicsMagick.js sourceImages destinationImages')
    }
}

walk(src);