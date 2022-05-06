app.log.check_admin_session()

const pwRegex = /(?=.*\d)(?=.*[a-zA-Z]).{8,}/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
let edit_tbl_id;

const main = {
  api_request: function(api, params, cb){

    $.ajax({
      url: server_url + '/ajax/api/admin/'+ api +'.php', 
      data: {
        params
      },
      method:"POST",  
      dataType: "json",
      crossDomain: true,
      timeout: 50000,

    success: function(response) {
      return cb(response)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
    });
  },
  add: {
    user: function(fname, lname, uname, email, pw, type, cb){
      const params = {
        first_name: fname,
        last_name: lname,
        username: uname,
        email: email,
        password: pw,
        type: type,
      }
      // console.log({params})
      main.api_request('add_new_user', params, function(resp){
        return cb(resp)
      })
    }
  },
  update: {
    user_details: function(fname, lname, email, type, tbl_id, cb){
      const params = {
        first_name: fname,
        last_name: lname,
        email: email,
        type: type,
        tbl_id: tbl_id
      }
      main.api_request('update_user_details', params, function(resp){
        return cb(resp)
      })
    },
    user_status: function(tbl_id, stat, cb){
      const params = {
        tbl_id: tbl_id,
        stat: stat
      }
      main.api_request('update_user_status', params, function(resp){
        return cb(resp)
      })

      
    }
  },

  get: {
    user_details: function(tbl_id, cb){
      const params = {
        tbl_id: tbl_id
      }
      main.api_request('get_user_details', params, function(resp){
        return cb(resp)
      })
    }
  },

  tbl : {
    users: function() {

      let unfiltered_rows_count;
 
          const columns = [
              {data: "tbl_id", title: "ID#", className: 'tbl_id', sortable: false},
              {data: "last_name", title: "Last Name", className: 'last_name'},
              {data: "first_name", title: "First Name", className: 'first_name'},
              {data: "username", title: "Username", className: 'username'},
              {data: "email", title: "Email", className: 'email'},
              {data: "status", title: "Status", className: 'status'},
              {title: "Actions", className: 'td_actions' , sortable : false},
          ]

          $('#users_tbl').dataTable({
              serverSide: true,
              lengthChange: false,
              searchDelay: 1000,
              searching: true,
              processing: true,
              // stateSave: true, // to save search kahit ilipat sa ibang menu
              language: {
                infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
                // searchPlaceholder: "Forms, Requestor"
            },
            dom: 'Bfrtip',
            buttons: [
              { 
                extend: 'pdf', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3, 4, 5]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3, 4, 5]
                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3, 4, 5]
                }
              },
                // 'copy', 
                // 'csv', 
                // 'excel', 
                // 'pdf', 
                // 'print'
            ],
              columns: columns,
              order: [ 1, "asc" ],  
              columnDefs: [
                // { type: 'any-number', targets : 0 },
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id;
                    },
                    targets: -1
                },
                {
                  render: function ( data, type, row ) {

                      let userStatus = row.status == 1 ? 'Active' : 'Inactive';

                      return userStatus;
                  },
                  targets: -2
                },
            ],
             
              ajax: function (data, callback, settings) {

                  const params = {
                      _limit_offset: data.start,
                      _search_string: data.search.value,
                      _sort_by: data.columns[data.order[0].column].data,
                      _sort_direction: data.order[0].dir,
                  };
                  main.api_request('get_users', params, function(response){
                      console.log({response})
                      let resp = response.data || [];
                      
                      if (data.draw === 1) { // if this is the first draw, which means it is unfiltered
                          unfiltered_rows_count = response._total_count;
                      }

                      let total_count = response._total_count;

                      callback({
                          draw: data.draw,
                          data: resp,
                          recordsTotal: unfiltered_rows_count,
                          recordsFiltered: total_count
                      });
                  });
              },
              createdRow: function( row, data, dataIndex ) {

                let active = '<span class="label label-sm label-success">Active</span>';
                let inactive  = '<span class="label label-sm label-danger">Inactive</span>';
                let userStatus = data.status == 1 ? active : inactive

                $( row ).find('td.status').html(userStatus)

                let editUser = `<a href="javascript:void(0)" data-target="#modal-edit_user_details" data-toggle="modal" class="custom_action_icon_btn text-warning edit_user_details" data-toggle="tooltip" data-placement="top" title="Edit" data-original-title="Edit">
                                  <i class="fa fa-pencil"></i>
                                </a>`

                let activateUser = `<a href="javascript:void(0)" class="custom_action_icon_btn text-success activate_user" data-toggle="tooltip" data-placement="top" title="Activate" data-original-title="Activate">
                                  <i class="fa fa-check"></i>
                                </a>`
                let deactivateUser = `<a href="javascript:void(0)" class="custom_action_icon_btn text-danger deactivate_user" data-toggle="tooltip" data-placement="top" title="Deactivate" data-original-title="Deactivate">
                                  <i class="fa fa-close"></i>
                                </a>`

                $( row ).find('td:eq(-1)').html(`<div class="d-flex justify-content-between"> 
                  ${editUser}
                  ${data.status == 1 ? deactivateUser : activateUser}
                </div>`);
  
                $( row ).find('td:eq(-1) > div > a')
                    .attr({
                        'data-tbl_id': data.tbl_id,
                        'data-user' : data.last_name + ', ' + data.first_name
                });

                $(row).addClass('hover_cls');

              }

          });

    }
  },
  reset: function(el){
    el
      .find("input").val('').removeClass('input-custom-error').end()
      .find("select").val('').removeClass('input-custom-error').end()
  },
  validate_inputs: function(username, password, email, cb){

    let validatePassword = password.match(pwRegex);
    let validateEmail = email.match(emailRegex)

    if(username.length < 6){
      Toast.fire({ icon: 'error', title: 'Username must be at least 6 character'})
      return cb(false)
    }

    if(!validatePassword) {
      Toast.fire({ icon: 'error', title: 'Password must be at least 8 characters and alphanumeric'})
      return cb(false)
    }
    
    if(!validateEmail) {
      Toast.fire({ icon: 'error', title: 'Invalid email format'})
      return cb(false)
    }
    
    return cb(true)
  },
  loader: function(title, html){
    Swal.fire({
      title: title,
      html: html,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
          Swal.showLoading()
      },
    }); 
  },

}

main.tbl.users()

$(document)

.off('click', '.edit_user_details').on('click', '.edit_user_details', function(){
  let { tbl_id } = $(this).data()
  edit_tbl_id = tbl_id;
  main.get.user_details(tbl_id, function(resp){
    let v = resp[0]
    console.log(v)

    switch(v.status){
      case '1':
        $('.user_status').html('Active').addClass('label-success').removeClass('label-danger')
        break
      case '2':
        $('.user_status').html('Inactive').addClass('label-danger').removeClass('label-success')
        break
      default:
        console.log('erorrr')
        break
    }

    $('#username').val(v.username)
    $('#first_name').val(v.first_name)
    $('#last_name').val(v.last_name)
    $('#user_email').val(v.email)
    $('#usertype').val(v.type).trigger("change")



  })

})

.off('click', '#update_user').on('click', '#update_user', function(){
  
  let first_name = document.getElementById('first_name').value.trim(),
      last_name = document.getElementById('last_name').value.trim(),
      email = document.getElementById('user_email').value.trim(),
      type = document.getElementById('usertype').value;

      console.log({edit_tbl_id})

      main.loader('Please Wait!', 'data updating...')

      if(app.validate_input($('#modal-edit_user_details'))){

        let validateEmail = email.match(emailRegex)

        if(!validateEmail) {
          Toast.fire({ icon: 'error', title: 'Invalid email format'})
          
          return
        }

        main.update.user_details(first_name, last_name, email, type, edit_tbl_id, function(resp){

          if(resp.status == true) {
            swal.close();
            Toast.fire({ icon: 'success', title: resp.message})
            $('#users_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
          } else {

            let {name, email } = resp

            if(name.length != 0) {
              Toast.fire({ icon: 'warning', title: 'User is already registerd'})
              return
            }
           
            if(email.length != 0) {
              Toast.fire({ icon: 'warning', title: 'Email is already taken'})
              return
            }
       
          }

        })

      } else {
        Swal.fire('Incomplete Details','Please complete all the required info marked with (*)','error')
      }
  


})

.off('click', '#add_user').on('click', '#add_user', function(){

  let first_name = document.getElementById('add_first_name').value.trim(),
      last_name = document.getElementById('add_last_name').value.trim(),
      username = document.getElementById('add_username').value.trim(),
      email = document.getElementById('add_user_email').value.trim(),
      password = document.getElementById('add_password').value.trim(),
      type = document.getElementById('add_usertype').value

  main.loader('Please Wait!', 'data upoading...')

  
  if(app.validate_input($('#modal-add_user'))){

    main.validate_inputs(username, password, email, function(resp){
      if(resp) {
        main.add.user(first_name, last_name, username, email, password, type, function(resp){
          // console.log(resp)
          // console.log(resp.status)

          if(resp.status == true) {
            $('#modal-add_user').modal('hide')
            swal.close();
            Toast.fire({ icon: 'success', title: resp.message})
            $('#users_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
          } else {

            let {name, username, email } = resp

            if(name.length != 0) {
              Toast.fire({ icon: 'warning', title: 'User is already registerd'})
              return
            }
            if(username.length != 0) {
              Toast.fire({ icon: 'warning', title: 'Username is already taken'})
              return
            }
            if(email.length != 0) {
              Toast.fire({ icon: 'warning', title: 'Email is already taken'})
              return
            }
       
          }

        })
      }
    })

    


  } else {
    Swal.fire('Incomplete Details','Please complete all the required info marked with (*)','error')
  }


})

.off('click', '.activate_user').on('click', '.activate_user', function(){
  let { tbl_id , user} = $(this).data()

  Swal.fire({
    title: 'Activate ' + user + '?',
    text: "Are you sure you want to activate this user?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#6fd96f',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Activate'
  }).then((result) => {
    if (result.isConfirmed) {
      main.update.user_status(tbl_id, 1, function(resp){
          console.log(resp)
          $('#users_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
          Swal.fire('Activated Successfully!',user + ' activated!','success')
      })
    }
  })

  
})

.off('click', '.deactivate_user').on('click', '.deactivate_user', function(){
  let { tbl_id , user} = $(this).data()

  Swal.fire({
    title: 'Deactivate ' + user + '?',
    text: "Are you sure you want to deactivate this user?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#FFA500',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Deactivate'
  }).then((result) => {
    if (result.isConfirmed) {
      main.update.user_status(tbl_id, 2, function(resp){
          console.log(resp)
          $('#users_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
          Swal.fire('Deactivated Successfully!',user + ' deaactivated!','success')
      })
    }
  })


})

.off('focus',':input').on('focus', ':input', function(){
  $(this).removeClass('input-custom-error')
})


// reset all
$('#modal-add_user, #modal-edit_user_details').on('hidden.bs.modal', function (e) {
  main.reset($(this))
})

