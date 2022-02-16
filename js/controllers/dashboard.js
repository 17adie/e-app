app.log.check_session()

let uid = app.cookie.get('uid');

const main = {
  fn: {
    tbl: {

      // DATATABLES
      my_request: function() {

          let unfiltered_rows_count;

          const columns = [
              {data: "tbl_id", title: "Transaction #", className: 'tbl_id'},
              {data: "document_title", title: "Document", className: 'document_title'},
              {data: "date_needed", title: "Date Needed", className: 'date_needed'},
              {data: "status", title: "Status", className: 'status'},
          ]

          $('#request_tbl').dataTable({
              serverSide: true,
              lengthChange: false,
              searching: false,
              processing: true,
              language: {
                  infoFiltered: "", 
              },
              columns: columns,
              order: [[ 0, "asc" ]],    // ORDER BY 0 = id_num
             
              ajax: function (data, callback, settings) {

                  const params = {
                      _limit_offset: data.start,
                      _search_string: uid,
                      _sort_by: data.columns[data.order[0].column].data,
                      _sort_direction: data.order[0].dir

                  };
                  console.log({params})
                  app.view_table.request('sp-get_document_request', params, function (response) {
                    
                      let resp = response.data || [];
                    console.log(resp)
                     
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
                  var stat;

                  switch(data.status){
                      case '0':
                          stat = '<span class="label label-sm gradient-4">For Approval</span>';
                          break;
                      // case '1':
                      //     stat = '<span class="label label-sm label-success">Document Approved</span>';
                      //     break;
                      // case '2':
                      //     stat = '<span class="label label-sm label-success">Document Disapproved</span>';
                      //     break;
                      // case '3':
                      //     stat = '<span class="label label-sm label-success">Cancelled</span>';
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
  }
}


app.get.dashboard_count(uid, function(resp) {
  main.fn.tbl.my_request()

  let d = resp = undefined ? '' : resp[0]

  $('.for_approval_count').html(d.user_approval_count)
  $('.my_forms_submitted_count').html(d.user_forms_count)
  $('.my_notification_count').html(d.user_notificiation_count)
  $('.my_document_request_count').html(d.for_approvals_count)

})

