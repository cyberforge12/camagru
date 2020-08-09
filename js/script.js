var video = document.getElementById('cam');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var localMediaStream = null;
var selected_img = null;
var display_login = false;
var track = null;
var track_settings = null;
var video_ratio = null;
var snapshot_button = document.getElementById('snapshot');
var pic_submit_button = document.getElementById('upload_button');

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

function login_form_toggle() {
    var login = document.getElementById('login_form');
    if (!display_login)
    {
        login.style.display = 'flex';
        display_login = true;
    }
    else
    {
        login.style.display = '';
        display_login = false;
    }
}

function profile_icons_login() {
    document.getElementById('login_icon').hidden = true;
    document.getElementById('profile_icon').hidden = false;
    document.getElementById('logout_icon').hidden = false;
    document.getElementById('login_form').style.display = '';
    document.getElementById('login_message').innerHTML = '';
}

function profile_icons_logout() {
    document.getElementById('profile_icon').hidden = true;
    document.getElementById('logout_icon').hidden = true;
    document.getElementById('login_icon').hidden = false;
}

function toggle_profile_icons(xhhtp) {
    if (xhhtp.readyState === 4 && xhhtp.status === 200)
    {
        response = JSON.parse(xhhtp.response);
        if (response['status'] === 'OK')
        {
            profile_icons_login();
            console.log('Login OK: ' + xhhtp.response);
        }
        else
        {
            profile_icons_logout();
            if (response['status'] === 'ERROR_LOGIN')
                document.getElementById('login_message').innerHTML = 'Incorrect login or password';
            console.log('Login Error: ' + xhhtp.response);
        }
    }
}

function hide_profile() {
    console.log('Profile button will be shown');
}

function login() {
    let login = document.getElementById('login_input').value;
    let passw = document.getElementById('passw_input').value;
    let obj = {};
    obj.action = 'login';
    obj.login = login;
    obj.passw = passw;
    sendJSON(obj, toggle_profile_icons);
    check_session();
    console.log('Login button pressed');
}

function register_callback (xhttp) {
    if (xhttp.readyState === 4 && xhttp.status === 200)
    {
        response = JSON.parse(xhttp.response);
        if (response['status'] === 'OK')
        {
            document.getElementById('login_message').innerHTML = '';
            login_form_toggle();
            login();
            check_session();
        }
        else
            document.getElementById('login_message').innerHTML =
                response['message'];
    }
}

function register() {
    let login = document.getElementById('login_input').value;
    let passw = document.getElementById('passw_input').value;
    let obj = {};
    obj.action = 'register';
    obj.login = login;
    obj.passw = passw;
    sendJSON(obj, register_callback);
    console.log("Register button pressed");
}

function fill_profile (xhhtp) {
    let response;
    if (xhhtp.readyState === 4 && xhhtp.status === 200) {
        response = JSON.parse(xhhtp.response);
        document.getElementById('profile_username').innerHTML = response.login;
        document.getElementById('profile_email').innerHTML = response.email;
        if (response.is_confirmed === '1') {
            document.getElementById('profile_email_conf').innerHTML = 'YES';
            document.getElementById('profile_email_conf').style.color = 'green';
        } else {
            document.getElementById('profile_email_conf').innerHTML = 'NO';
            document.getElementById('profile_email_conf').style.color = 'red';
        }
        if (response.notify == true)
            document.getElementById('profile_notify').checked;
    }
    console.log('Show profile');
}

function resend_confirmation() {
    sendJSON({"action": "resend"}, () => {
        document.getElementById('button_confirmation').innerHTML = 'Confirmation sent';
    });
}

function open_profile() {
    profile = document.getElementById('profile');
    if (profile.style.display === '')
    {
        profile.style.display = 'flex';
        sendJSON({'action': 'get_profile'}, (e) => {
            fill_profile(e);
        });
    }
    else {
        profile.style.display = '';
        document.getElementById('button_confirmation').innerHTML = 'Resend confirmation e-mail';
    }
    console.log('Open profile pressed');
}

function logout() {
    sendJSON({"action": "logout"}, () => {location.reload()});
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

function select_img(item) {
    if (selected_img)
    {
        if (selected_img === item)
        {
            selected_img.style.border = '';
            selected_img = null;
        }
        else
        {
            item.style.border = '3px solid red';
            selected_img.style.border = '';
            selected_img = item;
        }
    }
    else
    {
        item.style.border = '3px solid red';
        selected_img = item;
    }
    if (selected_img)
    {
        snapshot_button.removeAttribute('disabled');
        pic_submit_button.removeAttribute('disabled');
    }
    else
    {
        snapshot_button.setAttribute('disabled', '');
        pic_submit_button.setAttribute('disabled', '');
    }
    console.log('Image added to cam!');
}

function clear_img() {
    console.log('Image cleared');

}

function snapshot() {
    if (localMediaStream && context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.drawImage(selected_img, 0, 0, 50, 50);
        canvas.src = canvas.toDataURL('img/webp');
    }
}

function parse_gallery(e) {
    e.forEach((elem) => {
       alert (elem);
    });
}

function load_gallery() {
    var request = JSON.stringify({"action": "get_gallery"});
    var xhhtp = new XMLHttpRequest();
    xhhtp.onreadystatechange = e => parse_gallery(e);
    xhhtp.open('POST', 'gallery.php', true);
    xhhtp.setRequestHeader('Content-Type', "application/json");
    xhhtp.send(request);
    return xhhtp.response;
}

function sendJSON(obj, callback) {
    if (typeof obj !== "object")
        console.log('Can\'t send non-object');
    else
    {
        var request = JSON.stringify(obj);
        var xhhtp = new XMLHttpRequest();
        xhhtp.onreadystatechange = function () { callback(xhhtp) };
        xhhtp.open('POST', 'upload.php', true);
        xhhtp.setRequestHeader('Content-Type', "application/json");
        xhhtp.send(request);
        return xhhtp.response;
    }
}

function upload_file() {
    var file = document.getElementById('form_file');
    var obj = {'file':file, 'img_name':selected_img.src, };
    return sendJSON(obj, null);
}

function upload_fetch() {
    let file = document.getElementById('form_file').files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    let obj = {};
    obj.img_name = selected_img.id;
    obj.action = 'image_upload';
    reader.onload = e => {
        obj.content = e.target.result.split(',')[1];
        let request = JSON.stringify(obj);
        return fetch('upload.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: request,
        })
            .then((response) => response.json())
            .then((data) => {
                document.getElementById('upload')
                console.log(data['image']);
                return data;
            })
            .catch((e) => e);
    };
}

function like($item) {
}

function check_session () {
    let obj = {};
    obj.action = 'check_session';
    sendJSON(obj, toggle_profile_icons);
    console.log('Check_session called');
}

document.onload = check_session();

navigator.mediaDevices.getUserMedia({video: true})
    .then(function (stream) {
        if (stream)
        {
            video.srcObject = stream;
            localMediaStream = stream;
            document.getElementById('snapshot').hidden = false;
            track = localMediaStream.getTracks()[0];
            track_settings = track.getSettings();
            video_ratio = track_settings.width / track_settings.height;
        }
    })
    .catch(function (reason) {
        if (reason)
        {
            video.style.backgroundColor = 'red';
            document.getElementById('upload').hidden = false;
        }
    });

var test = document.getElementById('test');
test.onclick = function () {
    alert('Thank you!');
    test.style.backgroundColor = 'green';
}

document.getElementById('login_icon').innerHTML =
    '<object type="image/svg+xml" data="img/login.svg"></object>'
