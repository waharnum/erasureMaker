fluid.defaults("ca.alanharnum.erasureMaker.markupAppendingComponent", {
        listeners: {
            "onCreate.appendMarkup": {
                "this": "{that}.container",
                "method": "append",
                "args": "{that}.options.strings.markup"
            },
            "onCreate.fireOnMarkupAppended": {
                "func": "{that}.events.onMarkupAppended.fire",
                "priority": "after:appendMarkup"
            }
        },
        events: {
            "onMarkupAppended": null
        }
    }
);

fluid.defaults("ca.alanharnum.erasureMaker", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        currentMode: "click"
    },
    components: {
        erasureText: {
            type: "ca.alanharnum.erasureMaker.text",
            container: ".erasureMaker-text",
            createOnEvent: "onMarkupAppended",
            options: {
                availableTexts: "{availableErasureTexts}.options.texts",
                model: {
                    currentMode: "{erasureMaker}.model.currentMode"
                }
            }
        },
        erasureControls: {
            type: "ca.alanharnum.erasureMaker.controls",
            container: ".erasureMaker-controls",
            createOnEvent: "onMarkupAppended",
            options: {
                model: {
                    currentMode: "{erasureMaker}.model.currentMode"
                }

            }
        },
        availableErasureTexts: {
            type: "ca.alanharnum.erasureMaker.availableErasureTexts"
        }
    },
    strings: {
        markup:
        `
        <div class="erasureMaker-controls"></div>
        <div class="erasureMaker-text"></div>
        `
    }
});

fluid.defaults("ca.alanharnum.erasureMaker.text", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        currentMode: "click"
    },
    selectors: {
        "text": ".text",
        "source": ".source",
        "paragraph": ".paragraph",
        "character": ".character"
    },
    availableTexts: {
        quickBrownFox: {
            source: "http://alanharnum.ca",
            text:
                `
                The quick brown fox

                jumped over

                the lazy dog

                `
        }
    },
    strings: {
        markup:
        `
        <div class="text"></div>
        <div class="source"></div>
        `
    },
    listeners: {
        "onMarkupAppended.addSourceText": {
            func: "ca.alanharnum.erasureMaker.text.addSourceText",
            args: ["{that}"]
        },
        "onMarkupAppended.addErasureByCharacterStructure": {
            func: "ca.alanharnum.erasureMaker.text.addErasureByCharacterStructure",
            args: ["{that}"],
            priority: "after:addSourceText"
        },
        "onMarkupAppended.addCharacterErasureEvents": {
            func: "ca.alanharnum.erasureMaker.text.addCharacterErasureEvents",
            args: ["{that}"],
            priority: "after:addErasureByCharacterStructure"
        }
    }
});

ca.alanharnum.erasureMaker.text.addSourceText = function (that) {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    var availableTexts = fluid.hashToArray(that.options.availableTexts, "key");

    var selectedText = availableTexts[getRandomInt(availableTexts.length)];

    var source = selectedText.source;

    var sourceMarkup = "<a href='" + source + "'>Source</a>";

    that.locate("source").append(sourceMarkup);

    var text = selectedText.text;

    var splitText = text.split("\n\n");

    splitText.forEach(function (para) {
        var paraMarkup = "<p class='paragraph'>" + para + "</p>";
        that.locate("text").append(paraMarkup);
    });

};

ca.alanharnum.erasureMaker.text.addErasureByCharacterStructure = function (that) {
        that.locate("paragraph").each(function (i,e) {
            var splitText = $(this).text().split("");

            var spannedText = [];

            splitText.forEach(function (currentValue) {
              var spanned = "<span class='character'>" + currentValue + "</span>";
              spannedText.push(spanned);
            });

            $(this).html(spannedText.join(""));
        });
};

ca.alanharnum.erasureMaker.text.addCharacterErasureEvents = function (that) {
    that.locate("character").each(function (i,e) {
        $(this).click(function () {
          if(that.model.currentMode === "click") {
            $(this).toggleClass("fade");
          }
        });
        $(this).mouseenter(function () {
          if(that.model.currentMode === "erase") {
            $(this).addClass("fade");
          }
          if(that.model.currentMode === "restore") {
            $(this).removeClass("fade");
          }
        });
    });
};

fluid.defaults("ca.alanharnum.erasureMaker.controls", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        currentMode: "click"
    },
    strings: {
        markup:
        `
        <form>
            <div class="mode-controls controls">
                <label class="mode-control-click current-control"><span class="keyboard-shortcut-indicator">[c]</span>lickmode
                    <input checked type="radio" name="mode-control-radio" value="click" />
                </label>
                <label class="mode-control-erase"><span class="keyboard-shortcut-indicator">[e]</span>rasemode
                    <input type="radio" name="mode-control-radio" value="erase" />
                </label>
                <label class="mode-control-restore"><span class="keyboard-shortcut-indicator">[r]</span>estoremode
                    <input type="radio" name="mode-control-radio" value="restore" />
                </label>
            </div>
            <div class="function-controls controls">
                <span class="function-control-erase-all">eraseall</span>
                <span class="function-control-restore-all">restoreall</span>
                <span class="function-control-remove">removeerased</span>
                <span class="function-control-restore">restoreerased</span>
                <span class="function-control-finalize">finalize</span>
            </div>
        </form>
        `
    },
    listeners: {
        "onMarkupAppended.addKeyboardShortcuts": {
            func: "ca.alanharnum.erasureMaker.controls.addKeyboardShortcuts",
            args: ["{that}"]
        },
        "onMarkupAppended.addModeControls": {
            func: "ca.alanharnum.erasureMaker.controls.addModeControls",
            args: ["{that}"]
        },
        "onMarkupAppended.addFunctionControls": {
            func: "ca.alanharnum.erasureMaker.controls.addFunctionControls",
            args: ["{that}"]
        }
    },
    selectors: {
        "mode-control-click": ".mode-control-click",
        "mode-control-erase": ".mode-control-erase",
        "mode-control-restore": ".mode-control-restore"
    }
});

ca.alanharnum.erasureMaker.controls.addKeyboardShortcuts = function (that) {
    $(document).keyup(function (e) {
        if(e.key === "c") {
            that.locate("mode-control-click").click();
        }
        if(e.key === "e") {
            that.locate("mode-control-erase").click();
        }
        if(e.key === "r") {
            that.locate("mode-control-restore").click();
        }
    });
};

ca.alanharnum.erasureMaker.controls.addModeControls = function (that) {
    that.locate("mode-control-click").click(function () {
        that.applier.change("currentMode", "click");
        $(this).addClass("current-control");
          that.locate("mode-control-erase").removeClass("current-control");
          that.locate("mode-control-restore").removeClass("current-control");
    });

    that.locate("mode-control-erase").click(function () {
        that.applier.change("currentMode", "erase");
        $(this).addClass("current-control");
        that.locate("mode-control-click").removeClass("current-control");
        that.locate("mode-control-restore").removeClass("current-control");
    });

    that.locate("mode-control-restore").click(function () {
        that.applier.change("currentMode", "restore");
        $(this).addClass("current-control");
        that.locate("mode-control-click").removeClass("current-control");
        that.locate("mode-control-erase").removeClass("current-control");
    });
};

ca.alanharnum.erasureMaker.controls.addFunctionControls = function (that) {
        $(".function-control-remove").click(function () {
            $(".fade").each(function() {
              $(this).addClass("removed");
          });
        });

        $(".function-control-restore").click(function () {
            $(".character").each(function() {
              $(this).removeClass("removed");
          });
        });

        $(".function-control-erase-all").click(function () {
            $(".character").each(function() {
              $(this).addClass("fade");
          });
        });

        $(".function-control-restore-all").click(function () {
            $(".character").each(function() {
              $(this).removeClass("fade");
          });
        });

        $(".function-control-finalize").click(function () {
        $(".fade").each(function() {
          $(this).html("<span class='spacer'></span>");
            });
        });
};

$(document).ready(function () {
    ca.alanharnum.erasureMaker(".ahc-erasureMaker", {});
});
