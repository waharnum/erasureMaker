"use strict";

var fluid = require("infusion");
require("kettle");

var ca = fluid.registerNamespace("ca");

fluid.defaults("ca.alanharnum.erasuremaker.server.dataSource.erasure", {
    gradeNames: "kettle.dataSource.file",
    path: "./storage/erasures/%erasureId",
    termMap: {
        erasureId: "%directErasureId"
    },
    writable: true
});

fluid.defaults("ca.alanharnum.erasuremaker.server.dataSource.index", {
    gradeNames: "kettle.dataSource.file",
    path: "./storage/indexes/%indexId",
    termMap: {
        indexId: "%directIndexId"
    },
    writable: false
});
