// ==UserScript==
// @name Blockhead
// @namespace blockhead
// @description Blocks headers and other sticky elements from wasting precious vertical screen estate by pinning them down.
// @match *://*/*
// @version     13
// @grant    GM.getValue
// @grant    GM.setValue
// @grant    GM_getValue
// @grant    GM_setValue
// @grant unsafeWindow
// @xhr-include *
// @author elypter
// @downloadURL https://raw.githubusercontent.com/elypter/BlockHead/master/blockhead.user.js
// @updateURL https://raw.githubusercontent.com/elypter/BlockHead/master/blockhead.user.js
// @require https://raw.githubusercontent.com/elypter/Super-GM_setValue/master/super-gm_setvalue.user.js
// @require https://raw.githubusercontent.com/elypter/BlockHead/master/black_keywords.js
// ==/UserScript==




//This script blocks headers and other sticky elements from wasting precious vertical screen estate by pinning them down.
//It checks the computed style of each element. if the position attribute is fixed or absolute or ~relative~
//then it checks if its id or classes names contain provided in the list below.
//this list is created with theis tool https://github.com/elypter/rule_keyword_generator by parsing the rules https://raw.githubusercontent.com/yourduskquibbles/webannoyances/master/ultralist.txt
//for class names and ids.
//There is also a whitelist for certain keywords and tag names to reduce flase positives and processing time.
//currently the processing time is quite high because each element has to be checked and many have to be checked against the whole list.
//on an old laptop it can take up to single digit seconds so pageloadtime noticable increases.
//License: GPL3


//id and classes that contain any of these keywords will not be modified
var white_names = ["side","guide","article","html5","story","main","left","right","content","account__section","container--wide","container__main","panel",
                   "body","gutter","embed","watch","background","middleContainer","drag-and-drop"];
//var white_names = ["example-whitelist-entry"];

//tags that will not be cheked
var ignore_tags = ["a","A","script","SCRIPT","body","BODY","li","LI","ul","UL","br","BR","h5","H5","b","B","strong","STRONG","svg","SVG","path","PATHH","h2","H2",
                   "code","CODE","tr","TR","td","TD","h3","H3","h1","H1","h4","H4"];//,"noscript","NOSCRIPT"

var count_element_walker=0; //debug:counts how often a page check is triggered
var count_style_walking=0; //debug:counts how often checking stylesheets is triggered

//search for floating elements that get added after page load.
var mutation_check=GM_SuperValue.get ("mutation_check")==true?GM_SuperValue.get ("mutation_check"):1; //1=yes 2=no change value in memory tab
GM_SuperValue.set ("mutation_check",mutation_check);

//all elements of a site will be checked individually for their computed style and changed if there is a match
var walk_elements=GM_SuperValue.get ("walk_elements")==true?GM_SuperValue.get ("walk_elements"):1; //1=yes 2=no change value in memory tab
GM_SuperValue.set ("walk_elements",walk_elements);

//all stylesheets will be checked for classes and changed if there is a match
var walk_styles=GM_SuperValue.get ("walk_styles")==true?GM_SuperValue.get ("walk_styles"):0; //1=yes 2=no change value in memory tab
GM_SuperValue.set ("walk_styles",walk_styles);

//this will save the statistics of how often a keyword is being matched in a local variable that can be viewed in the memory tab
var save_keyword_statistics=GM_SuperValue.get ("save_keyword_statistics")==true?GM_SuperValue.get ("save_keyword_statistics"):0; //1=yes 2=no change value in memory tab
GM_SuperValue.set ("save_keyword_statistics",save_keyword_statistics);

//this will save the rules generated based on the blocking in a local variable that can be viewed in the memory tab
var save_generated_rules=GM_SuperValue.get ("save_generated_rules")==true?GM_SuperValue.get ("save_generated_rules"):0; //1=yes 2=no change value in memory tab
GM_SuperValue.set ("save_generated_rules",save_generated_rules);

//contained in black_keywords.js
//var black_keywords //list generated with rule_keyword_generator from webannoyances ultralist

function counted_element_walker(elm,orig){
    count_element_walker++;

    //this disables all javascript that is being triggered when scrolling
    window.addEventListener("scroll", function (event) {
        event.stopPropagation();
    }, true);
    console.log("check number "+count_element_walker+" from: "+orig);
    element_walker_all(elm);
    //console.log(GM_SuperValue.get ("white_names_counter"));
    //console.log(GM_SuperValue.get ("black_keywords_counter"));
    //console.log(GM_SuperValue.get ("generated_rules"));
}

function keyword_walker(keyword_list){
    var white_names_counter=GM_SuperValue.get ("white_names_counter")||{};
    var black_keywords_counter=GM_SuperValue.get ("black_keywords_counter")||{};

    //todo: switch order of for loops to detect whitelists earlier
    var state=-1;
    //console.log("list: ("+keyword_list.length+") "+keyword_list);
    for (var i=0; i < keyword_list.length; i++){
        var subword_list=keyword_list[i].toString().split('-');
        //console.log("sublen of: "+subword_list+" from "+keyword_list[i]+" = "+subword_list.length);
        for (var j=0; j < subword_list.length; j++){
            var subsubword_list=subword_list[j].split('_');
            //console.log("subsublen of: "+subsubword_list+" from "+subword_list[j]+" = "+subsubword_list.length);
            for (var k=0; k < subsubword_list.length; k++){
                for (var l=0; l < white_names.length; l++){
                    //console.log("test white: l:"+white_names[l]+" in s:"+subsubword_list[k]+" of "+keyword_list);
                    if (subsubword_list[k].indexOf(white_names[l]) != -1){
                        //console.log("whitelisted: l:"+white_names[l]+" in s:"+subsubword_list[k]+" of "+keyword_list);
                        if(white_names_counter[white_names[l]]) white_names_counter[white_names[l]]++;
                        else white_names_counter[white_names[l]]=1;
                        GM_SuperValue.set ("white_names_counter", white_names_counter);
                        return 0;
                    }
                }
                for (var l=0; l < black_keywords.length; l++){
                    if (subsubword_list[k].indexOf(black_keywords[l]) != -1){
                        console.log("matched: l:"+black_keywords[l]+" in s:"+subsubword_list[k]+" of "+keyword_list);
                        if(black_keywords_counter[black_keywords[l]]) black_keywords_counter[black_keywords[l]]++;
                        else black_keywords_counter[black_keywords[l]]=1;
                        state = 1;
                    }
                }
            }
        }
    }

    GM_SuperValue.set ("black_keywords_counter", black_keywords_counter);
    return state;
}

function element_walker_all(startElem) {
    //walk over element list as opposed to an element tree
    if (!(startElem instanceof Element)) return;

    var generated_rules=GM_SuperValue.get ("generated_rules")||[]; //contains all adblock/ublock rules that the script creates based on what it modifies

    var elms = startElem.getElementsByTagName("*");
    for (var x = elms.length; x--;) {
        elm=elms[x];
    //console.log("checking: "+elm.tagName.toString());
    if(elm instanceof Element && ignore_tags.indexOf(elm.tagName.toString()) == -1 && getComputedStyle(elm)) {
        //console.log("testing: "+elm.tagName.toString()+" with position= "+getComputedStyle(elm).getPropertyValue("position").toLowerCase());
        if (/*(getComputedStyle(elm).getPropertyValue("position") == "absolute") ||*/
            (getComputedStyle(elm).getPropertyValue("position").toLowerCase() == "fixed")/* || */
            /*(getComputedStyle(elm).getPropertyValue("position") == "relative")*//* ||*/
            /*(getComputedStyle(elm).getPropertyValue("top") != "")*/) {

        var keyword_list =[];
        keyword_list=elm.className.toString().split(' ');
        if (typeof(elm.id)=="string"&&elm.id!="") keyword_list.push([elm.id]);
        if (typeof(elm.tagName)=="string"&&elm.tagName!="") keyword_list.push([elm.tagName]);

        var has_matched=-1;
        if (keyword_list!=[]&&keyword_list!=[""]){
            //compare against black and whitelist
            has_matched=keyword_walker(keyword_list);
        }
        var rule;
        var class_list=elm.className.toString().split(' '); //check for rule writing
        if (has_matched==1){
            console.log("pinning sticky: "+elm.id+","+elm.className+","+elm.tagName);

            if (elm.id){
                rule=window.location.hostname+"###"+elm.id+":style(position: "+"fixed"+" !important;)";
                if(generated_rules.indexOf(rule)==-1){
                    if(!(rule in generated_rules)) generated_rules.push(rule);
                    //console.log(rule);
                }
            }
            if(elm.className){
                for (var i=0; i < class_list.length; i++){
                    rule=window.location.hostname+"##."+class_list[i]+":style(position: "+"fixed" +" !important;)";
                    if(generated_rules.indexOf(rule)==-1){
                        if(!(rule in generated_rules)) generated_rules.push(rule);
                        //console.log(rule);
                    }
                }
            }
            elm.setAttribute('style', 'position:static !important');
            elm.style.removeProperty('top');
            //return;
        }else if(has_matched==0){
            if (elm.id){
                rule=window.location.hostname+"#@#"+elm.id;
                if(generated_rules.indexOf(rule)==-1){
                    if(!(rule in generated_rules)) generated_rules.push(rule);
                    //console.log(rule);
                }
            }
            if(elm.className){
                for (var j=0; j < class_list.length; j++){
                    rule=window.location.hostname+"#@."+class_list[j];
                    if(generated_rules.indexOf(rule)==-1){
                        if(!(rule in generated_rules)) generated_rules.push(rule);
                        //console.log(rule);
                    }
                }
            }
            console.log("whitelisted sticky: "+elm.id+","+elm.className+","+elm.tagName);
        }else{
            console.log("ignoring sticky: "+elm.id+","+elm.className+","+elm.tagName);
        }
        }
    }



    }
    GM_SuperValue.set ("generated_rules", generated_rules);
}

function element_walker(elm) {
    //walk over element list as opposed to an element tree
    var node;
    //console.log("checking: "+elm.tagName.toString());
    if(elm instanceof Element && ignore_tags.indexOf(elm.tagName.toString()) == -1 && getComputedStyle(elm)) {
        //console.log("testing: "+elm.tagName.toString()+" with position= "+getComputedStyle(elm).getPropertyValue("position").toLowerCase());
        if (/*(getComputedStyle(elm).getPropertyValue("position") == "absolute") ||*/
            (getComputedStyle(elm).getPropertyValue("position").toLowerCase() == "fixed")/* || */
            /*(getComputedStyle(elm).getPropertyValue("position") == "relative")*//* ||*/
            /*(getComputedStyle(elm).getPropertyValue("top") != "")*/) {

        var keyword_list =[];
        keyword_list=elm.className.toString().split(' ');
        if (typeof(elm.id)=="string"&&elm.id!="") keyword_list.push([elm.id]);

        var has_matched=-1;
        if (keyword_list!=[]&&keyword_list!=[""]){
            has_matched=keyword_walker(keyword_list);
        }
        var rule;
        var class_list=elm.className.toString().split(' '); //check for rule writing
        if (has_matched==1){
            //console.log("pinning sticky: "+elm.id+","+elm.className+","+elm.tagName);

            if (elm.id){
                rule=window.location.hostname+"###"+elm.id+":style(position: "+"fixed"+" !important;)";
                if(generated_rules.indexOf(rule)==-1){
                    generated_rules.push(rule);
                    console.log(rule);
                }
            }
            if(elm.className){
                for (var i=0; i < class_list.length; i++){
                    rule=window.location.hostname+"##."+class_list[i]+":style(position: "+"fixed" +" !important;)";
                    if(generated_rules.indexOf(rule)==-1){
                        generated_rules.push(rule);
                        console.log(rule);
                    }
                }
            }
            elm.setAttribute('style', 'position:static !important');
            elm.style.removeProperty('top');
            //return;
        }else if(has_matched==0){
            if(elm.className){
                for (var j=0; j < class_list.length; j++){
                    rule="@@"+window.location.hostname+"##."+class_list[j];
                    if(generated_rules.indexOf(rule)==-1){
                        generated_rules.push(rule);
                        console.log(rule);
                    }
                }
            }
            //return;
        }else{
            //console.log("ignoring sticky: "+elm.id+","+elm.className+","+elm.tagName);
        }
        }
    }

    // Handle child elements
    for (node = elm.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === 1) { // 1 == Element
            element_walker(node);
        }
    }


}

function style_walker() {
    //this alternative mode of searching and modifying sticky elements by searching stylesheets directly
    //although i thought stylesheet checking would be faster it tends be slower and cannot be performed on external stylesheets

    var state=0;
    count_style_walking++;
    //console.log("checking stylesheets for the "+count_style_walking+"th time");
    var styleSheets = window.document.styleSheets;

    for(var i = 0; i < styleSheets.length; i++){
        //console.log("checking stylesheet #"+i);//+" named "+styleSheets[i].sheet);

        //try to get a list of classes for each stylesheet.
        //this will throw an error if the stylesheet is hosted on an external server because of cross site protection
        //these stylesheets cannot be processed at them moment/or never
        var classes;
        if (document.styleSheets[i].cssRules){
            classes=document.styleSheets[i].cssRules;
        }else if (document.styleSheets[i].rules){
            classes=document.styleSheets[i].rules;
        }//}catch(e){}
        if (!classes) continue;

        for (var j = 0; j < classes.length; j++) {
            //console.log("checking class "+classes[x].selectorText);
            state=0;
            for (var k=0; k < black_keywords.length; k++){
                if (classes[j].selectorText) if (classes[j].selectorText.indexOf(black_keywords[k])!=-1){
                    //console.log("matched: l:"+black_keywords[k]+" in s:"+classes[j].selectorText+" of "+styleSheets[i].sheet);
                    if (classes[j].position=="absolute" ||classes[j].position=="static"){
                        state = 1;
                    }
                }
            }
            for (var k=0; k < white_names.length; k++){
                if (classes[j].selectorText) if (classes[j].selectorText.indexOf(white_names[k])!=-1){
                    //console.log("whitelisted: l:"+white_names[k]+" in s:"+classes[j].selectorText+" of "+styleSheets[i].sheet);
                    state=0;
                }
            }
            if (state==1){
                stylesheet.deleteRule("position");
            }
        }
    }
}

// show saved rules when opening a location containing "bloackhead-rules"
if(window.location.toString().indexOf("blockhead-rules")!=-1){
    var iDiv = document.createElement('div');
    iDiv.id = 'blockhead-rules';
    iDiv.style.margin = '0 auto';
    iDiv.style.position= "absolute";
    iDiv.style.backgroundColor ="white";
    iDiv.style.zIndex=9001000;
    iDiv.style.opacity=1;
    document.getElementsByTagName('body')[0].appendChild(iDiv);

    rules=GM_SuperValue.get ("generated_rules");
    for(var i=0;i<rules.length;i++){
        iDiv.innerHTML+=rules[i]+'<br/>\n';
    }
    throw new Error('This is not an error. This is just to abort javascript');
}
// show saved rules when opening a location containing "bloackhead-statistics"
if(window.location.toString().indexOf("blockhead-statistics")!=-1){
    var iDiv = document.createElement('div');
    iDiv.id = 'blockhead-statistics';
    iDiv.style.margin = '0 auto';
    iDiv.style.position= "absolute";
    iDiv.style.backgroundColor ="white";
    iDiv.style.zIndex=9001000;
    iDiv.style.opacity=1;
    document.getElementsByTagName('body')[0].appendChild(iDiv);

    iDiv.innerHTML='#white_names_counter:<br/>\ņ';
    rules=GM_SuperValue.get ("white_names_counter");
    for (var key in rules) {
        iDiv.innerHTML+=key+": "+rules[key]+'<br/>\n';
    }
    iDiv.innerHTML+='<br/>\n############<br/>\n<br/>\n';
    iDiv.innerHTML+='#black_keyword_counter:<br/>\ņ';
    rules=GM_SuperValue.get ("black_keywords_counter");
    for (var key in rules) {
        iDiv.innerHTML+=key+": "+rules[key]+'<br/>\n';
    }
    throw new Error('This is not an error. This is just to abort javascript');
}

// Kick it off starting with the `body` element
if(walk_styles==1) style_walker();
if(walk_elements==1) counted_element_walker(document.body,"onstart");

// check elements again if the page code changes
if(walk_elements==1) document.onload = counted_element_walker(document.body,"onload");

// check elements again if the page code changes
if(walk_elements==1) document.onchange = counted_element_walker(document.body,"onchange");

// check elements again if the user scrolls the page(doesnt really do anything)
if(walk_elements==1) document.onscroll = counted_element_walker(document.body,"onscroll");



//check if the dom is modified and checks the changed elements again
if(mutation_check==1 && walk_elements==1){
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    // define a new observer
    var obs = new MutationObserver(function(mutations, observer) {
        // look through all mutations that just occured
        for(var i=0; i<mutations.length; ++i) {
            for(var j=0; j<mutations[i].addedNodes.length; ++j) {
                //check this mutation
                counted_element_walker(mutations[i].addedNodes[j],"onmutation");
            }
        }
    });

    // have the observer observe for changes in children
    obs.observe(document.body, {
        attributes : true, //check for attribute changes
        childList: true, //use a list of occured changes
        subtree: false //also return all subelements of a change
    });
}
