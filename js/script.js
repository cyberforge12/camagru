var video = document.getElementById('cam');
var localMediaStream = null;
var selected_img = null;
var display_login = false;
var track = null;
var track_settings = null;
var video_ratio = null;
var snapshot_button = document.getElementById('snapshot');
var page = 1;

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
    document.getElementById('login_button').style.display = 'none';
    document.getElementById('profile_button').style.display = 'flex';
    document.getElementById('logout_button').style.display = 'flex';
    document.getElementById('login_form').style.display = 'none';
    document.getElementById('login_message').innerHTML = '';
}

function profile_icons_logout() {
    document.getElementById('profile_button').style.display = 'none';
    document.getElementById('logout_button').style.display = 'none';
    document.getElementById('login_button').style.display = 'flex';
}

function toggle_profile_icons(xhhtp) {
    if (xhhtp.readyState === 4 && xhhtp.status === 200)
    {
        let response = JSON.parse(xhhtp.response);
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
    let login = document.getElementById('login_username').value;
    let passw = document.getElementById('login_passw').value;
    let obj = {};
    obj.action = 'login';
    obj.login = login;
    obj.passw = passw;
    sendJSON(obj, toggle_profile_icons);
    check_session();
    loa
    console.log('Login button pressed');
}

function register_callback (xhttp) {
    if (xhttp.readyState === 4 && xhttp.status === 200)
    {
        let response = JSON.parse(xhttp.response);
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

function register_send() {
    let login = document.getElementById('login_username').value;
    let passw = document.getElementById('login_passw').value;
    let email = document.getElementById('login_email').value;
    let obj = {};
    obj.action = 'register';
    obj.login = login;
    obj.passw = passw;
    obj.email = email;
    sendJSON(obj, register_callback);
    console.log("Register button pressed again");
}

function register() {
    let email = document.getElementById('login_email');
    if (email.style.display === '')
        email.style.display = 'flex';
    else
        register_send();
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
            this.gallery.load_gallery();
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

function find_label(el) {
    var idVal = el.id;
    labels = document.getElementsByTagName('label');
    for( var i = 0; i < labels.length; i++ ) {
        if (labels[i].htmlFor == idVal)
            return labels[i];
    }
}

function toggle_like (event) {
    let elem = event.currentTarget;
    label = find_label(elem);
    if (elem.value === 'pressed') {
        elem.style.filter =  'invert(0%)';
        elem.value = '';
        sendJSON({'action': 'delete_like', 'id': elem.id}, e => {});
        if (label.innerHTML > 0)
            label.innerHTML -= 1;
    }
    else {
        elem.style.filter =  'invert(100%)';
        elem.value = 'pressed';
        sendJSON({'action': 'add_like', 'id': elem.id}, e => {});
        label.innerHTML = Number(label.innerHTML) + 1;
    }
    console.log('Like button ' + elem.id + ' pressed');
}

function add_like_button (holder, id, item) {
    let like_button = document.createElement('button');
    holder.appendChild(like_button);
    like_button.className = 'gallery_item_buttons button';
    like_button.id = 'like_' + id;
    like_button.style.backgroundSize = '100%';
    like_button.style.backgroundImage = "url('../img/likes.png')";
    like_button.style.backgroundRepeat = 'no-repeat';
    like_button.alt = 'Like button';
    like_button.onclick = toggle_like;
    let like_button_label = document.createElement('label');
    like_button_label.htmlFor = 'like_' + id;
    like_button_label.innerHTML = item.likes;
    holder.appendChild(like_button_label);
}

class Gallery {

    load_gallery() {
        page = 1;
        let new_gal = document.getElementById('gallery').cloneNode(false);
        document.getElementById('gallery').remove();
        document.getElementById('side').prepend(new_gal);
        sendJSON({'action': 'get_gallery', 'page' : page}, show_gallery);
    }
}

class GalleryItem {

}

class Comments {

    constructor(id) {
        this.id = id;
        this.holder = document.createElement('section');
        this.holder.id = ('comments_holder_' + this.id);
        this.holder.className = 'comments_holder';
        document.getElementById(id).appendChild(this.holder);

        this.comments = document.createElement('section');
        this.comments.className = 'comments';
        this.holder.appendChild(this.comments);

        this.comment_form = document.createElement('input');
        this.comment_form.className = 'comment_form';
        this.comment_form.style.display = 'none';
        this.holder.appendChild(this.comment_form);

        this.comment_button = document.createElement('button');
        this.holder.appendChild(this.comment_button);
        this.comment_button.className = 'comment_button';
        this.comment_button.id = ('comment_button_' + this.id);
        this.comment_button.innerHTML = 'Add comment';

        this.send_button = document.createElement('button');
        this.holder.appendChild(this.send_button);
        this.send_button.className = 'send_comment';
        this.send_button.id = ('send_comment_button_' + this.id);
        this.send_button.innerHTML = 'Send comment';
        this.send_button.style.display = 'none';

        this.comment_button.onclick = () => this.show_comment_form();
        this.send_button.onclick = () => this.send_comment();

        this.toggle_comments();
        this.get_comments();
    }

    toggle_comments () {
        if (this.holder.style.display === 'flex')
            this.holder.style.display = 'none';
        else {
            this.get_comments();
            this.holder.style.display = 'flex';
        }
    }

    show_comment_form () {
        this.comment_form.style.display = 'flex';
        this.comment_button.style.display = 'none';
        this.send_button.style.display = 'flex';
    }

    get_comments () {
        sendJSON({'action': 'get_comments', 'id' : this.id},
            (e) => this.get_comments_callback(e));
    }

    get_comments_callback (event) {
        console.log('get_comments_callback');
        if (event.readyState === 4 && event.status === 200)
        {
            let response = JSON.parse(event.response);
            if (response['status'] === 'OK')
            {
                response['comments'].forEach( (e, obj = this) => {
                    let comment = document.createElement('div');
                    obj.comments.appendChild(comment);
                    comment.innerHTML = e.comment;
                    let comment_info = document.createElement('section');
                    comment_info.className = 'comment_info';
                    obj.comments.appendChild(comment_info);
                    obj.add_info(comment_info, response);
                })
            }
            else
            {
                this.comments.innerHTML = response['message'];
                setTimeout(() => {this.comments.innerHTML = "";},
                    4 * 1000);
            }
        }
    }

    add_info(holder, item) {

        let div1 = document.createElement('div');
        div1.innerHTML = 'Created by';
        holder.appendChild(div1);

        let div2 = document.createElement('div');
        div2.innerHTML = item.user;
        holder.appendChild(div2);

        let div3 = document.createElement('div');
        div3.innerHTML = ' at ';
        holder.appendChild(div3);

        let div4 = document.createElement('div');
        div4.innerHTML = item.date;
        holder.appendChild(div4);
    }

    send_comment() {
        sendJSON({'action': 'add_comment', 'id': this.id,
            'data': this.comment_form.value}, (e) => this.send_comment_callback(e));
    }

    send_comment_callback (e) {
        if (e.readyState === 4 && e.status === 200)
        {
            let response = JSON.parse(e.response);
            let comment = document.createElement('div');
            this.comments.appendChild(comment);
            if (response['status'] === 'OK')
            {
                comment.innerHTML = this.comment_form.value;
                let comment_info = document.createElement('section');
                comment_info.className = 'comment_info';
                this.comments.appendChild(comment_info);
                add_info(comment_info, response);
            }
            else
            {
                this.comments.innerHTML = response['message'];
                setTimeout(() => {this.comments.innerHTML = ""},
                    4 * 1000);
            }
        }
    }
}

function add_comment_button (holder, id, item) {
    let comment_button = document.createElement('button');
    holder.appendChild(comment_button);
    let comments_class = new Comments(id);
    comment_button.className = 'gallery_item_buttons button';
    comment_button.id = 'comment_' + id;
    comment_button.style.backgroundSize = '100%';
    comment_button.style.backgroundImage = "url('../img/comments.png')";
    comment_button.style.backgroundRepeat = 'no-repeat';
    comment_button.alt = 'Comments button';
    comment_button.onclick = () => comments_class.toggle_comments();
    let comment_button_label = document.createElement('label');
    comment_button_label.htmlFor = 'comment_' + id;
    comment_button_label.innerHTML = item.comments;
    holder.appendChild(comment_button_label);
}

function delete_gallery_item_callback (xhhtp) {
    if (xhhtp.readyState === 4 && xhhtp.status === 200)
    {
        let response = JSON.parse(xhhtp.response);
        if (response['status'] === 'OK')
        {
            let gallery_item = document.getElementById(response.id);
            gallery_item.remove();
        }
    }
}

function delete_gallery_item (event) {
    obj = {};
    obj.action = 'delete';
    obj.id = (event.currentTarget.id.split('_'))[1];
    sendJSON(obj, delete_gallery_item_callback);
    console.log('Delete button ' + obj.id + ' pressed');
}

function add_actions(holder, item) {
    let id = item.photo_id;
    add_like_button(holder, id, item);
    add_comment_button(holder, id, item);
    if (item.delete == 1)
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
    div2.innerHTML = item.user;
    holder.appendChild(div2);

    let div3 = document.createElement('div');
    div3.innerHTML = ' at ';
    holder.appendChild(div3);

    let div4 = document.createElement('div');
    div4.innerHTML = item.date;
    holder.appendChild(div4);
}

function show_gallery(xhttp) {
    if (loading = document.getElementById('div_loading'))
        loading.remove();
    if (xhttp.readyState === 4 && xhttp.status === 200) {
        let response = JSON.parse(xhttp.response);
        if (response.rows > 0)
        {
            response.data.forEach(function (item, i, arr) {
                let gallery_item = document.createElement('section');
                document.getElementById('gallery').appendChild(gallery_item);
                gallery_item.id = item.photo_id;
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
            if (response.rows === 10)
                add_load_more_button();
        }
    }
}

function add_load_more_button () {
    let load_more_button = document.createElement('button');
    document.getElementById('gallery').appendChild(load_more_button);
    load_more_button.id = 'gallery_more';
    load_more_button.innerHTML = 'Load more...';
    load_more_button.addEventListener('click', load_more);
    page++;
}

function load_more () {
    document.getElementById('gallery_more').remove();
    let loading = document.createElement('div');
    document.getElementById('gallery').appendChild(loading);
    loading.id = 'div_loading';
    loading.innerHTML = 'Loading...';
    loading.style.textAlign = 'center';
    page++;
    sendJSON({'action': 'get_gallery', 'page' : page}, show_gallery);
    console.log('load more...');

}


function check_session () {
    let obj = {};
    obj.action = 'check_session';
    sendJSON(obj, toggle_profile_icons);
    console.log('Check_session called');
}

gallery = new Gallery();
document.onload = check_session();
document.onload = this.gallery.load_gallery();
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

