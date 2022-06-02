
function add_image(n) {
    var elemDiv = document.createElement('div');
    elemDiv.style.cssText = 
    'text-align:center;';

    const image = document.createElement('img');
    image.loading = "lazy"
    image.src = galleryAPIurl + '/get_image?n=' + n;
    // image.onerror = "this.onerror=null;this.src='/home/metatron/projects/spiralator/img/android-icon-192x192.png';"
    // image.width="800"

    // image.style.cssText =
    //     'margin-left: auto; margin-right: auto;';
    
    elemDiv.appendChild(image);
    document.body.appendChild(elemDiv);
}

for (let i=0;i<40;i++){
    add_image(i)
}
