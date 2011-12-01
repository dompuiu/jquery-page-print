# jQuery Page Print
This plugin shows a print preview of the current page in a modal window. It's inspired from the [jQuery Print Preview plugin](https://github.com/etimbo/jquery-print-preview-plugin).

The plugin also tries to capture the "CTRL + P" keybinding. The modal window is shown when you press "CTRL + P" for the first time. While the modal is opened, pressing the "CTRL + P" keys will open the print window of the browser.
Unlike traditional print previews this plugin brings in all content and print styles within a modal window.

The icons used in the plugin were taken from the [FatCow Web Hosting Icon Set](http://www.fatcow.com/free-icons).

## How To Use
In order to use this plugin you must insert into the page the followings:
- The jQuery script file;
- The plugin file;
- The plugin dependencies: CSS file and sprite image.

You can initialize the plugin by calling pagePrint function on any jQuery collection.
Example: $('<a href="#">Print this page</a>').prependTo('body').css({position: 'absolute', top: 0}).pagePrint().

## Config Options
The following config options can be sent when calling the plugin:
- backgroundColor: the background color of the opened modal window (default: '#fff');
- baseCls: the base CSS class to apply to this widget elements (default: 'page-print');
- destroyOnHide: clean the DOM of the created elements and events (default: false);
- opacity: opacity of the modal window mask (default: 0.75);
- paperMargin: the paper margin (default: '1cm');
- paperWidth: the paper width (default: '19cm');
- zIndex: z-index of the modal window and mask (default: 10000);

## Supported Browsers
- Internet Explorer 7, 8 and 9
- Google Chrome
- Firefox

## License
Licensed under the [MIT license](http://www.opensource.org/licenses/mit-license.php).