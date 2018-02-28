fluid.defaults("ca.alanharnum.erasureMakerView", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        eraseStyle: "faded"
        // displayedErasure: null
    },
    modelListeners: {
        displayedErasure: {
            func: "ca.alanharnum.erasureMaker.loadErasure",
            args: ["{erasureText}", "{that}.model.displayedErasure"]
        }
    },
    events: {
        "onTextsReady": null
    },
    components: {
        erasureText: {
            type: "ca.alanharnum.erasureMaker.text.view",
            container: ".erasureMaker-text",
            createOnEvent: "onTextsReady",
            options: {
                availableTexts: "{availableErasureTexts}.options.texts",
                model: {
                    currentMode: "{erasureMakerView}.model.currentMode",
                    eraseStyle: "{erasureMakerView}.model.eraseStyle"
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
            type: "ca.alanharnum.erasureMaker.controls.view",
            container: ".erasureMaker-controls",
            createOnEvent: "onTextsReady",
            options: {
                model: {
                    eraseStyle: "{erasureMakerView}.model.eraseStyle"
                }
            }
        },
        availableErasureTexts: {
            type: "ca.alanharnum.erasureMaker.availableErasureTexts",
            createOnEvent: "onMarkupAppended",
            options: {
                listeners: {
                    "onCreate.escalate": {
                        func: "{erasureMakerView}.events.onTextsReady.fire"
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

fluid.defaults("ca.alanharnum.erasureMakerEdit", {
    gradeNames: ["ca.alanharnum.erasureMakerView"],
    model: {
        currentMode: "click"
    },
    components: {
        erasureText: {
            type: "ca.alanharnum.erasureMaker.text.edit"
        },
        erasureControls: {
            type: "ca.alanharnum.erasureMaker.controls.edit",
            options: {
                model: {
                    currentMode: "{erasureMakerView}.model.currentMode",
                },
                listeners: {
                    "onMarkupAppended.addTextFunctionControls": {
                        func: "ca.alanharnum.erasureMaker.addTextFunctionControls",
                        args: ["{that}", "{erasureText}"]
                    }
                }
            }
        }
    }
});

ca.alanharnum.erasureMaker.addTextFunctionControls = function (erasureControlsComponent, erasureTextComponent) {

        erasureControlsComponent.locate("function-control-erase-all").click(function () {
            erasureTextComponent.locate("character").each(function() {
              $(this).addClass("er");
          });
        });

        erasureControlsComponent.locate("function-control-restore-all").click(function () {
            erasureTextComponent.locate("character").each(function() {
              $(this).removeClass("er");
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
             ca.alanharnum.erasureMaker.loadErasure(erasureTextComponent, erasureId);
        });

};

ca.alanharnum.erasureMaker.loadErasure = function (erasureTextComponent, erasureId) {
    console.log("loadErasure")
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
};

fluid.defaults("ca.alanharnum.erasureMaker.text.view", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
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

    }
});

fluid.defaults("ca.alanharnum.erasureMaker.text.edit", {
    gradeNames: ["ca.alanharnum.erasureMaker.text.view"],
    model: {
        currentMode: "click",
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
            $(this).toggleClass("er");
          }
          if(that.model.currentMode === "word") {
            ca.alanharnum.erasureMaker.text.toggleWord(this)
          }
        });
        $(this).mouseenter(function () {
          if(that.model.currentMode === "erase") {
            $(this).addClass("er");
          }
          if(that.model.currentMode === "restore") {
            $(this).removeClass("er");
          }
        });
    });
};

ca.alanharnum.erasureMaker.text.toggleWord = function (characterSelector) {
  var prev, next;
  prev = ca.alanharnum.erasureMaker.text.getAdjacentcharacterSelectors(characterSelector, "prev");
  next = ca.alanharnum.erasureMaker.text.getAdjacentcharacterSelectors(characterSelector, "next");
  var word = $(characterSelector).add(prev).add(next);
  word.toggleClass("er");
};

ca.alanharnum.erasureMaker.text.getAdjacentcharacterSelectors = function (characterSelector, direction) {
  var adjacentcharacterSelectors = $([]);
  if(ca.alanharnum.erasureMaker.text.isPunctuationCharacter($(characterSelector).text())) {
    return adjacentcharacterSelectors;
  }
  var allWordcharacterSelectorsFound = false;
  var currentCharacterSelector = characterSelector;
  while (!allWordcharacterSelectorsFound) {
    currentCharacterSelector = $(currentCharacterSelector)[direction]();
    if(ca.alanharnum.erasureMaker.text.isPunctuationCharacter(currentCharacterSelector.text())) {
      allWordcharacterSelectorsFound = true;
    } else {
      adjacentcharacterSelectors = adjacentcharacterSelectors.add(currentCharacterSelector);
    }
  }
  return adjacentcharacterSelectors;
}

ca.alanharnum.erasureMaker.text.isPunctuationCharacter = function (character) {
  // python.punctuation definition, via https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex#comment39981263_4328722
  var punctuationCharacters = " ['!\"“”#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']";
  if (punctuationCharacters.indexOf(character) > -1) {
    return true;
  } else return false;
};

fluid.defaults("ca.alanharnum.erasureMaker.controls.view", {
    gradeNames: ["ca.alanharnum.erasureMaker.markupAppendingComponent", "fluid.viewComponent"],
    model: {
        eraseStyle: "faded"
    },
    strings: {
        markup:
        `
        <form>
            <label for="select-erase-style">
                <h2 class="control-header">Erasing Style <span class="control-header-explanation">Change appearance of erased text.</span>
                </h2>
                <select class="erase-style-selector" id="select-erase-style">
                    <option value="faded">Faded</option>
                    <option value="strike-through">Strike Through</option>
                    <option value="blacked-out">Blacked Out</option>
                    <option value="removed">Removed</option>
                </select>
            </label>
        </form>
        `
    },
    listeners: {
        "onMarkupAppended.addEraseStyleControl": {
            func: "ca.alanharnum.erasureMaker.controls.addEraseStyleControl",
            args: ["{that}"]
        }
    },
    selectors: {
        "erase-style-selector": ".erase-style-selector"
    }
});

fluid.defaults("ca.alanharnum.erasureMaker.controls.edit", {
    gradeNames: ["ca.alanharnum.erasureMaker.controls.view"],
    model: {
        currentMode: "click"
    },
    strings: {
        markup:
        `
        <form>
            <h2 class="control-header">Cursor Behavior <span class="control-header-explanation">Controls how the cursor interacts with the text. Has keyboard shortcuts.</span></h2>
            <div class="mode-controls controls">
                    <label class="mode-control mode-control-click current-control">
                        <input class="fl-hidden-accessible mode-control-click-radio" checked type="radio" name="mode-control-radio" value="click" />
                        click to toggle <span class="keyboard-shortcut-indicator">c</span>haracters
                    </label>
                    <label class="mode-control mode-control-word">
                        <input class="fl-hidden-accessible mode-control-click-radio" checked type="radio" name="mode-control-radio" value="click" />
                        click to toggle <span class="keyboard-shortcut-indicator">w</span>words
                    </label>
                    <label class="mode-control mode-control-erase">
                        <input class="fl-hidden-accessible mode-control-click-radio" type="radio" name="mode-control-radio" value="erase" />
                        drag cursor to <span class="keyboard-shortcut-indicator">e</span>rase characters
                    </label>
                    <label class="mode-control mode-control-restore">
                        <input class="fl-hidden-accessible mode-control-click-radio" type="radio" name="mode-control-radio" value="restore" />
                        drag cursor to <span class="keyboard-shortcut-indicator">r</span>estore characters
                    </label>
            </div>
            <h2 class="control-header">Functions <span class="control-header-explanation">Operate on the entire text at once.</span></h2>
            <div class="function-controls controls">
                <button type="button" class="function-control-erase-all">erase all</button>
                <button type="button" class="function-control-restore-all">restore all</button>
                <button type="button" class="function-control-save">save</button>
                <button type="button" class="function-control-get">get</button>
            </div>
            <label for="select-erase-style">
                <h2 class="control-header">Erasing Style <span class="control-header-explanation">Change appearance of erased text.</span>
                </h2>
                <select class="erase-style-selector" id="select-erase-style">
                    <option value="faded">Faded</option>
                    <option value="strike-through">Strike Through</option>
                    <option value="blacked-out">Blacked Out</option>
                    <option value="removed">Removed</option>
                </select>
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
        }
    },
    selectors: {
        "mode-control-click": ".mode-control-click",
        "mode-control-word": ".mode-control-word",
        "mode-control-erase": ".mode-control-erase",
        "mode-control-restore": ".mode-control-restore",
        "function-control-erase-all": ".function-control-erase-all",
        "function-control-restore-all": ".function-control-restore-all",
        "function-control-save": ".function-control-save",
        "function-control-get": ".function-control-get",
    }
});

ca.alanharnum.erasureMaker.controls.addKeyboardShortcuts = function (that) {
    $(document).keyup(function (e) {
        if(e.key === "c") {
            that.locate("mode-control-click").click();
        }
        if(e.key === "w") {
            that.locate("mode-control-word").click();
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
          that.locate("mode-control-word").removeClass("current-control");
          that.locate("mode-control-erase").removeClass("current-control");
          that.locate("mode-control-restore").removeClass("current-control");
    });

    that.locate("mode-control-word").click(function () {
        that.applier.change("currentMode", "word");
        $(this).addClass("current-control");
        that.locate("mode-control-click").removeClass("current-control");
          that.locate("mode-control-erase").removeClass("current-control");
          that.locate("mode-control-restore").removeClass("current-control");
    });

    that.locate("mode-control-erase").click(function () {
        that.applier.change("currentMode", "erase");
        $(this).addClass("current-control");
        that.locate("mode-control-word").removeClass("current-control");
        that.locate("mode-control-click").removeClass("current-control");
        that.locate("mode-control-restore").removeClass("current-control");
    });

    that.locate("mode-control-restore").click(function () {
        that.applier.change("currentMode", "restore");
        $(this).addClass("current-control");
        that.locate("mode-control-word").removeClass("current-control");
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
