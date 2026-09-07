/* Rasterize reusable SVG resources once at their authored resolution.
   Retain original objects for diagnostics and fall back if Canvas is unavailable. */
(() => {
'use strict';
const assets=window.TweetyAssets;
if(new URLSearchParams(location.search).get('cache')==='0')return;
assets.ready=assets.ready.then(()=>{
 for(const role of ['egg_0','egg_1','egg_2','egg_3','egg_4','stone_side','pressure_beam','background','helper_target','status_label']){
  const source=assets.images[role];if(!source)continue;
  try{const surface=document.createElement('canvas');surface.width=source.naturalWidth;surface.height=source.naturalHeight;if(!surface.width||!surface.height)continue;
   const context=surface.getContext('2d');if(!context)continue;context.drawImage(source,0,0);assets.images[role]=surface;
  }catch{/* Keep original SVG renderer. */}
 }
});
})();
