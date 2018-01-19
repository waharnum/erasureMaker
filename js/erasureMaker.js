fluid.defaults("ca.alanharnum.markupAppendingComponent", {
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
    gradeNames: ["ca.alanharnum.markupAppendingComponent", "fluid.viewComponent"],
    components: {
        erasureText: {
            type: "ca.alanharnum.erasureMaker.text",
            container: ".erasureMaker-text",
            createOnEvent: "onMarkupAppended"
        },
        erasureControls: {
            type: "ca.alanharnum.erasureMaker.controls",
            container: ".erasureMaker-controls",
            createOnEvent: "onMarkupAppended"
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
    gradeNames: ["ca.alanharnum.markupAppendingComponent", "fluid.viewComponent"],
    selectors: {
        "text": ".text",
        "source": ".source"
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
        }
    }
});

ca.alanharnum.erasureMaker.text.addSourceText = function (that) {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    var selectedText = texts[getRandomInt(texts.length)];

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

fluid.defaults("ca.alanharnum.erasureMaker.controls", {
    gradeNames: ["ca.alanharnum.markupAppendingComponent", "fluid.viewComponent"],
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
    }
});

var MODE_CLICK = "MODE_CLICK";
var MODE_ERASE = "MODE_ERASE";
var MODE_RESTORE = "MODE_RESTORE";

var currentMode = MODE_CLICK;

$(document).ready(function () {

    ca.alanharnum.erasureMaker(".ahc-erasureMaker", {});

    $(".mode-control-click").click(function () {
    currentMode = MODE_CLICK;
    $(this).addClass("current-control");
      $(".mode-control-erase").removeClass("current-control")
        $(".mode-control-restore").removeClass("current-control");
    });

    $(".mode-control-erase").click(function () {
      currentMode = MODE_ERASE;
      $(this).addClass("current-control");
      $(".mode-control-click").removeClass("current-control");
    $(".mode-control-restore").removeClass("current-control");
    });

    $(".mode-control-restore").click(function () {
      currentMode = MODE_RESTORE;
      $(this).addClass("current-control");
      $(".mode-control-click").removeClass("current-control");
    $(".mode-control-erase").removeClass("current-control");
    });

    $(document).keyup(function (e) {
    if(e.key === "c") {
      $(".mode-control-click").click();
    }
    if(e.key === "e") {
      $(".mode-control-erase").click();
    }
    if(e.key === "r") {
      $(".mode-control-restore").click();
    }
    });

    $(".function-control-remove").click(function () {
    $(".fade").each(function() {
      $(this).addClass("removed");
    })
    });

    $(".function-control-restore").click(function () {
    $(".character").each(function() {
      $(this).removeClass("removed");
    })
    });

    $(".function-control-erase-all").click(function () {
    $(".character").each(function() {
      $(this).addClass("fade");
    })
    });

    $(".function-control-restore-all").click(function () {
    $(".character").each(function() {
      $(this).removeClass("fade");
    })
    });

    $(".function-control-finalize").click(function () {
    $(".fade").each(function() {
      $(this).html("<span class='spacer'></span>");
    })
    });

    $(".paragraph").each(function (i,e) {
    var splitText = $(this).text().split("");

    var spannedText = [];

    splitText.forEach(function (currentValue) {
      var spanned = "<span class='character'>" + currentValue + "</span>";
      spannedText.push(spanned);
    });

    $(this).html(spannedText.join(""));
    });

    $(".character").each(function (i,e) {
    $(this).click(function () {
      if(currentMode === MODE_CLICK) {
        $(this).toggleClass("fade");
      }
    });
    $(this).mouseenter(function () {
      if(currentMode === MODE_ERASE) {
        $(this).addClass("fade");
      }
      if(currentMode === MODE_RESTORE) {
        $(this).removeClass("fade");
      }
    });
    });
});
