
const main = {
  get: {
    login_details: function(username, cb){
      const params = {
        _user_name: username,
    };
    app.crud.request('sp-get_login_details', params, function (resp) {
        return cb(resp)
    });
    }
  },
}

app.log.check_login_session()

$(document)

.off('click', '#login_btn').on('click', '#login_btn', function (e) {
 e.preventDefault()
 let username = $('#username').val() 
 let password = $('#password').val() 

 if(!username || !password){
  // swal("Invalid","Invalid username or password","error")
  Toast.fire({ icon: 'error', title: 'Invalid username or password.'})
 } else {
   main.get.login_details(username, function(resp){
   
  let d = resp = undefined ? '' : resp[0]
    // console.log({d})
  if(d) {
    app.log.l_auth(password, d.password, function (auth_resp) {
     
     if(auth_resp == 1) {
      app.cookie.set(d.tbl_id, d.type, function(){
        if(d.type == 'admin') {
          window.location.href = 'views/admin_user_access.html';
        } else {
          window.location.href = 'views/dashboard.html';
        }
      })
      
     } else{
      // swal("Invalid","Invalid username or password","error")
      Toast.fire({ icon: 'error', title: 'Invalid username or password.'})
     }
   })
  } else {
    // swal("Invalid","Invalid username or password","error")
    Toast.fire({ icon: 'error', title: 'Invalid username or password.'})
  }

   
 })
 }
 
})


// javascript

addEventListener('keyup', function(event) {
  if(event.keyCode === 13) {
    event.preventDefault();
    document.getElementById('login_btn').click();
  }
})
