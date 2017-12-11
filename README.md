//This script blocks headers and other sticky elements from wasting precious vertical screen estate by pinning them down.
//It checks the computed style of each element. if the position attribute is relative, fixed or absolute
//then it checks if its id or classes names contain provided in the list below.
//this list is created with theis tool https://github.com/elypter/rule_keyword_generator by parsing the rules https://raw.githubusercontent.com/yourduskquibbles/webannoyances/master/ultralist.txt
//for class names and ids.
//There is also a whitelist for certain keywords and tag names to reduce flase positives and processing time.
//currently the processing time is quite high because each element has to be checked and many have to be checked against the whole list.
//on an old laptop it can take up to single digit seconds so pageloadtime noticable increases.

//GPL3
