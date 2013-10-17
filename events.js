(function($, Deep) {

	var commandStartIntro = function(){

		var intro = Deep.Intro({
			steps: [
			{
				element: '#theme-roller',
				intro: "help__text__1",
				position: 'left'
			},
			{
				element: '#theme-roller-source',
				intro: "help__text__2",
				position: 'right'
			},
			{
				element: '#theme-roller-header-title',
				intro: "help__text__3",
				position: 'left'
			}
			]
		}).onchange(function function_name (targetElement) {
			if ($(targetElement).attr("id") === "theme-roller-source"){
				window.setTimeout(function () {
					$(targetElement).trigger("click");
					intro.refresh();
				},1500);
			}
		}).start();
	};

	var screenShot = null;

	var $minimizeButton = null;

	var initializeMenu = function($el) {
		$el.find(".theme-roller-help-button, a.help").click(function() {
			commandStartIntro();
			return false;
		});

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



	Deep.on("sa.theme-roller.gallery.render", function(){
	});

	Deep.on("sa.theme-roller.index.unload", function(){
	});

	Deep.on("sa.theme-roller.save.render", function(){
		//$(screenShot).width("40%");
		$("#theme-roller-preview-image").html("").append(screenShot);
		$("#image-preview-data").val( screenShot.toDataURL() );
	});

	Deep.on("sa.theme-roller.index.render", function(){
		var themeRollerScript = this.model.get("namespacePath") + "/assets/theme-roller.js";

		initializeMenu(this.$el);


		if ($("#theme-roller").length === 0){
				$(".theme-roller-template:first").attr("id", "theme-roller").appendTo("body");
				$("#theme-roller").hide().removeClass("hidden").fadeIn("slow", function() {
					Deep.getScript(themeRollerScript, function() {
						window.setTimeout(function() {						
							ThemeRoller.init(this.$el, {
								"translate" : Deep.translate,
								"error": function(userValue) {
									Deep.Web.UI.msg({type: "error", msg: Deep.translate("invalid__color__value", userValue )});
								}
							});
							ThemeRoller.on();
						},1000)
					});
				});
		} else {
			$(".theme-roller-template:first").remove();
		}




		Deep.Web.UI.hotkeys(this).on("space", true, function(event) {
			ThemeRoller.refresh();
			console.warn("space", this);
			return false;
		});

		Deep.Web.UI.hotkeys(this).on("esc", true, function(event) {
			$("body").find("a.minimize:first").click();
			console.warn("esc", this);
			return false;
		});
	});

})(jQuery, window.Deep);