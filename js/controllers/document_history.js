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
                  `<a href="javascript:;" data-target="#modal-view_notif_details" data-toggle="modal" data-tbl_id="${data.tbl_id}" data-read_status="${data.read_status}" data-notification_id="${data.notification_id}" class="btn tooltips text-orange btn-read_message">
                  <i class="fa fa-envelope-open tooltips" data-placement="top" title="Read"></i>
                  <span></span>
                  </a>`
                  )
                      
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
        $('#notification_tbl').DataTable().draw() // refresh with false = to retain page when draw
      })
    
  })
  } 
  app.loader('show', '#modal-view_notif_details .modal-body');
  app.get.notif_details(tbl_id, function(resp){
    let d = resp[0]
    console.log({d})

    // todo: modal details and then the rest of the tables.

    app.loader('hide', '#modal-view_notif_details .modal-body');

  })


})




