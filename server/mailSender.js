"use strict";

var fluid = require("infusion");
require("kettle");

var ca = fluid.registerNamespace("ca");

fluid.defaults("ca.alanharnum.erasureMaker.mailSender", {
    gradeNames: "fluid.component",
    invokers: {
        "send": {
            funcName: "fluid.notImplemented"
        }
    }
});

fluid.defaults("ca.alanharnum.erasureMaker.mailSender.mailGun", {
    gradeNames: "fluid.component",
    invokers: {
        "send": {
            funcName: "ca.alanharnum.erasureMaker.mailSender.mailGun.send",
            args: ["{that}.options.sendCredentials", "{arguments}.0"]
        }
    },
    sendCredentials: {
        "apiKey": null,
        "domain": null
    }
});

ca.alanharnum.erasureMaker.mailSender.mailGun.send = function (sendCredentials, mailData) {
    var api_key = sendCredentials.apiKey;
    var domain = sendCredentials.domain;
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

    mailgun.messages().send(mailData, function (error, body) {
      console.log(body);
    });
};
