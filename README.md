Do you also get annoyed by all those pointless sticky headers with pointless logos, hamburger menus and no particular functionality that can wait for you to scroll up? are you getting flashbacks from your grandmas internet explorer with 10 toolbars installed? do you find it absurd that screens are getting bigger and bigger but there is less and less content to see? 

Then get ready to claim back some of that space with this userscript that blocks headers and other sticky elements from wasting precious vertical screen estate by pinning them down to the background of the website. everything is staying acessible but it wont creep up on you like a creeping shower curtain anymore when scrolling.

It checks the computed style of each element. if the position attribute is "fixed" then it checks if its tagname, id or class names contain any keywords provided by the list below.
https://raw.githubusercontent.com/elypter/BlockHead/master/black_keywords.js

this list is being created with this tool https://github.com/elypter/rule_keyword_generator by parsing the rules of https://raw.githubusercontent.com/yourduskquibbles/webannoyances/master/ultralist.txt for class names and ids.

There is also a whitelist for certain keywords and tag names to reduce flase positives and processing time.

on an 10 year old laptop it can take up 100-200ms or more in extreme cases so the performance aspect is not completely neglegtible but also not a deal breaker.

there is also the option to save automatically generated rules to disk by switching on the save_generated_rules variable in the memory tab of tampermonkey or violentmoneky and later putting "blockhead-rules" into the url of any website like https://example.com/?q=blockhead-rules the rules will be displayed on the site on a simple div layer so you can copy them where you like. for example into an adbloker or you could help out yourduskquibbles with his webannoyances ultralist https://github.com/yourduskquibbles/webannoyances/issues
statistics of the keyword usage can be retrieved in the same way by using "blockhead-statistics" they have to be turned on first as well.

https://github.com/elypter/BlockHead/
License: GPL3
