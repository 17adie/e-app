
let server_url = 'http://localhost/e-app';

let Toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    iconColor: 'white',
    customClass: {
      popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true
  });

const app = {

    email_notification: function(data, cb){

        // console.log('data.email_to', data.email_to.length)
        if(data.email_to.length != 0) { // check if have email
  
          $.ajax({
            url:server_url + '/ajax/' + data.file_name + '.php',
            type:'post',
            data: {data},
            async: false,
            cache: false,
            success:function(resp){

                return cb(resp);
            }
          });
  
        } else {
          return cb('no email')
        }
  
    },

    // modal body loader
    loader: function(method, elem){

        $('#dv-loader').remove();
        $('<div id="dv-loader" style="padding-top:50px;padding-bottom:50px; text-align: center"><i class="fa fa-cog fa-spin" style="font-size: 35px; color:#52c306;"></i><br><br><b id="percentage-loader"></b> </div>').insertBefore($(elem));
    
        if(method == 'hide'){
            $('#dv-loader').fadeOut();
            setTimeout((function(){
                $(elem).fadeIn();
            }),1000);
        }else{
            $(elem).hide();
            $('#dv-loader').fadeIn();
        }
    },
    // modal body loader
    get: {
        priority_status : function(diff, cb){

            let prio;
            
            if(diff < 3) { // alert when less than 3 days
                prio = '<span class="label label-sm label-danger">High</span>';
            } else if (diff > 2 && diff < 6){ // alert when 3 - 5 days
                prio = '<span class="label label-sm label-warning">Medium</span>';
            } else if (diff > 5) { // alert when greater than 6 days
                prio = '<span class="label label-sm label-success">Low</span>';
            } else {
                prio = '<span class="label label-sm label-error">N/A</span>';
            }

         return cb(prio)

        },
        dashboard_count: function(uid, cb){
            const params = {
                _uid: uid
            };
            app.crud.request('sp-get_dashboard_count', params, function (resp) {
                return cb(resp)
            });
       },
       user_details: function(uid, cb){
        const params = {
            _uid: uid
        };
        app.crud.request('sp-get_user_details', params, function (resp) {
            return cb(resp)
        });
        },
        notif_details: function(tbl_id, cb){
            const params = {
                _approval_id: tbl_id
            };
            app.crud.request('sp-get_notification_details', params, function (resp) {
                return cb(resp)
            });
        },
      },

    uploader: function (att,uploader_name, callback) {
        if(att.val()) {
            var file_data = att.prop('files')[0];
            var form_data = new FormData();
            form_data.append('file', file_data);

            $.ajax({
                type: 'post',
                url: server_url + '/ajax/functions/uploader/'+uploader_name+'.php',
                data: form_data,
                dataType: 'text',
                cache: false,
                contentType: false,
                processData: false,
                target:   '#targetLayer',
                success:function (data){

                    return callback(data);

                },
                complete: function (data) {

                },
                resetForm: true
            })
            return false;
        }else{
            return callback('');
        }
    },

    cookie: {
        set: function(id, type, cb){
            document.cookie = 'uid' + "=" + id + ";path=/";
            document.cookie = 'utype' + "=" + type + ";path=/";
            return cb()
        },
        get: function(cname){
            let name = cname + "=";
            let ca = document.cookie.split(';');
            for(let i = 0; i < ca.length; i++) {
              let c = ca[i];
              while (c.charAt(0) == ' ') {
                c = c.substring(1);
              }
              if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
              }
            }
            return "";
        },
    },

    log: {
        logout: function(){
            document.cookie = "uid=;expires = Thu, 01 Jan 1970 00:00:00 GMT;path=/"
            document.cookie = "utype=;expires = Thu, 01 Jan 1970 00:00:00 GMT;path=/"
            window.location.href = '../index.html';
        },
        check_login_session: function(){
            let uid = app.cookie.get("uid")

            if(uid == 1) {
                window.location.href = 'views/admin_page.html';
                return
            }

            if(uid) {
                window.location.href = 'views/dashboard.html';
            }
        },
        check_session: function() {
            let uid = app.cookie.get("uid")
            // to restrict admin to go to user page
            if(uid ==  '' || uid === undefined || uid == 1) {
                window.location.href = '../index.html';
                return
            }

        },
        check_admin_session: function(){
            let uid = app.cookie.get("uid")
            // to restrict user to go to admin page
            if(uid ==  '' || uid === undefined || uid > 1) {
                window.location.href = '../index.html';
                return
            }
        },
        l_encr: function(str, callback){

            $.ajax({
                url: server_url + '/ajax/functions/enc-dec/encr.php',
                type:'post',
                data:{
                    str: str
                },
                success:function(resp){
                    return callback(resp);
                }
            });

        },

        l_auth: function(str, h, callback){

            $.ajax({
                url: server_url + '/ajax/functions/enc-dec/decr.php',
                type:'post',
                data:{
                    str: str,
                    hash: h
                },
                success:function(resp){
                    return callback(resp);
                }
            })

        }
    },

  // VIEW TABLE API
    view_table: {
        request: function (procedure_name, params, callback) {

            $.ajax({
                url: server_url + '/ajax/api/get_table.php',
                data: {
                    procedure_name,
                    params
                },

                type: 'POST',
                dataType: 'html',
                // crossDomain: true,
                timeout: 50000,
                success: function(data, textStatus, xhr){

                    console.log(textStatus)

                    let enc_resp = JSON.parse(data);

                    if(enc_resp.error == undefined){
                        return callback(enc_resp)
                    }else{
                        let api_error = enc_resp.error
                        console.log('Failed to communicate with the server. Error code: ' + api_error.code,'Server Timeout')
                    }

                    // return callback(data)
                },
                error: function(resp){

                    // alert('Failed to establish connection to the server. Please check your network.');
                    // req(true);

                }
            });
        },
        request_search: function (procedure_name, params, callback) {

            $.ajax({
                url: server_url + '/ajax/api/get_table_search.php',
                data: {
                    procedure_name,
                    params
                },

                type: 'POST',
                dataType: 'html',
                // crossDomain: true,
                timeout: 50000,
                success: function(data, textStatus, xhr){

                    console.log(textStatus)

                    let enc_resp = JSON.parse(data);

                    if(enc_resp.error == undefined){
                        return callback(enc_resp)
                    }else{
                        let api_error = enc_resp.error
                        console.log('Failed to communicate with the server. Error code: ' + api_error.code,'Server Timeout')
                    }

                    // return callback(data)
                },
                error: function(resp){

                    // alert('Failed to establish connection to the server. Please check your network.');
                    // req(true);

                }
            });
        }
},
// GET LIST API
get_list:  {
    request: function (procedure_name, callback) {

        $.ajax({
            url: server_url + '/ajax/api/get_list.php',
            data: {
                procedure_name,
            },

            type: 'POST',
            dataType: 'html',
            crossDomain: true,
            timeout: 50000,
            success: function(data, textStatus, xhr){

                console.log(textStatus)

                let enc_resp = JSON.parse(data);

                if(enc_resp.error == undefined){
                    return callback(enc_resp)
                }else{
                    let api_error = enc_resp.error
                    console.log('Failed to communicate with the server. Error code: ' + api_error.code,'Server Timeout')
                }

                // return callback(data)
            }
        });
    }
},
// CRUD
crud : {
    request: function (procedure_name, params, callback){
        $.ajax({
            url: server_url + '/ajax/api/crud.php',
            data: {
                procedure_name,
                params
            },

            type: 'POST',
            dataType: 'html',
            crossDomain: true,
            timeout: 50000,
            success: function(data, textStatus, xhr){

                console.log(textStatus)

                let enc_resp = JSON.parse(data);

                if(enc_resp.error == undefined){
                    return callback(enc_resp)
                }else{
                    let api_error = enc_resp.error
                    console.log('Failed to communicate with the server. Error code: ' + api_error.code,'Server Timeout')
                }

                // return callback(data)
            }
        });
    },
},
}

// load app
$(document).ready(function() {

    let _uid = app.cookie.get("uid");

   if(_uid) {
        if(_uid == 1) {
            console.log('admin')
            return
        } else {
            app.get.dashboard_count(_uid, function(resp){
                let d = resp = undefined ? '' : resp[0]
               
                if(d.user_notificiation_count == 0) {
                    $('.my_notification_count_nav').removeClass('badge-pill gradient-2')
                }
    
                app.get.user_details(_uid, function(resp){
                    let ud = resp = undefined ? '' : resp[0]
                    $('.user_fullname').html(`Hi, ${ud.first_name} ${ud.last_name}`)
                    $('.my_notification_count_nav').html(d.user_notificiation_count == 0 ? '' : d.user_notificiation_count)
                })
            })
        }
   } else {
       console.log('please login')
   }
    
})


$(document)

.off('click', '#logout_btn').on('click', '#logout_btn', function (e) {
    
    app.log.logout()

})