fluid.defaults("ca.alanharnum.erasureMaker", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        currentMode: "click",
        eraseStyle: "faded"
    },
    events: {
        "onTextsReady": null
    },
    components: {
        erasureText: {
            type: "ca.alanharnum.erasureMaker.text",
            container: ".erasureMaker-text",
            createOnEvent: "onTextsReady",
            options: {
                availableTexts: "{availableErasureTexts}.options.texts",
                model: {
                    currentMode: "{erasureMaker}.model.currentMode",
                    eraseStyle: "{erasureMaker}.model.eraseStyle"
                },
                modelListeners: {
                    eraseStyle: {
                        funcName: "ca.alanharnum.erasureMaker.text.changeEraseStyle",
                        args: ["{that}", "{that}.model.eraseStyle"]
                    }
                },
            }
        },
        erasureControls: {
            type: "ca.alanharnum.erasureMaker.controls",
            container: ".erasureMaker-controls",
            createOnEvent: "onTextsReady",
            options: {
                model: {
                    currentMode: "{erasureMaker}.model.currentMode",
                    eraseStyle: "{erasureMaker}.model.eraseStyle"
                },
                listeners: {
                    "onMarkupAppended.addTextFunctionControls": {
                        func: "ca.alanharnum.erasureMaker.addTextFunctionControls",
                        args: ["{that}", "{erasureText}"]
                    }
                }

            }
        },
        availableErasureTexts: {
            type: "ca.alanharnum.erasureMaker.availableErasureTexts",
            createOnEvent: "onMarkupAppended",
            options: {
                listeners: {
                    "onCreate.escalate": {
                        func: "{erasureMaker}.events.onTextsReady.fire"
                    }
                }
            }
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

ca.alanharnum.erasureMaker.addTextFunctionControls = function (erasureControlsComponent, erasureTextComponent) {

        erasureControlsComponent.locate("function-control-erase-all").click(function () {
            erasureTextComponent.locate("character").each(function() {
              $(this).addClass("fd");
          });
        });

        erasureControlsComponent.locate("function-control-restore-all").click(function () {
            erasureTextComponent.locate("character").each(function() {
              $(this).removeClass("fd");
          });
        });

        erasureControlsComponent.locate("function-control-remove").click(function () {
            erasureTextComponent.locate("fade").each(function() {
              $(this).addClass("rm");
          });
        });

        erasureControlsComponent.locate("function-control-restore").click(function () {
            erasureTextComponent.locate("character").each(function() {
              $(this).removeClass("rm");
          });
        });

        erasureControlsComponent.locate("function-control-save").click(function () {
            console.log("this should save the erasure");
            var erasureText = erasureTextComponent.locate("text").html();

            var erasureTitle = prompt("Enter your erasure's title", "Untitled");
            var erasureData = {
                                title: erasureTitle,
                                text: erasureText,
                                sourceKey: erasureTextComponent.sourceText.key,
                                sourceURL: erasureTextComponent.sourceText.sourceURL,
                                sourceTextAuthor: erasureTextComponent.sourceText.author,
                                sourceTextTitle: erasureTextComponent.sourceText.title,
                            };

            $.post("http://localhost:8081/erasure/NEW", erasureData, function ( data ) {
                console.log("it worked!", data);
            });
        });


        erasureControlsComponent.locate("function-control-get").click(function () {
            console.log("this should load an existing erasure");
             var erasureId = prompt("Enter the erasure ID", "Untitled");
             var url = "http://localhost:8081/erasure/" + erasureId;
             console.log(url);
             $.get("http://localhost:8081/erasure/" + erasureId, function ( data ) {
                 console.log("it worked!", data);
                 var erasure = JSON.parse(data);
                 erasureTextComponent.locate("text").html(erasure.text);
                 var erasureTitle = erasure.title;
                 var sourceMarkup = `Original text from <em>${erasure.sourceTextTitle}</em> by ${erasure.sourceTextAuthor} (<a href='${erasure.sourceURL}'>source</a>)`;
                 erasureTextComponent.locate("source").html(sourceMarkup);
                 erasureTextComponent.locate("erasureTitle").html(`<h2>${erasureTitle}</h2>`);
            });
        });

};

fluid.defaults("ca.alanharnum.erasureMaker.text", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        currentMode: "click",
        eraseStyle: "faded"
    },
    selectors: {
        "text": ".text",
        "source": ".source",
        "paragraph": ".paragraph",
        "character": ".char",
        "fade": ".fd",
        "erasureTitle": ".erasureTitle"
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
        <div class="erasureTitle"></div>
        <p class="text eraseStyle-faded"></p>
        <p class="source"></p>
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

ca.alanharnum.erasureMaker.text.changeEraseStyle = function (erasureTextComponent, eraseStyle) {
    console.log("ca.alanharnum.erasureMaker.text.changeEraseStyle");
    var text = erasureTextComponent.locate("text");
    var eraseStyleClass = "eraseStyle-" + eraseStyle;
    text.toggleClass();
    text.addClass("text " + eraseStyleClass);
};

ca.alanharnum.erasureMaker.text.addSourceText = function (that) {
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    var availableTexts = fluid.hashToArray(that.options.availableTexts, "key");

    var selectedText = availableTexts[getRandomInt(availableTexts.length)];

    var sourceURL = selectedText.sourceURL;
    var title = selectedText.title;
    var author = selectedText.author;
    var key = selectedText.key;

    that.sourceText = {
        sourceURL: sourceURL,
        title: title,
        author: author,
        key: key
    };

    var sourceMarkup = `Original text from <em>${title}</em> by ${author} (<a href='${sourceURL}'>source</a>)`;

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
              var spanned = "<span class='char'>" + currentValue + "</span>";
              spannedText.push(spanned);
            });

            $(this).html(spannedText.join(""));
        });
};

ca.alanharnum.erasureMaker.text.addCharacterErasureEvents = function (that) {
    that.locate("character").each(function (i,e) {
        $(this).click(function () {
          if(that.model.currentMode === "click") {
            $(this).toggleClass("fd");
          }
        });
        $(this).mouseenter(function () {
          if(that.model.currentMode === "erase") {
            $(this).addClass("fd");
          }
          if(that.model.currentMode === "restore") {
            $(this).removeClass("fd");
          }
        });
    });
};

fluid.defaults("ca.alanharnum.erasureMaker.controls", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        currentMode: "click",
        eraseStyle: "faded"
    },
    strings: {
        markup:
        `
        <form>
            <h2 class="control-header">Cursor Mode</div>
            <div class="mode-controls controls">
                    <label class="mode-control mode-control-click current-control">
                        <input class="fl-hidden-accessible mode-control-click-radio" checked type="radio" name="mode-control-radio" value="click" />
                        <span class="keyboard-shortcut-indicator">c</span>lick to toggle characters
                    </label>
                    <label class="mode-control mode-control-erase">
                        <input class="fl-hidden-accessible mode-control-click-radio" type="radio" name="mode-control-radio" value="erase" />
                        <span class="keyboard-shortcut-indicator">e</span>rase characters
                    </label>
                    <label class="mode-control mode-control-restore">
                        <input class="fl-hidden-accessible mode-control-click-radio" type="radio" name="mode-control-radio" value="restore" />
                        <span class="keyboard-shortcut-indicator">r</span>estore characters
                    </label>
            </div>
            <h2 class="control-header">Functions</div>
            <div class="function-controls controls">
                <button type="button" class="function-control-erase-all">erase all</button>
                <button type="button" class="function-control-restore-all">restore all</button>
                <button type="button" class="function-control-remove">remove erased</button>
                <button type="button" class="function-control-restore">restore erased</button>
                <button type="button" class="function-control-save">save</button>
                <button type="button" class="function-control-get">get</button>
            </div>
            <label for="select-erase-style">
                <h2 class="control-header">Erase Style
                <select class="erase-style-selector" id="select-erase-style">
                    <option value="faded">Faded</option>
                    <option value="strike-through">Strike Through</option>
                    <option value="blacked-out">Blacked Out</option>
                    <option value="removed">Removed</option>
                </select>
                </h2>
            </label>
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
        "onMarkupAppended.addEraseStyleControl": {
            func: "ca.alanharnum.erasureMaker.controls.addEraseStyleControl",
            args: ["{that}"]
        }
    },
    selectors: {
        "mode-control-click": ".mode-control-click",
        "mode-control-erase": ".mode-control-erase",
        "mode-control-restore": ".mode-control-restore",
        "function-control-erase-all": ".function-control-erase-all",
        "function-control-restore-all": ".function-control-restore-all",
        "function-control-remove": ".function-control-remove",
        "function-control-restore": ".function-control-restore",
        "function-control-save": ".function-control-save",
        "function-control-get": ".function-control-get",
        "erase-style-selector": ".erase-style-selector"
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

ca.alanharnum.erasureMaker.controls.addEraseStyleControl = function (that) {
    var eraseStyleSelector = that.locate("erase-style-selector").change(function () {
        var val = $(this).val();
        that.applier.change("eraseStyle", val);
    });

};
