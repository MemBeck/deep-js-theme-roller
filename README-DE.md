Deep-js Theme Roller
====================

##About
This is a package used by [deep-js](https://github.com/s-a/deep-js)
On [the Theme Roller test page](http://app.deep-js.com/#theme-roller) you can find any Typography or GUI element that may exists in your current CSS composition.
The deep.js Theme Roller is intended for administrative purposes only and only available in Google Chrome or another Webkit Browser (not tested!). Your best chance to get it working in Microsoft Internet Explorer is to install the [Google Chrome Frame plugin](http://www.google.com/chromeframe?prefersystemlevel=true‎).

##How to use it?
Once activated the Theme Roller is global available within the web app. You simply have to select an element anywhere on the page when the Theme Roller is active. It will find the CSS rules regarding to the clicked element if there are color informations available. After that you can edit the matched colors and the Theme Roller will change your browsers CSS rules without a page refresh. To navigate within the app you have to deactivate the Theme Roller Widget [ESC] or enter a hashtag URL direct into your browsers address bar.
***Some elements have more CSS rules available than just the clicked state. To inspect those hover or active rules just activate or put the mouse cursor over the element and press [SPACE] to refresh the Theme Roller content.  
Please keep in mind that the inspected element is always locked to the last clicked element.***

##How to get inspired?
Maybe the best place to get inspired is the [Deep.js Theme Gallery](#theme-roller/gallery) but we also suggest to try [http://colorschemer.com](http://colorschemer.com) to grab cool colors and take a look at all available fonts at [http://www.google.com/fonts](http://www.google.com/fonts).

###How to get the source code and use it on my own page?          
The Theme Roller is a part of the Deep.js Theme Roller package but also a single extracted JavaScript file called theme-roller.js and depends on jQuery. It is equiped with some event handlers and a visual GUI widget declared with some custom CSS in https://github.com/s-a/deep-js-theme-roller/blob/master/index.html (#theme-roller).  

* [Fork or download a copy at GitHub](https://github.com/s-a/deep-js-theme-roller)
* [theme-roller.js](https://github.com/s-a/deep-js-theme-roller/blob/master/assets/theme-roller.js)
* [index.html](https://github.com/s-a/deep-js-theme-roller/blob/master/index.html)
* [events.js](https://github.com/s-a/deep-js-theme-roller/blob/master/events.js)