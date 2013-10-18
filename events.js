(function($, Deep) {

	var screenShot = null, changedReminder = null, $minimizeButton = null;

	var initializeMenu = function($el) {
		var $contentArea = $el.find("#theme-roller-content");
		$minimizeButton = $el.find("a.minimize").kick(
			function(){
				$(this).text(Deep.translate("Activate")).toggleClass("active").nextAll("a").fadeOut();
				$contentArea.slideUp();
				ThemeRoller.off();
				return false;
			},
			function(){
				$(this).text(Deep.translate("Deactivate")).toggleClass("active").nextAll("a").fadeIn();
				$contentArea.slideDown();
				ThemeRoller.on();
				return false;
			}
		);

		$el.find("a.refresh").click(function() {
			ThemeRoller.refresh();
			return false;
		});

		$el.find("a.save").click(function() {
			window.location.hash = "#theme-roller";
			html2canvas($("#theme-roller-theme-elements").get(0), {
			    onrendered: function(canvas) {
			        screenShot = canvas;
		            window.location.hash = "#theme-roller/save";
					$minimizeButton.kick(0);
			    }
			});

			return false;
		});

		$el.find(".theme-roller-content-title").kick(
			function() {
				$(this).next().slideUp();
				return false;
			},
			function() {
				$(this).next().slideDown();
				return false;
			}
		);
	};

	var initializeHotKeys = function(package) {
		Deep.Web.UI.hotkeys(package).on("space", true, function() {
			ThemeRoller.refresh();
			return false;
		});

		Deep.Web.UI.hotkeys(package).on("esc", true, function() {
			$("body").find("a.minimize:first").click();
			return false;
		});
	};

	var initializeThemeRollerTemplate = function(package) {
		if ($("#theme-roller").length === 0){
			var themeRollerScript = package.model.get("namespacePath") + "/assets/theme-roller.js";
			Deep.getScript(themeRollerScript, function() { 
				initializeThemeRoller(package);
				$(".theme-roller-template:first").attr("id", "theme-roller").appendTo("body");
				$("#theme-roller").hide().removeClass("hidden").fadeIn("slow", function() {
				}); 
			});
		} else {
			$(".theme-roller-template:first").remove();
		}
	};

	var initializeThemeRoller = function(package) {
		initializeMenu(package.$el); 
 
		ThemeRoller.init(package.$el, {
			"done": function() {
				$("#theme-roller-color-table,#theme-roller-theme-elements").hide().removeClass("hidden").fadeIn("fast");
			},
			"translate" : Deep.translate,
			"error": function(userValue) {
				Deep.Web.UI.msg({type: "error", msg: Deep.translate("invalid__color__value", userValue )});
			},
			"change" : function() {
				changedReminder = new Deep.Web.UI.changedReminder({
					title: "There is an unsaved theme.",
					package: package
				});
				changedReminder.on();
			}
		});
		initializeHotKeys(package);
		ThemeRoller.on();
	};

	Deep.on("sa.theme-roller.index.render", function(){
		initializeThemeRollerTemplate(this);
	});

	Deep.on("sa.theme-roller.save.render", function(){
		//$(screenShot).width("40%");
		$("#theme-roller-preview-image").html("").append(screenShot);
		$("#image-preview-data").val( screenShot.toDataURL() );
	});

	Deep.on("sa.theme-roller.save.submit", function(result) {
		if (!result.err) changedReminder.off();
	});

	Deep.on("sa.theme-roller.gallery.render", function(){

	});

	Deep.on("sa.theme-roller.index.unload", function(){

	});

})(window.jQuery, window.Deep);