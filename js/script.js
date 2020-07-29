var video = document.getElementById('cam');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var localMediaStream = null;

navigator.mediaDevices.getUserMedia({video: true})
    .then(function (stream) {
        if (stream)
        {
            video.srcObject = stream;
            localMediaStream = stream;
        }
    })
    .catch(function (reason) {
        if (reason)
            video.style.backgroundColor = 'red';
    });

var test = document.getElementById('test');
console.log('test');
test.onclick = function () {
    alert('Thank you!');
    test.style.backgroundColor = 'green';
}

function test_over(item) {
    console.log('over');
    console.log(item);
    item.style.backgroundColor = 'blue';
}

function test_leave(item) {
    console.log('leave');
    console.log(item);
    item.style.backgroundColor = 'gray';
}

var display_login = false;

function login(item) {
    var login = document.getElementById('login_form');
    if (!display_login)
    {
        login.style.display = 'flex';
        display_login = true;
    }
    else
    {
        login.style.display = 'none';
        display_login = false;
    }
    console.log("OK - login");
    console.log(item);
}

function open_profile() {
    console.log('OK - open_profile');
}

function logout() {
    console.log('OK - logout');
}

// var video = document.getElementById("cam");
//
// if (navigator.mediaDevices.getUserMedia) {
//     navigator.mediaDevices.getUserMedia({video: true})
//         .then(function (stream) {
//             video.srcObject = stream;
//         })
//         .catch(function (error) {
//             document.getElementById("cam").innerText = "Can't access webcam!";
//         })
// }


function reduce_font() {
    document.getElementById('content').style.fontSize

}

function form_login(email, passw) {

    alert('FORM OK!');

}

function add_img() {
    snapshot();
    console.log('Image added to cam!');
}

function clear_img() {
    console.log('Image cleared');

}

function snapshot() {
    if (localMediaStream && context) {
        context.drawImage(video, 0, 0);
        canvas.src = canvas.toDataURL('img/webp');
    }
}