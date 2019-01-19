var admobid = {};

if( /(android)/i.test(navigator.userAgent) ) {
  admobid = { // for Android
    banner: '',
    interstitial: ''
   // rewardvideo: '',
  };
} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
  admobid = { // for iOS
     banner: '',
    interstitial: ''
   // rewardvideo: '',
  };
} else {
  admobid = { // for Windows Phone
    banner: '',
    interstitial: ''
   // rewardvideo: '',
  };
}

function initApp() {
  if (! AdMob ) { alert( 'admob plugin not ready' ); return; }

  // this will create a banner on startup
  AdMob.createBanner( {
    adId: admobid.banner,
    position: AdMob.AD_POSITION.BOTTOM_CENTER,
    isTesting: true, // TODO: remove this line when release
    overlap: false,
    offsetTopBar: false,
    bgColor: 'black'
  } );

  // this will load a full screen ad on startup
  AdMob.prepareInterstitial({
    adId: admobid.interstitial,
    //isTesting: true, // TODO: remove this line when release
    autoShow: false
  });
  if(AdMob) AdMob.showInterstitial();


}

if(( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) {
    document.addEventListener('deviceready', initApp, false);
} else {
    initApp();
}