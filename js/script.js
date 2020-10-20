var video = document.getElementById('cam');
var localMediaStream = null;
var selected_img = null;
var display_login = false;
var track = null;
var video_ratio = null;
var snapshot_button = document.getElementById('snapshot');

function resend_confirmation() {
    sendJSON({"action": "resend"}, () => {
        document.getElementById('button_confirmation').innerHTML = 'Confirmation sent';
    });
}

function logout() {
    sendJSON({"action": "logout"}, () => {
        location.reload()
    });
}

function login_form_toggle() {
    let login = document.getElementById('login_form');
    if (!display_login) {
        login.style.display = 'flex';
        display_login = true;
    } else {
        login.style.removeProperty('display');
        display_login = false;
    }
}

function select_img(item) {
    if (selected_img) {
        if (selected_img === item) {
            selected_img.style.border = '';
            selected_img = null;
        } else {
            item.style.border = '3px solid red';
            selected_img.style.border = '';
            selected_img = item;
        }
    } else {
        item.style.border = '3px solid red';
        selected_img = item;
    }
    if (selected_img)
        snapshot_button.removeAttribute('disabled');
    else
        snapshot_button.setAttribute('disabled', '');
}

function snapshot_upload_callback (e) {
    if (e.readyState === 4 && e.status === 200) {
        let response = JSON.parse(e.response);
        if (response['status'] === 'OK') {
            this.gallery.load_gallery();
        }
        else {
            let main = document.getElementById('main');
            let message = document.createElement('div');
            main.appendChild(message);
            message.innerHTML = response['message'];
        }
    }
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
        sendJSON(obj, e => snapshot_upload_callback(e))
    } else {
        let file = document.getElementById("form_file");
        if ( /\.(jpe?g|png|gif)$/i.test(file.files[0].name) === false )
            alert("Invalid file! Please, upload an image (jpeg, png or gif).");
        else if (file) {
            let reader = new FileReader();
            reader.onload = (e) => split_file(e, reader, obj);
            reader.readAsDataURL(file.files[0]);
        }
    }
}

function split_file(e, reader, obj) {
    let str = "";
    if (reader.result) {
        str = reader.result;
        obj.data = str.split(',')[1];
        sendJSON(obj, e => snapshot_upload_callback(e));
    }
}

function sendJSON(obj, callback) {
    if (typeof obj !== "object")
        console.log(obj);
    else {
        let request = JSON.stringify(obj);
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            callback(xhttp)
        };
        xhttp.open('POST', 'upload.php', true);
        xhttp.setRequestHeader('Content-Type', "application/json");
        xhttp.send(request);
        return xhttp.response;
    }
}

class Profile {


    constructor() {
        this.login_name = undefined;
        this.login_input = document.getElementById('login_username');
        this.profile_info = document.getElementById('profile');
        this.login_form = document.getElementById('login_form');
        this.login_button = document.getElementById('login_button');
        this.profile_button = document.getElementById('profile_button');
        this.logout_button = document.getElementById('logout_button');
        this.login_message = document.getElementById('login_message');
        this.profile_message = document.getElementById('profile_message');
        this.email = document.getElementById('login_email');
        this.passw = document.getElementById('login_passw');

        this.check_session();
    }

    login() {
        this.login_input.style.display = 'flex';
        this.passw.style.display = 'flex';
        this.email.style.display = 'none';
        if (this.login_input.validity.valid && this.passw.validity.valid) {
            sendJSON({
                    action: 'login',
                    login: this.login_input.value,
                    passw: this.passw.value
                },
                (e) => profile.toggle_profile_icons(e));
            profile.check_session();
        }

    }

    check_session() {
        sendJSON({action: "check_session"}, (e) => this.toggle_profile_icons(e));
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
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK') {
                gallery.load_gallery();
                this.profile_icons_login();
                profile.login_name = response['login'];
                document.getElementById('main').style.display = 'flex';
                document.getElementById('main_not_logged').style.display = 'none';
                load_cam();
            } else {
                this.profile_icons_logout();
                if (response['status'] === 'ERROR_LOGIN')
                    document.getElementById('login_message').innerHTML = 'Incorrect login or password';
            }
        }
    }

    open_profile_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            document.getElementById('profile_username').innerHTML = response.login;
            document.getElementById('profile_email').innerHTML = response.email;
            if (response.is_confirmed === '1') {
                document.getElementById('profile_email_conf').innerHTML = 'YES';
                document.getElementById('profile_email_conf').style.color = 'green';
            } else {
                document.getElementById('profile_email_conf').innerHTML = 'NO';
                document.getElementById('profile_email_conf').style.color = 'red';
            }
            if (response.notify === "1")
                document.getElementById('profile_notify').checked = true;
        }
    }


    open_profile() {
        if (this.profile_info.style.display === "" ||
            this.profile_info.style.display === "none") {
            this.profile_info.style.display = 'flex';
            sendJSON({'action': 'get_profile'}, (e) => {
                this.open_profile_callback(e);
            });
        } else {
            this.profile_info.style.display = 'none';
            document.getElementById('button_confirmation').innerHTML = 'Resend confirmation e-mail';
        }
    }

    reset_password_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let message = document.getElementById('login_message');
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK')
                message.style.color = 'green';
            else
                message.style.color = 'red';
            message.innerHTML = response['message'];
            setTimeout(() => {
                message.innerHTML = "";
                profile.email.value = "";
                },
                4 * 1000);
        }
    }

    reset_password() {
        this.login_input.style.display = 'flex';
        this.email.style.display = 'flex';
        this.passw.style.display = 'none';
        if (this.login_input.validity.valid && this.email.validity.valid) {
            sendJSON({
                    action: 'reset',
                    login: this.login_input.value,
                    email: this.email.value
                },
                (e) => this.reset_password_callback(e));
        }
    }

    register_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK') {
                this.login_message.innerHTML = "";
                login_form_toggle();
                profile.login();
                profile.check_session();
            } else
                this.login_message.innerHTML = response['message'];
        }
    }

    register_send() {
        sendJSON({
            action: "register",
            login: this.login_input.value,
            email: this.email.value,
            passw: this.passw.value
        }, (e) => this.register_callback(e));
    }

    register() {
        this.login_input.style.display = 'flex';
        this.passw.style.display = 'flex';
        this.email.style.display = 'flex';
        if (this.login_input.validity.valid && this.passw.validity.valid &&
            this.email.validity.valid)
            this.register_send();
    }

    change_login_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK') {
                this.profile_message.style.color = 'green';
                document.getElementById("new_login_form").style.display = "none";
            } else
                this.profile_message.style.color = 'red';
            this.profile_message.innerHTML = response['message'];
            setTimeout(() => {
                    this.profile_message.innerHTML = "";
                },
                4 * 1000);
        }
    }

    change_login() {
        sendJSON({
                action: "change_login",
                login: document.getElementById('new_login_input').value
            },
            (e) => this.change_login_callback(e));
    }

    show_new_login() {
        document.getElementById("new_login_form").style.display = 'flex';
    }

    change_email_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK') {
                this.profile_message.style.color = 'green';
                document.getElementById("new_email_form").style.display = "none";
            } else
                this.profile_message.style.color = 'red';
            this.profile_message.innerHTML = response['message'];
            setTimeout(() => {
                    this.profile_message.innerHTML = "";
                },
                4 * 1000);
        }
    }

    change_email() {
        sendJSON({
                action: "change_email",
                email: document.getElementById('new_email_input').value
            },
            (e) => this.change_email_callback(e));

    }

    show_new_email() {
        document.getElementById("new_email_form").style.display = 'flex';
    }

    toggle_notify_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK')
                this.profile_message.style.color = 'green';
            else
                this.profile_message.style.color = 'red';
            this.profile_message.innerHTML = response['message'];
            setTimeout(() => {
                    this.profile_message.innerHTML = "";
                },
                4 * 1000);
        }
    }

    toggle_notify() {
        let checkbox = document.getElementById('profile_notify');
        if (checkbox.checked)
            sendJSON({
                action: 'notify',
                value: 1
            }, (e) => this.toggle_notify_callback(e));
        else
            sendJSON({
                action: 'notify',
                value: 0
            }, (e) => this.toggle_notify_callback(e));
    }

    change_passw_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK') {
                this.profile_message.style.color = 'green';
                document.getElementById("new_passw_form").style.display = "none";
            } else
                this.profile_message.style.color = 'red';
            this.profile_message.innerHTML = response['message'];
            setTimeout(() => {
                    this.profile_message.innerHTML = "";
                },
                4 * 1000);
        }
    }

    change_passw() {
        sendJSON({
                action: "change_passw",
                passw: document.getElementById('new_passw_input').value
            },
            (e) => this.change_passw_callback(e));

    }

    show_new_passw() {
        document.getElementById("new_passw_form").style.display = 'flex';
    }

}

class Gallery {

    constructor() {
        this.page = 1;
        this.items = [];

        this.holder = document.createElement('section');
        this.holder.id = 'gallery';
        document.getElementById('side').appendChild(this.holder);

        this.holder_items = document.createElement('section');
        this.holder_items.id = 'gallery_items';
        this.holder.appendChild(this.holder_items);

        this.load_more_button = document.createElement('button');
        this.load_more_button.className = "button text_button";
        this.load_more_button.id = 'gallery_more';
        this.load_more_button.innerHTML = 'Load more...';
        this.load_more_button.onclick = () => this.load_more();
        this.holder.appendChild(this.load_more_button);

        this.loading = document.createElement('div');
        this.loading.id = 'gal_loading';
        this.loading.innerHTML = 'Loading...';
        this.holder.appendChild(this.loading);

        this.load_gallery();
    }

    load_gallery() {
        this.page = 1;
        this.items.forEach(o => o.holder.remove());
        sendJSON({'action': 'get_gallery', 'page': this.page},
            (e) => this.load_gallery_callback(e));
        this.loading.style.display = 'block';
    }

    load_gallery_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response.rows > 0)
                response.data.forEach(o => {
                    this.items.push(new GalleryItem(
                        o["likes"],
                        o["user_like"],
                        o["comments"],
                        o["delete"],
                        o["photo_id"],
                        o["photo"],
                        o["user"],
                        o["datetime"],
                        this))
                });
            this.loading.style.display = "none";
            if (response.rows === 10)
                this.load_more_button.style.display = 'block';
        }
    }

    load_more() {
        this.page += 1;
        this.loading.style.display = 'block';
        this.load_more_button.style.display = "none";
        sendJSON({'action': 'get_gallery', 'page': this.page},
            (e) => this.load_gallery_callback(e));
    }
}

class GalleryItem {

    constructor (likes, user_like, comments_num, is_del, photo_id, photo,
                user, datetime, gal) {

        this.likes = Number(likes);
        this.user_like = user_like;
        this.comments_num = comments_num;
        this.is_del = is_del;
        this.id = photo_id;
        this.photo = photo;
        this.owner = user;
        this.datetime = datetime;
        this.gallery = gal;

        this.holder = document.createElement('section');
        this.holder.id = this.id;
        this.holder.className = 'gallery_item';
        this.gallery.holder_items.appendChild(this.holder);

        let gallery_item_img = document.createElement('img');
        this.holder.appendChild(gallery_item_img);
        gallery_item_img.src = 'data:image/png;base64, ' + this.photo;

        let gallery_item_info = document.createElement('section');
        this.holder.appendChild(gallery_item_info);
        gallery_item_info.className = 'gallery_item_info';
        add_info(gallery_item_info, this.owner, this.datetime);

        this.actions = new GalleryItemActions(this);
        this.comments = new Comments1(this);
    }

}

class GalleryItemActions {

    constructor(gal_item) {
        this.gal_item = gal_item;
        this.id = this.gal_item.id;
        this.likes = this.gal_item.likes;
        this.user_like = this.gal_item.user_like;
        this.comments_num = gal_item.comments_num;

        this.holder = document.createElement('section');
        this.holder.className = 'gallery_item_actions_holder';
        this.gal_item.holder.appendChild(this.holder);

        this.error_holder = document.createElement('div');
        this.error_holder.className = 'gallery_item_actions_holder_err_holder';
        this.holder.appendChild(this.error_holder);

        new Like(this);
        this.comments = new CommentsButton(this);
        if (gal_item.is_del == 1)
            new Delete(this);
    }
}

class CommentsButton {

    constructor(gal_item_actions) {

        this.gal_item_actions = gal_item_actions;

        this.id = this.gal_item_actions.id;
        this.comments_num = this.gal_item_actions.comments_num;

        this.button = document.createElement('button');
        this.button.className = 'gallery_item_buttons button comments_button';
        this.button.id = 'comment_' + this.id;
        this.button.alt = 'Comment button';

        this.button.onclick = () => this.gal_item_actions.gal_item.comments.toggle_comments();
        this.gal_item_actions.holder.appendChild(this.button);

        this.label = document.createElement('label');
        this.label.htmlFor = 'comment_' + this.id;
        this.label.innerHTML = this.comments_num;
        this.gal_item_actions.holder.appendChild(this.label);
    }
}

class Like {

    constructor(gal_item_actions) {

        this.gal_item_actions = gal_item_actions;

        this.id = this.gal_item_actions.id;
        this.likes = this.gal_item_actions.likes;
        this.user_like = this.gal_item_actions.user_like;

        this.button = document.createElement('button');
        this.button.className = 'gallery_item_buttons button like_button';
        this.button.id = 'like_' + this.id;
        this.button.alt = 'Like button';
        this.button.onclick = (e) => this.toggle_like(e);
        if (this.user_like == 1)
            this.button.style.filter = 'invert(100%)';
        this.gal_item_actions.holder.appendChild(this.button);

        this.label = document.createElement('label');
        this.label.htmlFor = 'like_' + this.id;
        this.label.innerHTML = this.likes;
        this.gal_item_actions.holder.appendChild(this.label);
    }

    delete_like_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] !== 'OK') {
                this.add_like();
                this.gal_item_actions.error_holder.innerHTML = response['message'];
                setTimeout(() => {this.gal_item_actions.error_holder.innerHTML = ""},
                    4 * 1000);
            }
        }
    }

    add_like_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] !== 'OK') {
                this.remove_like();
                this.gal_item_actions.error_holder.innerHTML = response['message'];
                setTimeout(() => {this.gal_item_actions.error_holder.innerHTML = ""},
                    4 * 1000);
            }
        }
    }

    remove_like() {
        if (this.likes > 0) {
            this.user_like = 0;
            this.button.style.filter = 'invert(0%)';
            this.button.value = '';
            this.likes -= 1;
            this.label.innerHTML = this.likes;
        }
    }

    add_like() {
        this.button.style.filter = 'invert(100%)';
        this.button.value = 'pressed';
        this.likes += 1;
        this.user_like = 1;
        this.label.innerHTML = this.likes;
    }

    toggle_like() {
        if (this.user_like == 1) {
            this.remove_like();
            sendJSON({'action': 'delete_like', 'id': this.id},
                e => this.delete_like_callback(e));
        } else {
            this.add_like();
            sendJSON({'action': 'add_like', 'id': this.id},
                e => this.add_like_callback(e));
        }
    }

}

class Comments1 {

    constructor(gallery_item) {
        this.parent = gallery_item;
        this.holder = document.createElement('section');
        this.holder.id = ('comments_holder_' + this.parent.id);
        this.holder.className = 'comments_holder';
        this.parent.holder.appendChild(this.holder);

        this.comments = document.createElement('section');
        this.comments.className = 'comments';
        this.holder.appendChild(this.comments);

        this.comment_form = document.createElement('textarea');
        this.comment_form.className = 'comment_form';
        this.comment_form.style.display = 'none';
        this.holder.appendChild(this.comment_form);

        if (profile.login_name) {
            this.comment_button = document.createElement('button');
            this.holder.appendChild(this.comment_button);
            this.comment_button.className = 'add_comment_button text_button';
            this.comment_button.id = ('comment_button_' + this.parent);
            this.comment_button.innerHTML = 'Add comment';
        }

        this.send_button = document.createElement('button');
        this.holder.appendChild(this.send_button);
        this.send_button.className = 'send_comment_button text_button';
        this.send_button.id = ('send_comment_button_' + this.parent);
        this.send_button.innerHTML = 'Send comment';
        this.send_button.style.display = 'none';

        if (profile.login_name) {
            this.comment_button.onclick = () => this.show_comment_form();
            this.send_button.onclick = () => this.send_comment();
        }
    }

    toggle_comments() {
        if (this.holder.style.display === 'flex')
            this.holder.style.display = 'none';
        else {
            this.get_comments();
            this.holder.style.display = 'flex';
        }
    }

    show_comment_form() {
        this.comment_form.style.display = 'flex';
        this.comment_button.style.display = 'none';
        this.send_button.style.display = 'block';
    }

    get_comments() {
        this.comments.innerHTML = "Loading...";
        sendJSON({'action': 'get_comments', 'id': this.parent.id},
            (e) => this.get_comments_callback(e));
    }

    get_comments_callback(event) {
        if (event.readyState === 4 && event.status === 200) {
            let response = JSON.parse(event.response);
            if (response['status'] === 'OK') {
                this.comments.innerHTML = "";
                this.parent.actions.comments.label.innerHTML = response['count'];
                response['comments'].forEach(e => {
                    let comment = document.createElement('div');
                    comment.className = 'comment';
                    this.comments.appendChild(comment);
                    comment.innerHTML = e.text;
                    let comment_info = document.createElement('section');
                    comment_info.className = 'gallery_item_info';
                    this.comments.appendChild(comment_info);
                    add_info(comment_info, e.user, e.datetime);
                })
            } else {
                this.comments.innerHTML = response['message'];
                setTimeout(() => {
                        this.comments.innerHTML = "";
                    },
                    4 * 1000);
            }
        }
    }

    send_comment() {
        sendJSON({
            'action': 'add_comment', 'id': this.parent.id,
            'data': this.comment_form.value
        }, (e) => this.send_comment_callback(e));
    }

    send_comment_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            let comment = document.createElement('div');
            this.comments.appendChild(comment);
            if (response['status'] === 'OK') {
                this.get_comments();
            } else {
                this.comments.innerHTML = response['message'];
                setTimeout(() => {this.comments.innerHTML = ""},
                    4 * 1000);
            }
        }
    }
}

class Delete {
    constructor(gal_item_actions) {
        this.gal_item_actions = gal_item_actions;

        this.id = this.gal_item_actions.id;
        this.comments_num = this.gal_item_actions.comments_num;

        this.button = document.createElement('button');
        this.button.className = 'gallery_item_buttons button delete_button';
        this.button.id = 'delete_' + this.id;
        this.button.alt = 'Delete button';
        this.button.onclick = () => this.delete_item();

        this.gal_item_actions.holder.appendChild(this.button);
    }

    delete_item_callback(e) {
        if (e.readyState === 4 && e.status === 200) {
            let response = JSON.parse(e.response);
            if (response['status'] === 'OK') {
                let gallery_item = document.getElementById(response.id);
                gallery_item.remove();
            }
        }
    }

    delete_item() {
        let obj = {
            action: 'delete',
            id: this.id
        };
        sendJSON(obj, (e) => this.delete_item_callback(e));
    }
}

function add_info(holder, user, datetime) {

    let div1 = document.createElement('div');
    div1.innerHTML = 'Created by';
    holder.appendChild(div1);

    let div2 = document.createElement('div');
    div2.innerHTML = user;
    holder.appendChild(div2);

    let div3 = document.createElement('div');
    div3.innerHTML = ' at ';
    holder.appendChild(div3);

    let div4 = document.createElement('div');
    div4.innerHTML = datetime;
    holder.appendChild(div4);
}

function check_template() {
    if (!('content' in document.createElement('template'))) {
        let warning = document.createElement('div');
        warning.innerHTML = "Your browser doesn't support templates. Use another browser";
        document.getElementsByTagName('header')[0].append(warning);
    }
}

function load_cam() {
    navigator.mediaDevices.getUserMedia({video: true})
        .then(function (stream) {
            if (stream) {
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

check_template();
profile = new Profile();
gallery = new Gallery();

document.addEventListener('click', function (event) {
    let target = event.target;
    let profile_info = document.getElementById('profile');
    if (profile_info.style.display === "flex") {
        if (profile_info.contains(target))
            return;
        else
            profile.open_profile();
    }
}, true);

