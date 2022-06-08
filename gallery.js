
function add_image(n) {
    var elemDiv = document.createElement('div');
    elemDiv.style.cssText = 
    'text-align:center;';

    const image = document.createElement('img');
    image.loading = "lazy"
    image.src = galleryAPIurl + '/get_image?n=' + n;
    image.width=window.innerWidth
    // image.style.maxWidth="100%";
    // image.style.cssText =
    //     'margin-left: auto; margin-right: auto;';
    elemDiv.appendChild(image);

    let elemName= document.createElement('p');
    elemName.innerText="Name";
    elemName.classList.add("name")

    let elemComment = document.createElement('p');
    elemComment.innerText = "Comment";
    elemComment.classList.add("comment")

    fetch(galleryAPIurl + '/get_meta?n=' + n)
        .then(response => response.json())
        .then(data => {
            elemName.innerText=data.name;
            elemComment.innerText=data.comment;
            if (elemComment.innerText != '') {
                console.log(elemComment.innerText)
                elemDiv.appendChild(elemComment);
            }
            if (elemName.innerText != '') {
                elemDiv.appendChild(elemName);
            }

            // console.log(data)
        });

    document.body.appendChild(elemDiv);
}
document.querySelector(':root').style.setProperty('--nameSize', 10 + 'pt')
document.querySelector(':root').style.setProperty('--commentSize', 10 + 'pt')

for (let i=0;i<40;i++){
    add_image(i);
}

// for (let i = 0; i < 40; i++) {
//     add_comments(i);
// }