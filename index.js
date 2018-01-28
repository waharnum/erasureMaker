"use strict";

var fluid = require("infusion");
require("kettle");

var ca = fluid.registerNamespace("ca");

require("./server/serverSetup.js");
require("./server/handlers.js");
require("./server/dataSources.js");
require("./server/index.js");

var server = ca.alanharnum.erasuremaker.server();
