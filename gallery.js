
function add_image(n) {
    var elemDiv = document.createElement('div');
    elemDiv.style.cssText = 
    'text-align:center;';

    const image = document.createElement('img');
    image.src = galleryAPIurl + '/get_image?n=' + n;
    image.width="600"
    // image.style.cssText =
    //     'margin-left: auto; margin-right: auto;';
    
    elemDiv.appendChild(image);
    document.body.appendChild(elemDiv);
}

for (let i=0;i<5;i++){
    add_image(i)
}