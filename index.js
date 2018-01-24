"use strict";

var fluid = require("infusion");
require("kettle");

var ca = fluid.registerNamespace("ca");

require("./server/serverSetup.js");
require("./server/handlers.js");

var server = ca.alanharnum.erasuremaker.server();
