
(function() {
	var dynamicStyleControler = function(selectorText, styleName, styleValue) {
		return this;
	};


	var dynamicStyles = [];
	var dynamicStyle = function(selectorText, styleName, styleValue) {
		this.selectorText = selectorText;
		this.styleName = styleName;

		var matchColors = /(\d{1,3}), (\d{1,3}), (\d{1,3})/;
	 	var matchColorsRgba = /(\d{1,3}), (\d{1,3}), (\d{1,3}), (.*)/;
		var matchItems = new RegExp("^rgb((.*))$");
		//var rgbArr = []; 
		var self = this;
		self.originalStyleText = styleValue;
		// try{ 

		this.styleText = styleValue.replace(matchItems, function (match, content, off, s) {
			var test = match.match(matchColors);
			self.r = test[1];
			self.g = test[2];
			self.b = test[3];  
			
			console.log(self);
			return styleValue.replace(match, "{0}");
		});
		// } catch (e) { 
		// } 

		this.val = function(value){
			if (value){ 
				// set value list  
			} else {  
				// get value list 
			}
		}; 

		if (this.r !== undefined){
			var v = this.r + "," + this.g + "," + this.b;
			if (dynamicStyles[v] === undefined) dynamicStyles[v] = [];
			dynamicStyles[v].push(this);
		}

		return this;
	}

	var getStyle = function(className) {

		var colorRules = [];
		var processSelector = function(rule) {

		 
			for (var key in rule.style) {
				var style = rule.style[key];
				if (typeof (style) === "string" && key !== "cssText" && style.indexOf("rgb") !== -1){
				 	 
					var test = new dynamicStyle(rule.selectorText, key, style);
				 
					test.val();
					//console.log(rule.selectorText, key, style);
				}
			};
		}
		var processCss = function(classes) {
			if(classes){	
				for(var x=0;x<classes.length;x++) {
	                // (classes[x].cssText) ? alert(classes[x].cssText) : alert(classes[x].style.cssText);
	                var selector = classes[x];
	                if (selector){
	                	processSelector(selector);
	                }
	            }	
	        }
	    } ;
		var styles = document.styleSheets;
		for (var s = 0; s < styles.length; s++) {
			var style = styles[s];
			if (!style.styleSheet){
				if (style.cssRules)
			    	for (var i = 0; i < style.cssRules.length; i++) {
			    		var sheet = style.cssRules[i].styleSheet;
			    		if (sheet){
			    			var rules = sheet.rules || sheet.cssRules
			    			processCss(rules);
			    		}
			    	};
			} else {
	    		processCss(style);
			}
		};
		console.log(dynamicStyles);
	}

	Deep.on("sa.theme-roller.index.render", function  () { 
		getStyle('.container');		
	})
})(jQuery);