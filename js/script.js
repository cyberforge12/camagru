var video = document.getElementById('cam');
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

function login() {
    let login = document.getElementById('login_input').value;
    let passw = document.getElementById('passw_input').value;
    let obj = {};
    obj.action = 'login';
    obj.login = login;
    obj.passw = passw;
    sendJSON(obj, toggle_profile_icons);
    check_session();
    load_gallery();
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

function fill_profile (xhttp) {
    let response;
    if (xhttp.readyState === 4 && xhttp.status === 200) {
        response = JSON.parse(xhttp.response);
        document.getElementById('profile_username').innerHTML = response.login;
        document.getElementById('profile_email').innerHTML = response.email;
        if (response.is_confirmed === '1') {
            document.getElementById('profile_email_conf').innerHTML = 'YES';
            document.getElementById('profile_email_conf').style.color = 'green';
        } else {
            document.getElementById('profile_email_conf').innerHTML = 'NO';
            document.getElementById('profile_email_conf').style.color = 'red';
        }
        if (response.notify === true)
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
        snapshot_button.removeAttribute('disabled');
    else
        snapshot_button.setAttribute('disabled', '');
    console.log('Image added to cam!');
}

function snapshot() {
    let obj = {};
    obj.action = 'image_upload';
    obj.img_name = selected_img.id;
    if (localMediaStream) {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        obj.data = canvas.toDataURL().split(',')[1];
    }
    else {
        let file = document.getElementById('form_file').files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            obj.data = e.target.result.split(',')[1];};
    }
    sendJSON(obj, (e) => {
        if (e.readyState === 4 && e.status === 200)
            load_gallery();
    });
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

function toggle_like (event) {
    if (event.currentTarget.value === 'pressed') {
        event.currentTarget.style.filter =  'invert(0%)';
        event.currentTarget.value = '';
    }
    else {
        event.currentTarget.style.filter =  'invert(100%)';
        event.currentTarget.value = 'pressed';
    }
    console.log('Like button ' + event.currentTarget.id + ' pressed');
}

function add_like_button (holder, id, item) {
    let like_button = document.createElement('img');
    holder.appendChild(like_button);
    like_button.className = 'gallery_item_buttons';
    like_button.id = 'like_' + id;
    like_button.src = 'img/likes.png';
    like_button.alt = 'Like button';
    like_button.onclick = toggle_like;
    let like_button_label = document.createElement('label');
    like_button_label.htmlFor = 'like_' + id;
    like_button_label.innerHTML = item.likes;
    holder.appendChild(like_button_label);
}

function show_comments (event) {
    console.log('Comments button ' + event.currentTarget.id + ' pressed');
}

function add_comments_button (holder, id, item) {
    let comment_button = document.createElement('img');
    holder.appendChild(comment_button);
    comment_button.className = 'gallery_item_buttons';
    comment_button.id = 'comment_' + id;
    comment_button.src = 'img/comments.png';
    comment_button.alt = 'Comments button';
    comment_button.onclick = show_comments;
    let comment_button_label = document.createElement('label');
    comment_button_label.htmlFor = 'comment_' + id;
    comment_button_label.innerHTML = item.comments;
    holder.appendChild(comment_button_label);
}

function delete_gallery_item (event) {
    obj = {};
    obj.action = 'delete';
    obj.id = event.currentTarget.parentElement.id;
    console.log('Delete button ' + event.currentTarget.id + ' pressed');
}

function add_actions(holder, item) {
    let id = item.rowid;
    add_like_button(holder, id, item);
    add_comments_button(holder, id, item);
    if (item.delete === 1)
    {
        let delete_button = document.createElement('img');
        holder.appendChild(delete_button);
        delete_button.id = 'delete_' + id;
        delete_button.src = 'img/delete.png';
        delete_button.alt = 'Delete button';
        delete_button.className = 'gallery_item_buttons';
        delete_button.onclick = delete_gallery_item;
    }
}

function add_info(holder, item) {

    let div1 = document.createElement('div');
    div1.innerHTML = 'Created by';
    holder.appendChild(div1);

    let div2 = document.createElement('div');
    div2.innerHTML = item.photo_owner;
    holder.appendChild(div2);

    let div3 = document.createElement('div');
    div3.innerHTML = ' at ';
    holder.appendChild(div3);

    let div4 = document.createElement('div');
    div4.innerHTML = item.date;
    holder.appendChild(div4);
}

function show_gallery(xhttp) {
    let response;
    if (xhttp.readyState === 4 && xhttp.status === 200) {
        response = JSON.parse(xhttp.response);
        if (response.rows > 0)
        {
            response.data.forEach(function (item, i, arr) {
                let gallery_item = document.createElement('section');
                document.getElementById('gallery').appendChild(gallery_item);
                gallery_item.id = item.rowid;
                gallery_item.className = 'gallery_item';
                let gallery_item_img = document.createElement('img');
                gallery_item.appendChild(gallery_item_img);
                gallery_item_img.src = 'data:image/png;base64, ' + item.photo;
                let gallery_item_info = document.createElement('section');
                gallery_item.appendChild(gallery_item_info);
                gallery_item_info.className = 'gallery_item_info';
                add_info(gallery_item_info, item);
                let gallery_item_actions = document.createElement('section');
                gallery_item.appendChild(gallery_item_actions);
                gallery_item_actions.className = 'gallery_item_actions_holder';
                add_actions(gallery_item_actions, item);
            })
            if (response.rows == 10)
                document.getElementById('gallery_more').removeAttribute('hidden');
            else
                document.getElementById('gallery_more').setAttribute('hidden');
        }
    }
}

function load_gallery() {
    let new_gal = document.getElementById('gallery').cloneNode(false);
    document.getElementById('gallery').remove();
    document.getElementById('side').prepend(new_gal);
    sendJSON({'action': 'get_gallery', 'page' : page}, show_gallery);
}


function check_session () {
    let obj = {};
    obj.action = 'check_session';
    sendJSON(obj, toggle_profile_icons);
    console.log('Check_session called');
}

document.onload = check_session();
document.onload = load_gallery();
navigator.mediaDevices.getUserMedia({video: true})
    .then(function (stream) {
        if (stream)
        {
            video.srcObject = stream;
            localMediaStream = stream;
            document.getElementById('videoContainer').style.display = 'flex';
            track = localMediaStream.getTracks()[0];
            track_settings = track.getSettings();
            video_ratio = track_settings.width / track_settings.height;
        }
    })
    .catch(function (reason) {
        if (reason)
            document.getElementById('upload').style.display = 'flex';
    });

var test = document.getElementById('test');
test.onclick = function () {
    alert('Thank you!');
    test.style.backgroundColor = 'green';
}

