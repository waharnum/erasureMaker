"use strict";

var fluid = require("infusion");
require("kettle");

var ca = fluid.registerNamespace("ca");

fluid.defaults("ca.alanharnum.erasuremaker.server.dataSource.file", {
    gradeNames: "kettle.dataSource.file",
    path: "./storage/erasures/%erasureId",
    termMap: {
        erasureId: "%directErasureId"
    },
    writable: true
});
