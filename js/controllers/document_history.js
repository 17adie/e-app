app.log.check_session()

let uid = app.cookie.get('uid');

const main = {
  fn: {
    tbl: {
      // DATATABLES
      notification: function() {

          let unfiltered_rows_count;

          const columns = [
              {data: "read_status", title: "", className: 'read_status'},
              {data: "tbl_id", title: "TRANS#", className: 'tbl_id', sortable : false},
              {data: "category", title: "Form", className: 'category'},
              {data: "status", title: "Document Status", className: 'status'},
              {data: "requestor", title: "Requestor", className: 'requestor'},
              {data: "date_request", title: "Date Requested", className: 'date_request'},
              {data: "date_approved", title: "Date Approved", className: 'date_approved'},
          ]

          $('#notification_tbl').dataTable({
              serverSide: true,
              lengthChange: false,
              searchDelay: 1000,
              searching: true,
              processing: true,
              // stateSave: true, // to save search kahit ilipat sa ibang menu
              language: {
                infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
                searchPlaceholder: "Forms, Requestor"
            },
              columns: columns,
              order: [[ 0, "asc" ], [ 6, "asc" ]],  
              columnDefs: [
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id + ' ' + row.tbl_id;
                    },
                    // targets: -1
                }
            ],
             
              ajax: function (data, callback, settings) {

                  const params = {
                      _limit_offset: data.start,
                      _search_string: data.search.value,
                      _sort_by: data.columns[data.order[0].column].data,
                      _sort_direction: data.order[0].dir,
                      _uid: uid

                  };
                  app.view_table.request_search('sp-get_all_notification', params, function (response) {
                    
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

                // DISPLAY STATUS WITH TEXT
                let stat;

                switch(data.status){
                    case '0':
                        stat = '<span class="label label-sm gradient-4">Ongoing</span>';
                        break;
                    case '1':
                        stat = '<span class="label label-sm gradient-1">Approved</span>';
                        break;
                    case '2':
                        stat = '<span class="label label-sm gradient-2">Disapproved</span>';
                        break;
                    case '3':
                        stat = '<span class="label label-sm gradient-2">Cancelled</span>';
                        break;
                    default:
                        stat = '<span class="label label-sm label-danger">N/A</span>';
                        break;
                }

                $( row ).find('td.status')
                    .html(stat)
                    .attr({
                        "data-tbl_id": data.tbl_id
                    });



                $( row ).find('td.read_status')
                  .html(data.read_status != 1 ?`
                   <a href="javascript:;" data-target="#modal-view_notif_details" data-toggle="modal" data-tbl_id="${data.tbl_id}" data-read_status="${data.read_status}" data-notification_id="${data.notification_id}" class="btn text-warning tooltips btn-read_message">
                    <i class="fa fa-envelope tooltips" data-placement="top" title="Unread" ></i>
                   </a>` : 
                  `<a href="javascript:;" data-target="#modal-view_notif_details" data-toggle="modal" data-tbl_id="${data.tbl_id}" data-read_status="${data.read_status}" data-notification_id="${data.notification_id}" class="btn tooltips btn-read_message">
                  <i class="fa fa-envelope-open tooltips" data-placement="top" title="Read"></i>
                  <span></span>
                  </a>`
                  )
                      
                  $(row).addClass('hover_cls');

              }

          });
      },
      cancelled: function() {

        let unfiltered_rows_count;

        const columns = [
            {data: "tbl_id", title: "TRANS#", className: 'tbl_id', sortable : false},
            {data: "document_title", title: "Subject", className: 'document_title'},
            {data: "category", title: "Form", className: 'category'},
            {data: "status", title: "Document Status", className: 'status'},
            {data: "date_request", title: "Date Requested", className: 'date_request'},
            {data: "date_approved", title: "Date Approved", className: 'date_approved'},
        ]

        $('#cancelled_tbl').dataTable({
            serverSide: true,
            lengthChange: false,
            searchDelay: 1000,
            searching: true,
            processing: true,
            // stateSave: true, // to save search kahit ilipat sa ibang menu
            language: {
              infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
              searchPlaceholder: "Forms, Subject"
          },
            columns: columns,
            order: [[ 4, "asc" ]],  
            columnDefs: [
              {
                  render: function ( data, type, row ) {
                      return row.tbl_id + ' ' + row.tbl_id;
                  },
                  // targets: -1
              }
          ],
           
            ajax: function (data, callback, settings) {

                const params = {
                    _limit_offset: data.start,
                    _search_string: data.search.value,
                    _sort_by: data.columns[data.order[0].column].data,
                    _sort_direction: data.order[0].dir,
                    _uid: uid

                };
                app.view_table.request_search('sp-get_all_cancelled_history', params, function (response) {
                  
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

              // DISPLAY STATUS WITH TEXT
              let stat;

              switch(data.status){
                  // case '0':
                  //     stat = '<span class="label label-sm gradient-4">Ongoing</span>';
                  //     break;
                  // case '1':
                  //     stat = '<span class="label label-sm gradient-1">Approved</span>';
                  //     break;
                  // case '2':
                  //     stat = '<span class="label label-sm gradient-2">Disapproved</span>';
                  //     break;
                  case '3':
                      stat = '<span class="label label-sm gradient-2">Cancelled</span>';
                      break;
                  default:
                      stat = '<span class="label label-sm label-danger">N/A</span>';
                      break;
              }

              $( row ).find('td.status')
                  .html(stat)
                  .attr({
                      "data-tbl_id": data.tbl_id
                  });
                    
                $(row).addClass('hover_cls');

            }

        });
    },
    request: function() {

      let unfiltered_rows_count;

      const columns = [
          {data: "tbl_id", title: "TRANS#", className: 'tbl_id', sortable : false},
          {data: "document_title", title: "Subject", className: 'document_title'},
          {data: "category", title: "Form", className: 'category'},
          {data: "status", title: "Document Status", className: 'status'},
          {data: "date_request", title: "Date Requested", className: 'date_request'},
          {data: "date_approved", title: "Date Approved", className: 'date_approved'},
      ]

      $('#request_tbl').dataTable({
          serverSide: true,
          lengthChange: false,
          searchDelay: 1000,
          searching: true,
          processing: true,
          // stateSave: true, // to save search kahit ilipat sa ibang menu
          language: {
            infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
            searchPlaceholder: "Forms, Subject"
        },
          columns: columns,
          order: [[ 4, "asc" ]],  
          columnDefs: [
            {
                render: function ( data, type, row ) {
                    return row.tbl_id + ' ' + row.tbl_id;
                },
                // targets: -1
            }
        ],
         
          ajax: function (data, callback, settings) {

              const params = {
                  _limit_offset: data.start,
                  _search_string: data.search.value,
                  _sort_by: data.columns[data.order[0].column].data,
                  _sort_direction: data.order[0].dir,
                  _uid: uid

              };
              app.view_table.request_search('sp-get_all_request_history', params, function (response) {
                
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

            // DISPLAY STATUS WITH TEXT
            let stat;

            switch(data.status){
                case '0':
                    stat = '<span class="label label-sm gradient-4">Ongoing</span>';
                    break;
                case '1':
                    stat = '<span class="label label-sm gradient-1">Approved</span>';
                    break;
                case '2':
                    stat = '<span class="label label-sm gradient-2">Disapproved</span>';
                    break;
                // case '3':
                //     stat = '<span class="label label-sm gradient-2">Cancelled</span>';
                //     break;
                default:
                    stat = '<span class="label label-sm label-danger">N/A</span>';
                    break;
            }

            $( row ).find('td.status')
                .html(stat)
                .attr({
                    "data-tbl_id": data.tbl_id
                });
                  
              $(row).addClass('hover_cls');

          }

      });
  },
  approval: function() {

    let unfiltered_rows_count;

    const columns = [
        {data: "tbl_id", title: "TRANS#", className: 'tbl_id', sortable : false},
        {data: "document_title", title: "Subject", className: 'document_title'},
        {data: "category", title: "Form", className: 'category'},
        {data: "status", title: "Document Status", className: 'status'},
        {data: "requestor", title: "Requestor", className: 'requestor'},
        {data: "date_request", title: "Date Requested", className: 'date_request'},
        {data: "date_approved", title: "Date Approved", className: 'date_approved'},
    ]

    $('#approval_tbl').dataTable({
        serverSide: true,
        lengthChange: false,
        searchDelay: 1000,
        searching: true,
        processing: true,
        // stateSave: true, // to save search kahit ilipat sa ibang menu
        language: {
          infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
          searchPlaceholder: "Forms, Subject, Requestor"
      },
        columns: columns,
        order: [[ 4, "asc" ]],  
        columnDefs: [
          {
              render: function ( data, type, row ) {
                  return row.tbl_id + ' ' + row.tbl_id;
              },
              // targets: -1
          }
      ],
       
        ajax: function (data, callback, settings) {

            const params = {
                _limit_offset: data.start,
                _search_string: data.search.value,
                _sort_by: data.columns[data.order[0].column].data,
                _sort_direction: data.order[0].dir,
                _uid: uid

            };
            app.view_table.request_search('sp-get_all_approval_history', params, function (response) {
              
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

          // DISPLAY STATUS WITH TEXT
          let stat;

          switch(data.status){
              case '0':
                  stat = '<span class="label label-sm gradient-4">Ongoing</span>';
                  break;
              case '1':
                  stat = '<span class="label label-sm gradient-1">Approved</span>';
                  break;
              case '2':
                  stat = '<span class="label label-sm gradient-2">Disapproved</span>';
                  break;
              // case '3':
              //     stat = '<span class="label label-sm gradient-2">Cancelled</span>';
              //     break;
              default:
                  stat = '<span class="label label-sm label-danger">N/A</span>';
                  break;
          }

          $( row ).find('td.status')
              .html(stat)
              .attr({
                  "data-tbl_id": data.tbl_id
              });
                
            $(row).addClass('hover_cls');

        }

    });
},
    
  },
  update_read: function(notif_id, cb){
    const params = {
      _notif_id: notif_id
  };
  app.crud.request('sp-update_notification_read', params, function (resp) {
      return cb(resp)
  });
  },
    
}
}


main.fn.tbl.notification()
main.fn.tbl.cancelled()
main.fn.tbl.request()
main.fn.tbl.approval()



$(document) 

.off('click', '.btn-read_message').on('click', '.btn-read_message', function(){
  let {tbl_id, read_status, notification_id} = $(this).data()
  // console.log({read_status})
  // console.log({tbl_id})
  // console.log({notification_id})


  if(!read_status) {
    main.fn.update_read(notification_id, function(){
      app.get.dashboard_count(uid, function(resp){ // update bell count
        let d = resp = undefined ? '' : resp[0]

        if(d.user_notificiation_count == 0) {
          $('.my_notification_count_nav').removeClass('badge-pill gradient-2')
        }

        $('.my_notification_count_nav').html(d.user_notificiation_count == 0 ? '' : d.user_notificiation_count)
        
        let read = $('.btn-read_message[data-tbl_id="'+tbl_id+'"]') 
        read.removeClass('text-warning')
        
        let change_icon_to_read = $('.btn-read_message[data-tbl_id="'+tbl_id+'"] i') 
        change_icon_to_read.removeClass('fa fa-envelope').addClass('fa fa-envelope-open')

        // $('#notification_tbl').DataTable().draw() // refresh with false = to retain page when draw
      })
    
  })
  } 
  app.loader('show', '#modal-view_notif_details .modal-body');
  app.get.notif_details(tbl_id, function(resp){
    let d = resp[0]
    console.log({d})

    let approver = d.approver_list.split(',')

    let approver_list = approver.map((v,i) => {
        return(`<div>${v}</div>`)
    }) 
    
    let notif = d.notified_person_list.split(',')

    let notif_list = notif.map((v,i) => {
        return(`<div>${v}</div>`)
    }) 
    

    let url_main = server_url + '/uploads/'+ d.filename_main
    let download_link_main = `<a href="${url_main}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;
    let url_sup = server_url + '/uploads/'+ d.filename_sup
    let download_link_sup = `<a href="${url_sup}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;


    // console.log({download_link_main})
    // console.log({download_link_sup})

    let d_stat = $('.txt_document_status');

    switch(d.status){
      case '0': 
        d_stat.html('Ongoing').addClass('gradient-4').removeClass('gradient-1 gradient-2')
      break
      case '1': 
        d_stat.html('Approved').addClass('gradient-1').removeClass('gradient-4 gradient-2')
      break
      case '2': 
        d_stat.html('Disapproved').addClass('gradient-2').removeClass('gradient-1 gradient-4')
      break
      case '3': 
        d_stat.html('Cancelled').addClass('gradient-2').removeClass('gradient-1 gradient-4')
      break
      default:
        console.log('errorrr')
      break

    }

    $('.txt_trans_no').html(d.tbl_id)
    $('.txt_category').html(d.category)
    $('.txt_requestor').html(d.requestor)
    $('.txt_document_title').html(d.category)
    $('.txt_requestor_message').html(d.requestor_message)
    $('.txt_date_request').html(d.date_request)
    $('.txt_date_approved').html(d.date_approved)
    $('.txt_approved_by').html(d.approved_by)

    $('.txt_approver_list').html(approver_list)
    $('.txt_notified_person_list').html(notif_list)
    $('.file_main_attch').html(d.filename_main == '' || d.filename_main == null ? 'NA' : download_link_main)
    $('.file_sup_attch').html(d.filename_sup == '' || d.filename_sup == null ? 'NA' : download_link_sup)


    app.loader('hide', '#modal-view_notif_details .modal-body');

  })


})




