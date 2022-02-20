app.log.check_session()

Ladda.bind('.ladda-button')

let uid = app.cookie.get('uid');

const main = {
  show_pw: function(e){

    let list = document.getElementsByClassName('show_password');
    for (let item of list) {
      item.type = e.checked ? 'text' : 'password';
    }
  
  },
  update_pw: function(uid, npw, cb){
    const params = {
      _uid: uid,
      _new_password: npw
  };
  app.crud.request('sp-update_password', params, function (resp) {
      return cb(resp)
  });
  },
}

$(document)

.off('click', '#btn-update_pw').on('click', '#btn-update_pw', function(){

  let old_pw = $('#old_pw').val().trim(),
      new_pw = $('#new_pw').val().trim();

  if(!old_pw || !new_pw) {
    swal('Invalid', 'Please fill in all the required fields.', 'warning')
    Ladda.stopAll()
    return
  }

  if(new_pw.length < 6) {
    swal('Invalid', 'Password must be at least 6 characters long', 'warning')
    Ladda.stopAll()
    return
  }
  
  app.get.user_details(uid, function(resp){
    let ud = resp = undefined ? '' : resp[0]
    
    app.log.l_auth(old_pw, ud.password , function (auth_resp) {
      console.log({auth_resp})
      if (auth_resp == 0) {
        swal('Invalid', 'Old password does not match', 'warning')
        Ladda.stopAll()
        return
      }

      app.log.l_encr(new_pw , function (encrypted_pw) {
        npw = encrypted_pw
        main.update_pw(uid, npw, function(resp){
          
          $('#old_pw').val('')
          $('#new_pw').val('')
          Ladda.stopAll()
          swal('Password Changed', 'Password has been successfully changed', 'success')
        })
      
      })
    
    })

  })

})

.off('click', '#show_pw').on('click', '#show_pw', function(){
  main.show_pw(this)
})