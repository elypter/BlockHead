// ==UserScript==
// @name Blockhead
// @namespace blockhead
// @description Blocks headers and other sticky elements from wasting precious vertical screen estate by pinning them down.
// @match *://*/*
// @version     7
// @grant    GM.getValue
// @grant    GM.setValue
// @grant unsafeWindow
// @xhr-include *
// @author elypter
// @downloadURL https://raw.githubusercontent.com/elypter/BlockHead/master/blockhead.user.js
// @updateURL https://raw.githubusercontent.com/elypter/BlockHead/master/blockhead.user.js

// ==/UserScript==

// require https://raw.githubusercontent.com/elypter/Super-GM_setValue/master/super-gm_setvalue.user.js


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
var white_names = ["side","article","html5","story","main","left","right","content","account__section","container--wide","container__main","panel","body","gutter","embed","watch","background","middleContainer","drag-and-drop"];

//tags that will not be cheked
var ignore_tags = ["a","A","script","SCRIPT","body","BODY","li","LI","ul","UL","br","BR","h5","H5","b","B","strong","STRONG","svg","SVG","path","PATHH","h2","H2",
                   "code","CODE","tr","TR","td","TD","h3","H3","h1","H1","h4","H4"];//,"noscript","NOSCRIPT"

var mutation_check=true; //search for floating elements that get added after page load.
var substring_search=true; //cannot be switched off anymore.

var count_element_walker=0; //debug:counts how often a page check is triggered
var count_style_walking=0; //debug:counts how often checking stylesheets is triggered
var generated_rules=[]; //contains all adblock/ublock rules that the script creates based on what it modifies
var walk_elements=true; //all elements of a site will be checked individually for their computed style and changed if there is a match
var walk_styles=false; //all stylesheets will be checked for classes and changed if there is a match

//list generated with rule_keyword_generator from webannoyances ultralist
var black_keywords=["inline",
"social",
"navbar",
"header",
"share",
"nav",
"sticky",
"pluto",
"footer",
"main",
"fixed",
"android",
"newsletter",
"top",
"component",
"front",
"block",
"mobile",
"__pw",
"metabar",
"clearfix",
"overlay",
"smart",
"hidden",
"first",
"smp",
"gallery",
"gig",
"headroom",
"menu",
"post",
"content",
"mod",
"icon",
"modal",
"btn",
"button",
"masthead",
"back",
"onesignal",
"page",
"twitter",
"show",
"scroll",
"global",
"hide",
"vjs",
"tmblr",
"ubermenu",
"widget",
"smallarticleattophtml5",
"facebook",
"priority",
"arrows",
"playlistsmallattophtml5",
"fb_recommend",
"slide",
"mobileweb",
"dfp",
"email",
"adi",
"cookie",
"text",
"entry",
"fancybox",
"js_post",
"bottom",
"mashsb",
"subscribe",
"cns",
"nytc",
"nav__social",
"follow",
"tab",
"asset",
"region",
"ssbp",
"sharing",
"leaderboard",
"primary",
"row",
"amp",
"sharedaddy",
"field",
"tve",
"banner",
"app",
"responsive",
"fusion",
"small",
"floating",
"js_newsletter",
"position",
"search",
"action",
"js_ad",
"slim",
"flex",
"active",
"swiper",
"echo",
"shareaholic",
"desktop",
"item",
"sdc",
"layout",
"iframe",
"adsbygoogle",
"list",
"large",
"mfp",
"mvp",
"js_subscribe",
"pushcrew",
"publication",
"pull",
"popover",
"topbar",
"fade",
"uni",
"spu",
"blog",
"next",
"subscription",
"hamburger",
"full",
"sun",
"popup",
"wrapper",
"not",
"vertical",
"single",
"float",
"stuck",
"horizontal",
"logo",
"Post",
"space",
"uvn",
"sharebar",
"secondary",
"mega",
"signup",
"style__mast",
"cta",
"remodal",
"cfat",
"is_stuck",
"affix",
"yui3",
"advertisement",
"longform",
"clear",
"border",
"new",
"sign",
"fly",
"image",
"Header",
"stick",
"svgIcon",
"alert",
"jetpack",
"akamai",
"meta",
"standard",
"msg",
"card",
"city",
"lia",
"contextual",
"ra1",
"style__wsj",
"smartbanner",
"column",
"featured",
"rrssb",
"boxzilla",
"embed",
"ara",
"fyre",
"mdl",
"mailmunch",
"sqs",
"user",
"contain",
"actionbar",
"promo",
"margin",
"pad",
"dfp_ad",
"mini",
"quick",
"toolbar",
"mkdf",
"ribbon",
"box",
"met",
"news",
"prev",
"reveal",
"with",
"pinned",
"meter",
"dynamic",
"synved",
"head",
"progress",
"default",
"recirc",
"google",
"style__stick",
"link",
"edition",
"style__scrolled_2R_Vmp",
"background",
"WSJTheme__sector",
"views",
"socialNetworks",
"atavist",
"wsj",
"buttonSet",
"stb",
"columns",
"robots",
"move",
"nc_socialPanel",
"related",
"skinny",
"devsite",
"webform",
"theme",
"badge",
"art",
"lower",
"Grid",
"body",
"pgevoke",
"WSJTheme__md",
"hero",
"cdev",
"feature",
"ibm",
"media",
"dark",
"pinterest",
"rebelbar",
"scrolled",
"js_meta",
"yfa",
"ember",
"adblock",
"tout",
"color",
"read",
"center",
"stack",
"static",
"scrolling",
"home",
"offset",
"powa",
"bar",
"sharetools",
"title",
"fb_iframe_widget",
"fontello",
"style",
"connect",
"swp_d_fullColor",
"gpt",
"addthis_toolbox",
"toggle",
"rdm",
"cc_container",
"injected",
"cne",
"cnn",
"group",
"cbs",
"r1f",
"align",
"print",
"nbcsports",
"catapult",
"animated",
"popmake",
"sharingfooter",
"grid",
"eltd",
"dpsp",
"closed",
"ArticlePagerItem",
"fit",
"network",
"el__leafmedia",
"adhesionUnit",
"rail",
"swp_flatFresh",
"soc",
"can",
"snp",
"message",
"open",
"size",
"rmq",
"ddb",
"ksat",
"swp_i_fullColor",
"simple",
"tgc",
"postActions",
"code",
"taboola",
"breaker",
"inner",
"persistent",
"adAdhesionSidebar",
"take",
"adv_network",
"social_21069380",
"get",
"adv_header",
"onstoq",
"macdongle",
"recent",
"info",
"adTower",
"collection",
"privacy",
"comment",
"article__share",
"itbelwjba",
"logged",
"adv_mobi_edition",
"warning_empty_div",
"uproxx",
"util",
"apss",
"siBar",
"socialIcons",
"BlockAdvert",
"animate",
"marketing",
"highlightMenu",
"icon16",
"pure",
"mrt",
"reading",
"mol",
"stickynav",
"moat",
"instream",
"wnad",
"chorus",
"leadinModal",
"actnbr",
"Mobile",
"proper",
"jumpstart",
"light",
"nyp",
"articles",
"stickyNav",
"display",
"addthis_default_style",
"Block",
"mailchimp",
"frieze",
"brand",
"topcontrol",
"swp_o_fullColor",
"tooltipster",
"wbtz",
"super",
"wrap",
"width",
"medium",
"topic",
"aol",
"mc_embed_signup",
"white",
"socialite",
"Logo",
"instagram",
"flag",
"socials",
"ProfileCanopy",
"cover",
"wpsr",
"close",
"voc",
"collapsed",
"highlight",
"smaller",
"special",
"generic",
"sharerich",
"socialIcon",
"trb_nh",
"fix",
"wpfront",
"kiwi",
"share__social",
"socialShare",
"rune",
"nocontent",
"the",
"save",
"shadow",
"topnav",
"site__priNav",
"notification",
"unit",
"wwd",
"template",
"shared",
"adhesive",
"lede",
"teads",
"aside",
"recipe",
"review",
"hdr",
"markup",
"justify",
"photos",
"mast",
"floater",
"breaking",
"addtoany_share_save_container",
"react",
"font",
"swp_one",
"__hub",
"custom",
"sde",
"ess",
"js_dismissable",
"auto",
"ksl",
"mainmenu",
"fullwidth",
"pin",
"blue",
"join",
"kicker",
"tnt",
"sharrre",
"dongle",
"parbase",
"wwe",
"spnf_ticker",
"colorbox",
"gridlove",
"return",
"cnbc",
"youtube",
"backtotop",
"condensed",
"shunno",
"scrollToTop",
"dropdown",
"meta__tools",
"thm",
"stock",
"cboxOverlay",
"attach",
"slider",
"zergnet",
"partner",
"infinite",
"adr",
"trb_gptAd",
"feedback",
"trb_mh_adB",
"mt3_row",
"atb",
"preloaded_lightbox",
"regular",
"AppBanner",
"contact",
"adspot",
"WNNavSearchSwitch",
"navstory__arrow",
"promos",
"_3f2NsD",
"node",
"pullquote",
"comments",
"essbfc",
"upper",
"current",
"optinform",
"privy",
"article__leaderboard",
"post__article",
"story__links",
"graf",
"one",
"ssk",
"dc_morning_email",
"shift",
"homepage",
"linkedin",
"csn",
"jwloader",
"pinit",
"cc_banner",
"spnf_right",
"snope",
"subnav",
"add",
"seo",
"tabcontent",
"expanded",
"StickyHeadline",
"fixedsticky",
"recommended",
"originals",
"a2a_kit",
"et_social_mobile_on",
"opinion",
"heavy_ad",
"introjs",
"reg",
"navbar__item",
"view",
"off",
"trb_masthead_adBanner",
"hnst",
"sibling",
"fixie",
"nextgen",
"highlights",
"pbs",
"asset_balaNotification",
"fe_banner__w",
"YDC",
"callout",
"toTop",
"best",
"loaded",
"frb",
"googleplus",
"chapter",
"beta",
"glyphicon",
"telegraf",
"ipu",
"page_header",
"stream",
"divider",
"mail",
"jsid",
"circa",
"huc",
"page__header",
"author",
"events",
"exit",
"two",
"more",
"thega",
"prompt",
"ftr",
"rtli",
"guest",
"et_social_animated",
"ssba",
"last",
"shortcode",
"match",
"widget_text",
"header__inner",
"tablet",
"fb_digioh",
"step",
"_2JO",
"js_top",
"cttus",
"w14",
"armonioso",
"AppBar",
"min",
"ctpl",
"frame",
"zgt",
"opt360",
"adb",
"lsi",
"spev",
"locked",
"end",
"headhesive",
"arrow",
"style__scrolled_1KqqY_CTh3JC3M",
"dsq",
"adhesion",
"js_global",
"toc",
"mainNav",
"reserve",
"headline",
"hellobar",
"header_1",
"paywall",
"nature",
"addtoany_content_bottom",
"footer__social",
"crt",
"ndn_toggleShare",
"boxes",
"swal2",
"hat",
"appIntercept",
"hst",
"support",
"paging",
"vuukle",
"trip",
"simplemodal",
"skrollable",
"welcome",
"zone",
"back_to_top",
"div",
"embed_code",
"flx",
"cat",
"IssueNav",
"csf",
"a2a_kit_size_32",
"carousel",
"footer__column",
"cleared",
"entry__bottom",
"et_social_sidebar_networks",
"et_social_visible_sidebar",
"site_ad",
"overview",
"gjs",
"clay",
"presentation",
"slick",
"coupon",
"transporter",
"styles__sector",
"fill",
"issuem",
"alt",
"postActionsBar",
"pico",
"grey",
"sponsored",
"donate",
"pdp",
"adops",
"ozy",
"fdbst",
"prominent",
"big",
"NavFrame__below",
"dialog",
"ndn_icon_share",
"once",
"bxc",
"cnav",
"announce",
"dac",
"rsv",
"lin",
"tve_cta",
"trb_bnn",
"selection",
"styles__md",
"bsa",
"tracked",
"tighten",
"essb_links_list",
"newsstand",
"keystone",
"stay",
"advads",
"slideshow",
"siteNav",
"leaky",
"bank",
"cmg",
"series",
"wpsso",
"gradient",
"header_wrap",
"centered",
"above",
"backToTop",
"scrolltofixed",
"advert",
"pro",
"dashboard",
"growl",
"rappler3",
"top_header",
"StickyNavbar",
"lightbox",
"scroll_header_top_area",
"form",
"shrink",
"daily",
"push",
"pmc",
"ArticlePage",
"controls",
"slideout",
"drawer",
"max",
"ad_container",
"blocker",
"maia",
"a2a_floating_style",
"yui",
"bling",
"padding",
"nav__main",
"uiLayer",
"toprail",
"shop",
"ytd",
"hdnce",
"relative",
"ipc",
"comp",
"Hero",
"optIn",
"imoneza",
"trb_nls_c",
"stationary",
"shadowbox",
"scrollup",
"article_0_ad_square",
"social_links",
"icons",
"sans",
"click_open",
"a2a_vertical_style",
"bundle",
"SimpleAd",
"ifancybox",
"riser",
"major",
"_3fN",
"swp_three",
"img",
"tertiary",
"shareMenu",
"facebookShare",
"szig",
"fullscreen",
"ads",
"FloatingOIA",
"headed",
"___plusone_0",
"docked",
"PopupSignupForm_0",
"marca",
"buttons",
"ActionButtonRow",
"Button",
"sticky_header",
"disclosure",
"warning",
"chat",
"Newsletter",
"claudia",
"explore",
"from",
"links",
"sideSlide",
"byline",
"hive",
"wnad43",
"striped",
"gray",
"mc4wp",
"gdongle",
"login",
"well",
"glue",
"auto_open",
"wprmenu_bar",
"count",
"lockfixed",
"breadcrumb"];


function counted_element_walker(elm,orig){
    count_element_walker++;
    //console.log("check number "+count_element_walker+" from: "+orig);
    element_walker(elm);
}

function keyword_walker(keyword_list){
    var white_names_counter={};
    var black_keywords_counter={};

    //todo: switch order of for loops to detect whitelists earlier
    var state=-1;
    //console.log("list: ("+keyword_list.length+") "+keyword_list)
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
                        console.log("whitelisted: l:"+white_names[l]+" in s:"+subsubword_list[k]+" of "+keyword_list);
                        white_names_counter[white_names[l]]++;
                        return 0;
                    }
                }
                for (var l=0; l < black_keywords.length; l++){
                    if (subsubword_list[k].indexOf(black_keywords[l]) != -1){
                        console.log("matched: l:"+black_keywords[l]+" in s:"+subsubword_list[k]+" of "+keyword_list);
                        black_keywords_counter[black_keywords[l]]++;
                        state = 1;
                    }
                }
            }
        }
    }
    //console.log("state: "+state+" of "+keyword_list);

    //GM_setValue ("test", "123");
    //alert(GM_getValue ("test"));
    //GM_SuperValue.set ("white_names_counter", white_names_counter);
    //var x = GM_SuperValue.get ("white_names_counter", white_names_counter);


    return state;
}

function element_walker(elm) {
    //if (elm instanceof Element) if (ignore_tags.indexOf(elm.tagName.toString()) > -1) return;
    var node;
    if(elm instanceof Element && ignore_tags.indexOf(elm.tagName.toString()) == -1 && getComputedStyle(elm)) {
                                if (/*(getComputedStyle(elm).getPropertyValue("position") == "absolute") ||*/
                                    (getComputedStyle(elm).getPropertyValue("position") == "fixed")/* || */
                                    /*(getComputedStyle(elm).getPropertyValue("position") == "relative") ||*/
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
            console.log("pinning sticky: "+elm.id+","+elm.className+","+elm.tagName);

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


// Kick it off starting with the `body` element
if(walk_styles) style_walker();
if(walk_elements) counted_element_walker(document.body,"onstart");

// check elements again if the page code changes
if(walk_elements) document.onchange = counted_element_walker(document.body,"onchange");

// check elements again if the user scrolls the page(doesnt really do anything)
if(walk_elements) document.onscroll = counted_element_walker(document.body,"onscroll");

//check if the dom is modified and checks the changed elements again
if(mutation_check && walk_elements){
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
