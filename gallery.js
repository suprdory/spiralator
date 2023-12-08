
function add_image(n) {
    
    var elemDiv = document.createElement('div');
    elemDiv.style.cssText =
        'text-align:center;';
    elemDiv.style.width =
        imageWidth+'px'

    const image = document.createElement('img');
    image.loading = "lazy"
    image.src = galleryAPIurl + '/get_image?n=' + n;
    image.width = imageWidth
    image.height = imageWidth
    // image.style.maxWidth="100%";
    // image.style.cssText =
    //     'margin-left: auto; margin-right: auto;';
    elemDiv.appendChild(image);

    let elemName = document.createElement('p');
    elemName.innerText = "Name";
    elemName.classList.add("name")

    let elemComment = document.createElement('p');
    elemComment.innerText = "Comment";
    elemComment.classList.add("comment")

    let elemID = document.createElement('p');
    elemID.innerText = "ID";
    elemID.classList.add("name")

    fetch(galleryAPIurl + '/get_meta?n=' + n)
        .then(response => response.json())
        .then(data => {
            elemName.innerText = data.name;
            elemComment.innerText = data.comment;
            elemID.innerText=data.id;

            if (elemComment.innerText != '') {
                console.log(elemComment.innerText)
                elemDiv.appendChild(elemComment);
            }
            if (elemName.innerText != '') {
                elemDiv.appendChild(elemName);
            }
            if (dispID){
            if (elemID.innerText != '') {
                var button = document.createElement("BUTTON");
                button.innerText='Delete '+data.id
                button.addEventListener('click', () => {
                    // alert('Oh, you clicked me!')
                    del_image(data.id);
            })
                button.classList.add("delButton")

                elemDiv.appendChild(elemID);
                elemDiv.appendChild(button)
            }}

            // console.log(data)
        });

    document.body.appendChild(elemDiv);
}

function del_image(id){
    fetch(galleryAPIurl + '/del_image?id=' + id+'&pw='+pw)
        // .then(response => response.json())
        .then(data => {
            console.log(data)
        }
        )
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const dispID = urlParams.get('id');
const pw = urlParams.get('pw');

let imageWidth = Math.min(window.innerWidth, 1080,window.innerHeight*0.95)
document.querySelector(':root').style.setProperty('--nameSize', 10 + 'pt')
document.querySelector(':root').style.setProperty('--commentSize', 10 + 'pt')

for (let i = 0; i < 100; i++) {
    add_image(i);
}

// for (let i = 0; i < 40; i++) {
//     add_comments(i);
// }