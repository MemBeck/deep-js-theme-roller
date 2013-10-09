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

	var initializeMenu = function($el) {
		$el.find("#theme-roller-help, a.help").click(function() {
			commandStartIntro();
			return false;
		});

		var $contentArea = $el.find("#theme-roller-content");
		$el.find("a.minimize").kick(
			function(){
				$(this).text(Deep.translate("Maximize")).toggleClass("active");
				$contentArea.slideUp();
				return false;
			},
			function(){
				$(this).text(Deep.translate("Minimize")).toggleClass("active");
				$contentArea.slideDown();
				return false;
			}
		);

		$el.find("a.save, a.load, a.share, a.reset").click(function() {
			if ($(this).hasClass("disabled") || $(this).attr("disabled") === "disabled") return false;
			alert("not implemented yet");
			return false;
		});

		$el.find("a.refresh").click(function() {
			ThemeRoller.refresh();
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


	Deep.getScript("/api/sa/theme-roller/theme-roller-js/theme-roller.js", function() {

		ThemeRoller.init(this.$el, {
			"translate" : Deep.translate,
			"error": function(userValue) {
				Deep.Web.UI.msg({type: "error", msg: Deep.translate("invalid__color__value", userValue )});
			}
		});
		Deep.on("sa.theme-roller.index.render", function(){
			var self = this;
			var $el = this.$el;
			initializeMenu($el);

			var watchElements = $el.find("*:not(#theme-roller):not(#theme-roller *)").filter(":not(#theme-roller-help)");
			ThemeRoller.listen(watchElements);
		});
	});


})(jQuery, window.Deep);