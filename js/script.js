var video = document.getElementById('cam');
var localMediaStream = null;
var selected_img = null;
var display_login = false;
var track = null;
var video_ratio = null;
var snapshot_button = document.getElementById('snapshot');

function login() {
    let login = document.getElementById('login_username').value;
    let passw = document.getElementById('login_passw').value;
    let obj = {};
    obj.action = 'login';
    obj.login = login;
    obj.passw = passw;
    sendJSON(obj, (e) => profile.toggle_profile_icons(e));
    profile.check_session();
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
            profile.check_session();
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

function toggle_notify_callback(e) {
    if (e.readyState === 4 && e.status === 200)
    {
        let response = JSON.parse(e.response);
        if (response['status'] === 'OK')
            profile.open_profile();
    }
}

function toggle_notify() {
    let checkbox = document.getElementById('profile_notify');
    if (checkbox.checked)
        sendJSON({action: 'notify', value: 1}, toggle_notify_callback)
    else
        sendJSON({action: 'notify', value: 0}, toggle_notify_callback)
}

function logout() {
    sendJSON({"action": "logout"}, () => {location.reload()});
    console.log('OK - logout');
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
        login.style.removeProperty('display');
        display_login = false;
    }
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
        let data = canvas.toDataURL();
        obj.data = data.split(',')[1];
    }
    else {
        let file = document.getElementById('form_file').files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = split_file(reader, obj);
    }
    sendJSON(obj, (e) => {
        if (e.readyState === 4 && e.status === 200)
            this.gallery.load_gallery();
    });
}

function split_file (reader, obj) {
    obj.data = reader.result.split(',')[1];
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

class Profile {


    constructor() {
        this.login = undefined;
        this.profile_info = document.getElementById('profile');
        this.login_form = document.getElementById('login_form');
        this.login_button = document.getElementById('login_button');
        this.profile_button = document.getElementById('profile_button');
        this.logout_button = document.getElementById('logout_button');
        this.login_message = document.getElementById('login_message');

        this.check_session();
    }

    check_session () {
        sendJSON({action: "check_session"}, (e) => this.toggle_profile_icons(e));
        console.log('Check_session called');
    }

    profile_icons_login() {
        this.login_button.style.display = 'none';
        this.profile_button.style.display = 'flex';
        this.logout_button.style.display = 'flex';
        this.login_form.style.display = 'none';
        this.login_message.innerHTML = '';
    }

    profile_icons_logout() {
        document.getElementById('profile_button').style.display = 'none';
        document.getElementById('logout_button').style.display = 'none';
        document.getElementById('login_button').style.display = 'flex';
    }

    toggle_profile_icons(e) {
        if (e.readyState === 4 && e.status === 200)
        {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK')
            {
                this.profile_icons_login();
                this.login = e.response['login'];
                document.getElementById('main').style.display = 'flex';
                document.getElementById('main_not_logged').style.display = 'none';
                load_cam();
                console.log('Login OK: ' + e.response);
            }
            else
            {
                this.profile_icons_logout();
                if (response['status'] === 'ERROR_LOGIN')
                    document.getElementById('login_message').innerHTML = 'Incorrect login or password';
                console.log('Login Error: ' + e.response);
            }
        }
    }

    open_profile() {
        let profile = document.getElementById('profile');
        if (profile.style.display === "" || profile.style.display === "none")
        {
            profile.style.display = 'flex';
            sendJSON({'action': 'get_profile'}, (e) => {
                fill_profile(e);
            });
        }
        else {
            profile.style.display = 'none';
            document.getElementById('button_confirmation').innerHTML = 'Resend confirmation e-mail';
        }
        console.log('Open profile pressed');
    }

}

class Gallery {

    constructor() {
        this.page = 1;
        this.gallery = undefined;

        this.load_gallery();
    }

    load_gallery() {
        this.page = 1;
        if (this.gallery !== undefined)
            this.gallery.remove();
        this.gallery = document.createElement('section');
        this.gallery.id = 'gallery';
        document.getElementById('side').appendChild(this.gallery);
        sendJSON({'action': 'get_gallery', 'page' : this.page},
            (e) => this.load_gallery_callback(e));
    }

    load_gallery_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response.rows > 0)
            {
                response.data.forEach(function (item) {
                    let gallery_item = new GalleryItem(item);
                })
            }
            if (response.rows === 10)
                this.add_load_more_button();
        }
    }

    add_load_more_button () {
        let load_more_button = document.createElement('button');
        load_more_button.id = 'gallery_more';
        load_more_button.innerHTML = 'Load more...';
        load_more_button.addEventListener('click', () => this.load_more);
        this.gallery.appendChild(load_more_button);
        this.page += 1;
    }

    load_more () {
        document.getElementById('gallery_more').remove();
        let loading = document.createElement('div');
        document.getElementById('gallery').appendChild(loading);
        loading.id = 'div_loading';
        loading.innerHTML = 'Loading...';
        loading.style.textAlign = 'center';
        this.page += 1;
        sendJSON({'action': 'get_gallery', 'page' : page},
            this.load_gallery_callback);
        console.log('load more...');
    }
}

class GalleryItem {

    constructor(response) {
        this.likes = response["likes"];
        this.user_like = response["user_like"];
        this.comments = response["comments"];
        this.delete = response["delete"];
        this.id = response["photo_id"];
        this.gallery = document.getElementById('gallery');

        this.gallery_item = document.createElement('section');
        this.gallery_item.id = this.id;
        this.gallery_item.className = 'gallery_item';
        this.gallery.appendChild(this.gallery_item);

        let gallery_item_img = document.createElement('img');
        this.gallery_item.appendChild(gallery_item_img);
        gallery_item_img.src = 'data:image/png;base64, ' + response["photo"];

        let gallery_item_info = document.createElement('section');
        this.gallery_item.appendChild(gallery_item_info);
        gallery_item_info.className = 'gallery_item_info';
        add_info(gallery_item_info, response);

        this.actions = new GalleryItemActions(this);
    }

    delete_item_callback (e) {
        if (e.readyState === 4 && e.status === 200)
        {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK')
            {
                let gallery_item = document.getElementById(response.id);
                gallery_item.remove();
            }
        }
    }

    delete_item () {
        let obj = {action: 'delete',
            id: this.id
        };
        sendJSON(obj, (e) => this.delete_item_callback(e));
        console.log('Delete button ' + obj.id + ' pressed');
    }
}

class GalleryItemActions {

    constructor(item) {
        this.id = item.id;
        this.parent = item;
        this.holder = document.createElement('section');
        this.holder.className = 'gallery_item_actions_holder';
        item.gallery_item.appendChild(this.holder);
        this.create_like_button();
        this.create_comments_button();
        if (item.delete == 1)
            this.create_delete_button();
    }

    create_delete_button() {
        let delete_button = document.createElement('button');
        this.holder.appendChild(delete_button);
        delete_button.className = 'gallery_item_buttons button delete_button';
        delete_button.id = 'delete_' + this.id;
        delete_button.alt = 'Delete button';
        delete_button.onclick = () => this.parent.delete_item();
    }

    create_like_button()
    {
        let like_button = document.createElement('button');
        this.holder.appendChild(like_button);
        like_button.className = 'gallery_item_buttons button like_button';
        like_button.id = 'like_' + this.id;
        like_button.alt = 'Like button';
        like_button.onclick = toggle_like;
        let like_button_label = document.createElement('label');
        like_button_label.htmlFor = 'like_' + this.id;
        like_button_label.innerHTML = this.parent.likes;
        this.holder.appendChild(like_button_label);
    }

    create_comments_button()
    {
        let comment_button = document.createElement('button');
        this.holder.appendChild(comment_button);
        let comments_class = new Comments(this.id);
        comment_button.className = 'gallery_item_buttons button comments_button';
        comment_button.id = 'comment_' + this.id;
        comment_button.alt = 'Comments button';
        comment_button.onclick = () => comments_class.toggle_comments();
        let comment_button_label = document.createElement('label');
        comment_button_label.htmlFor = 'comment_' + this.id;
        comment_button_label.innerHTML = this.parent.comments;
        this.holder.appendChild(comment_button_label);
    }
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

        this.comment_form = document.createElement('textarea');
        this.comment_form.className = 'comment_form';
        this.comment_form.style.display = 'none';
        this.holder.appendChild(this.comment_form);

        this.comment_button = document.createElement('button');
        this.holder.appendChild(this.comment_button);
        this.comment_button.className = 'add_comment_button text_button';
        this.comment_button.id = ('comment_button_' + this.id);
        this.comment_button.innerHTML = 'Add comment';

        this.send_button = document.createElement('button');
        this.holder.appendChild(this.send_button);
        this.send_button.className = 'send_comment_button text_button';
        this.send_button.id = ('send_comment_button_' + this.id);
        this.send_button.innerHTML = 'Send comment';
        this.send_button.style.display = 'none';

        this.comment_button.onclick = () => this.show_comment_form();
        this.send_button.onclick = () => this.send_comment();
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
        this.send_button.style.display = 'block';
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
                response['comments'].forEach( e => {
                    let comment = document.createElement('div');
                    comment.className = 'comment';
                    this.comments.appendChild(comment);
                    comment.innerHTML = e.text;
                    let comment_info = document.createElement('section');
                    comment_info.className = 'gallery_item_info';
                    this.comments.appendChild(comment_info);
                    add_info(comment_info, e);
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
                this.comments.remove();
                this.comments = document.createElement('section');
                this.comments.className = 'comments';
                this.holder.insertBefore(this.comments, this.holder.firstChild);
                this.get_comments();
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
    div4.innerHTML = item.datetime;
    holder.appendChild(div4);
}

function check_template() {
    if (!('content' in document.createElement('template'))) {
        let warning = document.createElement('div');
        warning.innerHTML = "Your browser doesn't support templates. Use another browser";
        document.getElementsByTagName('header')[0].append(warning);
    }
}
check_template();
profile = new Profile();
gallery = new Gallery();

document.addEventListener('click', function(event) {
    let target = event.target;
    let profile_info = document.getElementById('profile');
    let profile_button = document.getElementById('profile_button');
    if (profile_info.style.display === "flex") {
        if (profile_info.contains(target))
            return ;
        else
            profile.open_profile();
    }
}, true);

function load_cam() {
    navigator.mediaDevices.getUserMedia({video: true})
        .then(function (stream) {
            if (stream)
            {
                video.srcObject = stream;
                localMediaStream = stream;
                document.getElementById('videoContainer').style.display = 'flex';
                track = localMediaStream.getTracks()[0];
                let track_settings = track.getSettings();
                video_ratio = track_settings.width / track_settings.height;
            }
        })
        .catch(function (reason) {
            if (reason)
                document.getElementById('upload').style.display = 'flex';
        });
}
