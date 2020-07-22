// let video = document.getElementById("cam");

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: true})
        .then(function (stream) {
            video.srcObject = stream;
        })
        .catch(function (error) {
            document.getElementById("cam").innerText = "Can't access webcam!";
        })
}


function change_style() {
    main = document.getElementById('content');
    main.style.fontSize = '200px';

}

function reduce_font() {
    document.getElementById('content').style.fontSize

}
