function getRandomInt(max) {
return Math.floor(Math.random() * Math.floor(max));
}

var selectedText = texts[getRandomInt(texts.length)];

var MODE_CLICK = "MODE_CLICK";
var MODE_ERASE = "MODE_ERASE";
var MODE_RESTORE = "MODE_RESTORE";

var currentMode = MODE_CLICK;

$(document).ready(function () {


    var source = selectedText.source;

    var sourceMarkup = "<a href='" + source + "'>Source</a>";

    $(".source").append(sourceMarkup);

    var text = selectedText.text;

    var splitText = text.split("\n\n");

    splitText.forEach(function (para) {
    var paraMarkup = "<p class='paragraph'>" + para + "</p>"
    $(".text").append(paraMarkup);
    });

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
