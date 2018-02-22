"use strict";

var fluid = require("infusion");
var fs = require("fs");
var indexingInterval = 300000;

var updateErasureIndex = function () {
    console.log("Updating index files");
    var storagePath = "./storage/erasures/";
    var indexesPath = "./storage/indexes/"

    var index = {};

    fs.readdir(indexesPath, function (err, files) {
        files.forEach(function (filename) {
            if(filename !== ".gitignore") {
                var filePath = indexesPath + filename;
                fs.unlink(filePath, function (error) {
                    if(error) {
                        console.log("Error deleting " + filePath, error);
                    } else {
                        console.log("Deleted index " + filePath);
                    }
                });
            };
        });
    });

    fs.readdir(storagePath, function(err, files) {
        files.forEach(function (filename) {
            if(filename !== ".gitignore") {
                var filePath = storagePath + filename;

                var data = fs.readFileSync(filePath, "utf8");
                var storedErasure = JSON.parse(data);
                var erasureDetails = {
                    sourceKey: storedErasure.sourceKey,
                    erasureKey: filename,
                    erasureTitle: storedErasure.title,
                    sourceURL: storedErasure.sourceURL,
                    sourceTextAuthor: storedErasure.sourceTextAuthor,
                    sourceTextTitle: storedErasure.sourceTextTitle
                };

                var indexAt = index[erasureDetails.sourceKey] ? index[erasureDetails.sourceKey] : index[erasureDetails.sourceKey] = {};

                indexAt[erasureDetails.erasureKey] = erasureDetails;

            }
        });

        fluid.each(index, function (content, key) {
            fs.writeFile(indexesPath + key, JSON.stringify(content), function (err) {
                if(err) {
                    console.log("Error updating index for " + key);
                } else {
                    console.log("Index file for " + key + " updated");
                }
            });
        });
    });
};

updateErasureIndex();
console.log("Indexing running every " + indexingInterval + " milliseconds");

setInterval(function () {
    console.log("Recurring index job running");
    updateErasureIndex();
}, indexingInterval);
