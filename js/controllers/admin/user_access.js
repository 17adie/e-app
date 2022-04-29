app.log.check_admin_session()

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
  update: {
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
              {data: "tbl_id", title: "ID#", className: 'tbl_id'},
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
              order: [ 0, "asc" ],  
              columnDefs: [
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
                      // console.log({response})
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
  }

}

main.tbl.users()

$(document)

.off('click', '.edit_user_details').on('click', '.edit_user_details', function(){
  let { tbl_id } = $(this).data()

  main.get.user_details(tbl_id, function(resp){
    let v = resp[0]

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

  })

})

.off('click', '#update_user').on('click', '#update_user', function(){
  console.log('update user')
})

.off('click', '#add_user').on('click', '#add_user', function(){

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

