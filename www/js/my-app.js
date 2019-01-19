// Code for platform detection
var isMaterial = Framework7.prototype.device.ios === false;
var isIos = Framework7.prototype.device.ios === true;
var offline = true;

var playingOther = false;

var apptitle = 'Evergreen NG';

Template7.registerHelper('stringify', function (context){
    var s = JSON.stringify(context);
    //return s.replace(/'/g, '&#39;');
     return s.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
});

// Initialize app
var myApp = new Framework7(
    {
     precompileTemplates: true,
     template7Pages: true,
     modalTitle: "Evergreen NG"
 })
    
 var $$ = Dom7;

function init() {
  // Add view
  mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    domCache: true,
  });
/*
  // Handle Cordova Device Ready Event
  $$(document).on('deviceready', function deviceIsReady() {
    console.log('Device is ready!');
  });
*/
  $$(document).on('click', '.panel .search-link', function (e) {
    // Only change route if not already on the index
    //  It would be nice to have a better way of knowing this...
    var indexPage = $$('.page[data-page=index]');
    if (indexPage.hasClass('cached')) {
      mainView.router.load({
        pageName: 'index',
        animatePages: false,
        reload: true,
      });
    }
    
  });

  $$(document).on('click', '#favorites', function (e) {
    // @TODO fetch the favorites (if any) from localStorage
     $$('.framework7-root').removeClass('with-panel-left-reveal');
     $$('.panel-reveal').removeClass('active');
     $$('.panel-reveal').removeAttr("style");

    var favorites = JSON.parse(localStorage.getItem('favorites'));

    mainView.router.load({
      template: myApp.templates.favorites,
      animatePages: false,
      context: {
        tracks: favorites,
      },
      reload: true,
    });
  });

  //$$(document).on('submit', '#search', searchSubmit);
}

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;


// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

$$(document).on('input change', 'input[type="range"]', function (e) {
     $$('input#sliderVal').val(this.value);
 })

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    //check internet
    if (navigator.connection && navigator.connection.type == Connection.NONE) {
      $$('.fa-wifi').addClass('color-gray');    
      console.log('No Network'); 
  }
  else {
      // It's connected, set a flag and icon colors
      console.log('Network Available');
      offline = false;
      fetch_and_display_posts(); 
      if (isIos) $$('.fa-wifi').addClass('color-green');
      else $$('.fa-wifi').addClass('color-white');
  }
    
  document.addEventListener("offline", onOffline, false);
  document.addEventListener("online", onOnline, false);
//end device ready
});



function onOffline() {
    offline = true;
    $$('.loading-item').hide();
    myApp.addNotification({
       title: 'Connection Status: Offline',
       message: 'You are not connected to the internet.',
       hold: 20000
    });
    //$$('.try-load').show();
     $$(".try-load").css({"display": "block"}); 
    if (isIos) $$('.fa-wifi').removeClass('color-green').addClass('color-gray');
       else $$('.fa-wifi').removeClass('color-white').addClass('color-gray');

}

function onOnline() {
    // Show a toast notification to indicate the change
    myApp.addNotification({
        title: 'Connection Status',
        message: 'A previously connected device has come back online',
        hold: 9000
    });
   // $$('.try-load').hide();
    // Set the wifi icon colors to reflect the change
    if (isIos) $$('.fa-wifi').removeClass('color-gray').addClass('color-green');
    else $$('.fa-wifi').removeClass('color-gray').addClass('color-white');
    offline = false;
}
$$(document).on('click', '.t2', function (e) {
window.location.reload();
});

 $$(document).on('click', '#btnSearch', function (e) {
     var term = $$("#term").val();
     term = term.replace(/\s+/g, '+').toLowerCase();
     if (term.length==0) {
         myApp.alert("Please enter a search term.");
     }
     else {
        var mediaType = "track";
        var numResults = $$("#numResults").val()
        var url = "http://evergreen.busysinging.com/wp-json/wp/v2/posts?search=" + term +"&per_page=" + numResults;                 
        
          var xhr = new XMLHttpRequest();
           $$.ajax({
          //  dataType: 'json',
            url: url,
            beforeSend: function() {
              $$("#loading-search").show();             
           },
            success: function(data){
                console.log('Is A Success');
                console.log(data);
                 $$("#loading-search").hide();
               // myApp.alert("Number of results " + resp.length);
               data = data.replace(/\\n/g, "\\\\n")  
               .replace(/\\'/g, "\\\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\\\r")
               .replace(/\\t/g, "\\\\t")
               .replace(/\\b/g, "\\\\b")
               .replace(/\\f/g, "\\\\f");
              // remove non-printable and other non-valid JSON chars
              v = data.replace(/[\u0000-\u0019]+/g,""); 
              //console.log(v);
              
                mainView.router.load({
                    template: Template7.templates.listTemplate,
                    context: JSON.parse(v)
                });
            },
            error: function(data){
               // console.log(data);
                console.log("Error on ajax call " + xhr);
            }
        });
     }
      //if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
      //if(AdMob) AdMob.showInterstitial();  // uncomment to show add
 })

//load post onload FETCH LATEST
window.onload = function(){   document.addEventListener("deviceready", onDeviceReady, false); }
function onDeviceReady() { 
    //fetch_and_display_posts(); 
}

//keep post on index view after navigate away
myApp.onPageInit('index', function(page) {
   fetch_and_display_posts();  
});


function fetch_and_display_posts() {
    var uri ='http://busysinging.com/';
    var homequery = 'wp-json/wp/v2/posts/?per_page=20&filter[cat]=5';
     var full_url = 'http://evergreen.busysinging.com/wp-json/wp/v2/posts/?per_page=20';
    $$.ajax({
        url: full_url,
        cache: false,
        type: "GET",
       // dataType: "json",
       //timeout: 1000,
        async: false,
        beforeSend: function() {
           },
        success: function (msg) {
            $$('.loading-item').hide();
             msg = msg.replace(/\\n/g, "\\\\n")  
               .replace(/\\'/g, "\\\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\\\r")
               .replace(/\\t/g, "\\\\t")
               .replace(/\\b/g, "\\\\b")
               .replace(/\\f/g, "\\\\f");
           $$("#loading-more-post-image").hide();
           msg = JSON.parse(msg);
           console.log(msg);
              ///// remove non-printable and other non-valid JSON chars
            
            var html = "";
            var playlistdata = "";
            var have_playlist = false;
            var pnumber = 0;
            for (var count = 0; count < msg.length; count++) { pnumber++;
                var id = msg[count]['id'];
               // var title = msg[count]['title']['rendered'];
               // var content = msg[count]['content']['rendered'];
               // var link = msg[count]['guid']['rendered'];
               // var date = msg[count]['date'];
               /// var cat_id = msg[count]['categories'];
                var pid = msg[count]['id'];
                var thumbnail = msg[count]['thumbnail'];
                //var thumbnail = msg[count]['featured_image_url'];
                                                              console.log(thumbnail);
                var song_title = msg[count]['song_title'];
                var artist = msg[count]['artist'];
                var lyrics = msg[count]['lyrics'];
                var mp3_file = msg[count]['mp3_file'];
               var mp3check = msg[count]['mp3_file'] + msg[count]['id'];
                                                             
               if (mp3check.search(id)) 
               {           
                 var mp3_url =  ",\"mp3_file\": \" "+mp3_file+" \"";  //have MP3
                 var playlist_mp3 = mp3_file;
                 var cover = thumbnail;
                 var playlist_artist = artist;
                 var playlist_song = song_title;
                 have_playlist = true;
                 
               } else {
                   var mp3_url =  ""; 
                   have_playlist = false;
                   
               }

               var lyr = msg[count]['id'] + '  ' + msg[count]['lyrics'];
               lyrCheck = lyr.substring(1,30);
              // console.log(lyrCheck);
               if (lyrCheck.search(lyrics)) 
               {           
                 var lyrics_content =  "\"lyrics\": \" "+lyrics+" \",";  //have MP3
                  //console.log ('lyrics ='+ lyrics_content);
               } else {
                var lyrics_content =  ""; 
               // var lyrics_content =  "\"lyrics\": \" "+content+" \",";  //have MP3
                  // console.log ('empty lyrics ='+ lyrics_content);
               }
       
                html = html + "<a href='post-item.html' data-context='{ "+ lyrics_content +"\"song_title\": \" "+song_title+" \",\"id\": \" "+pid+" \",\"thumbnail\": \" "+thumbnail+" \", \"artist\": \" "+artist+" \" "+ mp3_url+"}\'><li class='item-content'><div class='item-media'><img src=' "+thumbnail +"' width='60px'><span class='item-number'><span class='post-num'>" +pnumber+"</span></span></div><div class='item-inner'><div class='item-title-row'><div class='item-title'> "+ song_title +"</div></div><div class='item-subtitle'>"+ artist +"</div></div></li></a>";
                //audioplaylist = + playlistdata.toString();
                if(have_playlist)
                playlistdata = playlistdata + "<li audiourl=\" "+ playlist_mp3 +" \" cover=\" "+ cover +"\" song = \"  "+ playlist_song+" \" artist=\""+ playlist_artist +" \" class=\" \">"+ playlist_mp3 +"</li>";
             }
            //$$('.swiper-wrapper').append(html);
           // console.log('DATA :'+playlistdata);
            $$('.playlist').append(playlistdata);
            $$('.media-item-list').append(html);
            $$('.total-count').append(pnumber.toString());

            newPlaylist();
            
            //console.log(pnumber);
            //console.log(html);          
        },
      error: function (jqXHR, exception) {
            var msg = '';
            $$('.loading-item').hide();
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
                $$('.try-load').show();
                $$('.loading-item').hide();
                myApp.alert(msg);
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
                //myApp.alert(msg);
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
                $$('.try-load').show();
                $$('.loading-item').hide();
               // myApp.alert(msg);
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
               // myApp.alert(msg);
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
                myApp.alert(msg);
                $$('.try-load').show();
                $$('.loading-item').hide();
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
               // myApp.alert(msg);
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
               // myApp.alert(msg);
            }
        },
        timeout: 1000 // sets timeout to 3 seconds


    });
}
//END FETCH LATEST

function fetch_and_display_more_posts($i) {
    var uri ='http://busysinging.com/';
    var homequery = 'wp-json/wp/v2/posts?&filter[cat]=4841&offset=' + $i;
    //var staticurl = 'http://busysinging.com/app/app-post.php/?offset=' + $i;
    var staticurl = 'http://evergreen.busysinging.com/wp-json/wp/v2/posts/?offset=' + $i;
    $$.ajax({
        url: staticurl,
        //cache: false,
        type: "GET",
       // dataType: "json",
        async: false,
         beforeSend: function() {
              $$("#loading-item").show();
           },
        success: function (msg) {
            $$('.loading-item').hide();
             msg = msg.replace(/\\n/g, "\\\\n")  
               .replace(/\\'/g, "\\\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\\\r")
               .replace(/\\t/g, "\\\\t")
               .replace(/\\b/g, "\\\\b")
               .replace(/\\f/g, "\\\\f");
           msg = JSON.parse(msg);
           console.log(staticurl);
           //console.log(msg);
              ///// remove non-printable and other non-valid JSON chars
           
            var html = "";
            var pnumber = $i;
                  for (var count = 0; count < msg.length; count++) { pnumber++;
                var id = msg[count]['id'];
               // var title = msg[count]['title']['rendered'];
               // var content = msg[count]['content']['rendered'];
               // var link = msg[count]['guid']['rendered'];
               // var date = msg[count]['date'];
               /// var cat_id = msg[count]['categories'];
                var pid = msg[count]['id'];
                var thumbnail = msg[count]['thumbnail'];
                var song_title = msg[count]['song_title'];
                var artist = msg[count]['artist'];
                var lyrics = msg[count]['lyrics'];
                var mp3_file = msg[count]['mp3_file'];
              
              var mp3check = msg[count]['mp3_file'] + msg[count]['id'];
               if (mp3check.search(id)) 
               {           
                 var mp3_url =  ",\"mp3_file\": \" "+mp3_file+" \"";  //have MP3
               } else {
                   var mp3_url =  ""; 
               }
               //console.log('MP3 : '+mp3_url);
               var lyr = msg[count]['id'] + '  ' + msg[count]['lyrics'];
               lyrCheck = lyr.substring(1,30);
              // console.log(lyrCheck);
               if (lyrCheck.search(lyrics)) 
               {           
                 var lyrics_content =  "\"lyrics\": \" "+lyrics+" \",";  ///have MP3
                  //console.log ('lyrics ='+ lyrics_content);
               } else {
                   var lyrics_content =  ""; 
                  // console.log ('empty lyrics ='+ lyrics_content);
               }
            //audioplaylist = + playlistdata.toString();
             html = html + "<a href='post-item.html' data-context='{ "+ lyrics_content +"\"song_title\": \" "+song_title+" \",\"thumbnail\": \" "+thumbnail+" \",\"id\": \" "+pid+" \", \"artist\": \" "+artist+" \" "+ mp3_url+"}\'><li class='item-content'><div class='item-media'><img src=' "+thumbnail +"' width='60px'><span class='item-number'><span class='post-num'>" +pnumber+"</span></span></div><div class='item-inner'><div class='item-title-row'><div class='item-title'> "+ song_title +"</div></div><div class='item-subtitle'>"+ artist +"</div></div></li></a>";
             }
            //$$('.swiper-wrapper').append(html);
            $$('.media-item-list').append(html);
            //console.log(html);          
        },
        error: function () {
        }
    });
}
//END FETCH MORE


$$(document).on('click', '#btnAudioPP', function (e) {
    playingOther = true;
    
//start
var music = document.getElementById('musicMP3'); // id for audio element
var duration = music.duration; // Duration of audio clip, calculated here for embedding purposes
var pButton = document.getElementById('btnAudioPP'); // play button
var playhead = document.getElementById('playhead'); // playhead
var scrub = document.getElementById('scrub'); // playhead
var timeline = document.getElementById('timeline'); // timeline

// timeline width adjusted for playhead
var timelineWidth = timeline.offsetWidth - playhead.offsetWidth;

// play button event listenter
pButton.addEventListener("click", this);

// timeupdate event listener
music.addEventListener("timeupdate", timeUpdate, false);

// makes timeline clickable
timeline.addEventListener("click", function(event) {
    moveplayhead(event);
    music.currentTime = duration * clickPercent(event);
}, false);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent(event) {
    return (event.clientX - getPosition(timeline)) / timelineWidth;
}

// makes playhead draggable
playhead.addEventListener('mousedown', mouseDown, false);
scrub.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);

// Boolean value so that audio position is updated only when the playhead is released
var onplayhead = false;

// mouseDown EventListener
function mouseDown() {
    onplayhead = true;
    window.addEventListener('mousemove', moveplayhead, true);
    music.removeEventListener('timeupdate', timeUpdate, false);
}

// mouseUp EventListener
// getting input from all mouse clicks 
function mouseUp(event) {
    if (onplayhead == true) {
        moveplayhead(event);
        window.removeEventListener('mousemove', moveplayhead, true);
        // change current time
        music.currentTime = duration * clickPercent(event);
        music.addEventListener('timeupdate', timeUpdate, false);
    }
    onplayhead = false;
}
// mousemove EventListener
// Moves playhead as user drags
function moveplayhead(event) {
    var newMargLeft = event.clientX - getPosition(timeline);

    if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
        playhead.style.marginLeft = newMargLeft + "px";
       
        $$("#scrub").css({"width":newMargLeft + "px"});        
    }
    if (newMargLeft < 0) {
        playhead.style.marginLeft = "0px";
       
        $$("#scrub").css({"width": "0px"});  
    }
    if (newMargLeft > timelineWidth) {
        playhead.style.marginLeft = timelineWidth + "px";
       
        $$("#scrub").css({"width":timelineWidth + "px"});  
    }
}

// timeUpdate
// Synchronizes playhead position with current point in audio
function timeUpdate() {
    var playPercent = timelineWidth * (music.currentTime / duration);
    playhead.style.marginLeft = playPercent + "px";
    scrub.style.width = playPercent + "px";
    
    if (music.currentTime == duration) {
        btnAudioPP.className = "";
        btnAudioPP.className = "play";
        music.currentTime = 0;
    }
     updatePlayhead();
}
function updatePlayhead() { 
    var playbacktime = $$('.playbacktime');
	var s = parseInt(music.currentTime % 60);
    var m = parseInt((music.currentTime / 60) % 60);
    s = (s >= 10) ? s : "0" + s;
    m = (m >= 10) ? m : "0" + m;
  // playbacktime.innerHTML = m + ':' + s ;
   if(m == 00 && s == 00) { 
      // console.log('loading....'); 
    }
   else {
      // playbacktime.append (m + ':' + s );
   }
    if(s == 5) {
   //console.log('Time : '+m + ':' + s );
    //if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
    //if(AdMob) AdMob.showInterstitial();  // uncomment to show add
    }

    if(m == 3) {
   //console.log('Time : '+m + ':' + s );
    //if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
    //if(AdMob) AdMob.showInterstitial();  // uncomment to show add
    }
}

//Play and Pause
function playAudio() {
    // start music
    if (music.paused) {
        music.play();

       
        
        // remove play, add pause
        btnAudioPP.className = "";
        btnAudioPP.className = "pause";
            var playPromise = music.play();
            if (playPromise !== undefined) {
            playPromise.then(function() {
                // Automatic playback started!
                //console.log('Playing');

            }).catch(function(error) {
                // Automatic playback failed.
                // Show a UI element to let the user manually start playback.
                var info_song = $$('.info-song').html();
                var info_name = $$('.info-name').html();
                var song_info = info_name+ ' - '+info_song;
                //myApp.alert('No Audio File Found for '+ song_info);
                if(info_song !== undefined) {
                myApp.addNotification({
                title: 'Try Again Later',
                message: 'Audio Unavailable for '+ song_info + 'Please Try Again.',
                hold: 10000
                });
                }
            });
            }
    } else { // pause music
        music.pause();
        // remove pause, add play
        btnAudioPP.className = "";
        btnAudioPP.className = "play";
    }
// In browsers that don’t yet support this functionality,
// playPromise won’t be defined.

}

// Gets audio file duration
music.addEventListener("canplaythrough", function() {
    duration = music.duration;
}, false);

// getPosition
// Returns elements left position relative to top-left of viewport
function getPosition(el) {
    return el.getBoundingClientRect().left;
}
playAudio();
//end
});

//favorites function
function addOrRemoveFavorite(e) {
  if (this.isFavorite) {
    // remove the favorite from the arrays
    this.favoriteIds.splice(this.favoriteIds.indexOf(this.id), 1);
    var favorites = this.favorites.filter(function(fave) {
      return fave.id !== this.id;
    }, this);
    this.favorites = favorites;
    this.isFavorite = false;
    // update the UI
    $$('.link.star').html('<i class="fa fa-star-o"></i>');
    var song = this.track.song_title;
    var artist = this.track.artist;
   // myApp.alert(artist + ' - ' + song + ' removed to favorites!');
    myApp.addNotification({
       title: 'Removed',
       message: artist + ' - ' + song + ' removed from favorites!',
       hold: 5000
    });
    
  } else {
    // add the favorite to the arrays
    if (this.favorites === null) this.favorites = [];
    this.favorites.push(this.track);
    this.favoriteIds.push(this.id);
    this.isFavorite = true;
    var song = this.track.song_title;
    var artist = this.track.artist;
    myApp.addNotification({
       title: 'Added',
       message: artist + ' - ' + song + ' added to favorites!',
       hold: 8000
    });
    // update the UI
    $$('.link.star').html('<i class="fa fa-star"></i>');
    console.log('fav click 2 added');
   // if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
    //if(AdMob) AdMob.showInterstitial();  // uncomment to show add   
  }
  if (this.favorites.length === 0) {
    // clear it out so the template knows it's empty when it returns
    //  as {{#if favorites}} sees an empty array as truthy
    this.favorites = null;
  }
  // save it back to localStorage

  localStorage.setItem('favorites', JSON.stringify(this.favorites));
  localStorage.setItem('favoriteIds', JSON.stringify(this.favoriteIds));
  // if we got here from the favorites page, we need to reload its context
  //  so it will update as soon as we go "back"
  if (this.fromPage === 'favorites') {
    // Reload the previous page
    mainView.router.load({
      template: myApp.templates.favorites,
     // url: 'post-playlist.html',
      context: {
        tracks: this.favorites,
      },
      reload: true,
      reloadPrevious: true,
    });
  }
}

// Media List Page Handling... install cordova media -- $ phonegap plugin add cordova-plugin-media --save
myApp.onPageInit('post-detail', function (page) {
      // fetch the favorites
  
  var track = page.context;

  var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  var favoriteIds = JSON.parse(localStorage.getItem('favoriteIds')) || [];
  var isFavorite = false;
  if (favoriteIds.indexOf(page.context.id) !== -1) {
    $$('.link.star').html('<i class="fa fa-star"></i>');
    isFavorite = true;
  }
  // set up a context object to pass to the handler
  var pageContext = {
    track: page.context,
    id: page.context.id,
    isFavorite: isFavorite,
    favorites: favorites,
    favoriteIds: favoriteIds,
    fromPage: page.fromPage.name,
  };
  $$('.link.star').on('click', addOrRemoveFavorite.bind(pageContext));

});

myApp.onPageInit('media', function (page) {
  
  var track = page.context;
  console.log(track);

  var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  var favoriteIds = JSON.parse(localStorage.getItem('favoriteIds')) || [];
  var isFavorite = false;
  if (favoriteIds.indexOf(page.context.id) !== -1) {
    $$('.link.star').html('<i class="fa fa-star"></i>');
    isFavorite = true;
  }
  // set up a context object to pass to the handler
  var pageContext = {
    track: page.context,
    id: page.context.id,
    isFavorite: isFavorite,
    favorites: favorites,
    favoriteIds: favoriteIds,
    fromPage: page.fromPage.name,
  };
  $$('.link.star').on('click', addOrRemoveFavorite.bind(pageContext));

});
myApp.onPageInit('list', function (page) {
//media control
    var x = false;
    $$(page.container).find('.preview').on('click', function (e) {
        var item = page.context[this.dataset.item];
        if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
        if(AdMob) AdMob.showInterstitial();  // uncomment to show add  
       // myApp.alert("Previewing " + item.song_title);
       // var media = new Media(item.mp3_file, function () {console.log("Media Success");},function (error)
        //{console.log("Media fail " + error)},null);

       // media.play();
        $$(this).find('i').removeClass('fa-play');
        $$(this).find('i').addClass('fa-pause');

       // setTimeout(function() {media.stop()},7000); //preview for 7 seconds
    });

    $$(page.container).find('.share').on('click', function (e) {
        /*
        mainView.router.load({
                    template: Template7.templates.itemTemplate,
                    //url: 'post-item.html',
                    context: item
                });

                */
        if (window.plugins && window.plugins.socialsharing) {
            window.plugins.socialsharing.share("Hey! My new favorite song is " + item.song_title + " check it out!",
                'Check this out', item.thumbnail, item.mp3_file,
                function () {
                    console.log("Share Success")
                },
                function (error) {
                    console.log("Share fail " + error)
                });
        }
        else myApp.alert("Share plugin not found");
    });
        
});


//panel menu
 $$(document).on('click', '#home', function (e) {  
 // myApp.mainView.router.back({ url: myApp.mainView.history[0], force: true });
   var indexPage = $$('.page[data-page=index]');
    if (indexPage.hasClass('cached')) {
      mainView.router.load({
        pageName: 'index',
        animatePages: false,
        reload: true,
      });
    }
    var navMainContent = $$('.nav-main').html();
     $$('.framework7-root').removeClass('with-panel-left-reveal');
     $$('.panel-reveal').removeClass('active');
     $$('.panel-reveal').removeAttr("style");
    // $$('.nav-fav').empty().append(navMainContent);
     $$('.navbar-inner').html(navMainContent);
     
    
    // $$('.total-count').append(ncounter.toString());
 });

    
 $$(document).on('click', '#about', function (e) {
     myApp.alert('Application for searching Nigerian music online.');
 });

$$(document).on('click', '.playlist-button', function (e) {
// @TODO fetch the favorites (if any) from localStorage
    playingOther = false;
    $$('.framework7-root').removeClass('with-panel-left-reveal');
    $$('.panel-reveal').removeClass('active');
    $$('.panel-reveal').removeAttr("style");
    //myApp.alert('Show Playlist');

var playlists = JSON.parse(localStorage.getItem('favorites'));
mainView.router.load({
    template: myApp.templates.listplaylist,
   // url: post-item.html,
    animatePages: false,
    context: {
    tracks: playlists,
    },
    reload: true,
});

});
    
    
 $$(document).on('click', '#settings', function (e) {
     myApp.alert('Show Settings');
 });


// On refresh
// Select Pull to refresh content
var ptrContent = $$('.pull-to-refresh-content');
// On refresh
ptrContent.on('refresh', function (e) {
    $$('.media-item-list').empty();
  // Emulate 1s loading
  setTimeout(function () {
  //console.log('refreshing');
    // Execute get_latest_posts to get new Posts
    fetch_and_display_posts();
    $$('.total-count').empty();
    var pnumber = 20;
    $$('.total-count').append(pnumber.toString());

  myApp.pullToRefreshDone();
}, 1000);
 $$('audio').each(function(){
       this.stop(); // Stop playing
       this.currentTime = 0; // Reset time
    });           
});

$$(document).on('click', '.load_more', function (e) {
        $$('.loading-item').show();

         var loaderIMG = '<img src="img/progressbar.gif" class="loader-image ">';
          $$('.total-count').css('opacity', 0);
          // $$('.loading-item').append(loaderIMG);
                
          var counter = +($$('.total-count').text());
          $$('.total-count').empty();
          //var counter = parseInt($$(this).attr("id")) + 10;  
          setTimeout(function () {
            fetch_and_display_more_posts(counter);
           // $$('.loading-item').show();
            $$('.total-count').css('opacity', 1);
            // $$('.loading-item').empty();

        }, 3500);
       
          newcounter = counter + 10;
           
           $$('.total-count').append(newcounter.toString());

           if(newcounter > 30) {
           //if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
           //if(AdMob) AdMob.showInterstitial();  // uncomment to show add  
           }

           if(newcounter > 80) {
           $$( ".load_more").addClass('disabled');
           $$(".load_more").html('Please Use Search Box');
           $$('.total-count').css('display', 'none');
            return false;
           }
           
           //console.log(newcounter);
          
      });



//detect ACTIVE PAGE
$$(document).on('pageInit', function(e){ // it is working on pageInit but I need it in load.
    var page = e.detail.page;
    if(page.name=="post-detail" || page.name=="media" || page.name=="list" ) {
        console.log(page.name);
        //myApp.alert(page.name);  
        $$('audio').each(function(){
       // this.play(); // Stop playing
       // this.currentTime = 0; // Reset time
      // if(AdMob) //uncomment to show add
       // AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} ); //uncomment to show add
          // show the interstitial later, e.g. at end of game level
       // if(AdMob) AdMob.showInterstitial();  // uncomment to show add


    });           
    } 
    if(page.name=="listplaylist")
        {
            newPlaylist(); 
        //if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
        //if(AdMob) AdMob.showInterstitial();  // uncomment to show add
            

        }          

});


///*
//Audio playlist player
function newPlaylist() {
 // inner variables
     // inner variables
    var song;
    var tracker = $$('.tracker');

    

    function initAudio(elem) {
        var url = elem.attr('audiourl');
        var title = elem.attr('song');
        var cover = elem.attr('cover');
        var artist = elem.attr('artist');
        //var id = elem.attr('artist');

        $$('.player .title').text(title);
        $$('.player .artist').text(artist);
        $$('.player .cover').css('background-image','url('+cover+')');

        //var img = $$('<img class="cover-image">'); //Equivalent: $(document.createElement('img'))
    
        song = new Audio(url);
        var duration = song.duration;

        var playhead = document.getElementById('pl-playhead'); // playhead
        var timeline = document.getElementById('pl-timeline'); // timeline
        var timelineWidth = timeline.offsetWidth - playhead.offsetWidth;

        var btnAudioPPL = document.getElementById('btnAudioPPL'); // play 

//play button event listenter
//btnAudioPPL.addEventListener("click", play);
//timeupdate event listener

song.addEventListener("timeupdate", timeUpdate, false);

// makes timeline clickable
timeline.addEventListener("click", function(event) {
    moveplayhead(event);
    song.currentTime = duration * clickPercent(event);
}, false);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent(event) {
    return (event.clientX - getPosition(timeline)) / timelineWidth;
}

// makes playhead draggable
playhead.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);

// Boolean value so that audio position is updated only when the playhead is released
var onplayhead = false;

// mouseDown EventListener
function mouseDown() {
    onplayhead = true;
    window.addEventListener('mousemove', moveplayhead, true);
    song.removeEventListener('timeupdate', timeUpdate, false);
}

// mouseUp EventListener
// getting input from all mouse clicks
function mouseUp(event) {
    if (onplayhead == true) {
        moveplayhead(event);
        window.removeEventListener('mousemove', moveplayhead, true);
        // change current time
        song.currentTime = duration * clickPercent(event);
        song.addEventListener('timeupdate', timeUpdate, false);
    }
    onplayhead = false;
}
// mousemove EventListener
// Moves playhead as user drags
function moveplayhead(event) {
    var newMargLeft = event.clientX - getPosition(timeline);

    if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
        playhead.style.marginLeft = newMargLeft + "px";
    }
    if (newMargLeft < 0) {
        playhead.style.marginLeft = "0px";
    }
    if (newMargLeft > timelineWidth) {
        playhead.style.marginLeft = timelineWidth + "px";
    }
}

// timeUpdate
// Synchronizes playhead position with current point in audio
function timeUpdate() {
    var playPercent = timelineWidth * (song.currentTime / duration);
    playhead.style.marginLeft = playPercent + "px";
    if (song.currentTime == duration) {
        btnAudioPPL.className = "";
        btnAudioPPL.className = "pl-play";
    }
    if(playingOther == true) { 
    stopAudio(); 
}
}

// Gets audio file duration
song.addEventListener("canplaythrough", function() {
    duration = song.duration;
}, false);

// getPosition
// Returns elements left position relative to top-left of viewport
function getPosition(el) {
    return el.getBoundingClientRect().left;
}

        // timeupdate event listener
        song.addEventListener('timeupdate',function (){
            var curtime = parseInt(song.currentTime, 10);
            
        });

        song.addEventListener('ended', function(){
        stopAudio();
        if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
        if(AdMob) AdMob.showInterstitial();  // uncomment to show add
        var next = $$('.playlist li.active').next();
        if (next.length == 0) {
            next = $$('.playlist li:first-child');
        }
        initAudio(next);

        playAudio();

        song.addEventListener('loadedmetadata', function() {
           
        });
        });

        $$('.playlist li').removeClass('active');      
        
        elem.addClass('active');
     
    }
 //$$('.playlist').find('li:first-child').addClass('active');
    
    //Play and Pause
    function playAudio() {
        // start music
        if (song.paused) {
            song.play();
            
            // remove play, add pause
            //tracker.slider("option", "max", song.duration);
            btnAudioPPL.className = "";
            btnAudioPPL.className = "pl-pause";
                  var playPromise = song.play();
                    if (playPromise !== undefined) {
                    playPromise.then(function() {
                        // Automatic playback started!
                        //console.log('Playing');
                    }).catch(function(error) {
                        // Automatic playback failed.
                        // Show a UI element to let the user manually start playback.
                        var info_song = $$('.info-song').html();
                        var info_name = $$('.info-name').html();
                        var song_info = info_name+ ' - '+info_song;
                        //myApp.alert('No Audio File Found for '+ song_info);
                        myApp.addNotification({
                        title: 'Missing Audio',
                        message: 'No Audio File Found for '+ song_info,
                        hold: 20000
                        });
                        $$('.fwd').click();
                    });
                    }
        } else { // pause music
            song.pause();
            // remove pause, add play
            btnAudioPPL.className = "";
            btnAudioPPL.className = "pl-play";
        }
    }
    function stopAudio() {
        song.pause();
    }

    

    // play click
    $$('.pl-play').click(function (e) {
        e.preventDefault();
        playAudio();
    });

    // pause click
    $$('.pl-pause').click(function (e) {
        e.preventDefault();
        stopAudio();
    });

    // forward click
    $$('.fwd').click(function (e) {
        e.preventDefault();

        stopAudio();

        var next = $$('.playlist li.active').next();
        if (next.length == 0) {
            next = $$('.playlist li:first-child');
        }
        initAudio(next);
        playAudio();

        if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
        if(AdMob) AdMob.showInterstitial();  // uncomment to show add
    });

   
    // rewind click
    $$('.rew').click(function (e) {
        e.preventDefault();

        stopAudio();

        var prev = $$('.playlist li.active').prev();
        if (prev.length == 0) {
            prev = $$('.playlist li:last-child');
        }
        initAudio(prev);
        playAudio();
    });

    // show playlist
    $$('.pl').click(function (e) {
        e.preventDefault();

        $$('.playlist').fadeIn(300);
    });

    // playlist elements - click
    $$('.playlist li').click(function () {
        stopAudio();
        initAudio($$(this));
        playAudio();
    });

    // initialization - first element in playlist
    var selectedp = document.getElementById('playlist-fav'); 
    
    initAudio($$('.playlist li:first-child'));

    $$(document).on('pageInit', function(e){ // it is working on pageInit but I need it in load.
    var page = e.detail.page;
    console.log(page.name);
    //if(page.name=="post-detail" || page.name=="media" || page.name=="listplaylist" ) {
    if(page.name=="listplaylist" ) {
        //myApp.alert(page.name);  
        stopAudio();
        
         var sounds = document.getElementsByTagName('audio');
         
        for(i=0; i<sounds.length; i++) sounds[i].pause();

        btnAudioPPL.className = "";
        btnAudioPPL.className = "play";
        
        $$('audio').each(function(){
       // this.stop(); // Stop playing
       // this.currentTime = 0; // Reset time
        }); 
        $$('.play').click();       


    } 
    
    

});

}


//back button
var exitApp = false, intval = setInterval(function (){exitApp = false;}, 2000);
document.addEventListener('backbutton', function(event){
  event.preventDefault(); // EDIT
 
    if (exitApp) {
            clearInterval(intval) 
            (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
        }
        else {
            exitApp = true
            history.back(1);
                myApp.addNotification({
                title: 'Exit Application?',
                message: 'Press the back button twice to exit.',
                hold: 4000
                });
        } 
  //navigator.app.exitApp(); // exit the app
}, false);


