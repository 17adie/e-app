app.log.check_session()

let uid = app.cookie.get('uid');
let _utype = app.cookie.get("utype");

let issued_by;
let myBarChart;

const main = {
  fn: {
    calculate_days: function(date_needed){

      let date_now = moment().format("YYYY-MM-DD");
      let diff = moment(date_needed, 'YYYY-MM-DD').businessDiff(moment(date_now,'YYYY-MM-DD'));

      return diff;
    },
    chart: {
      get_status: function(cb){
          const filters = main.fn.filter.get_status()
          const params = {
              _date_from: filters.d_from,
              _date_to: filters.d_to,
              _date_year: filters.d_year,
          };
          
          app.crud.request('sp-get_report_status_by_month_year_chart', params, function (response) {
          
            return cb(response)
          })
      },
      get_report: function(category, cb){
        const filters = main.fn.filter.get_status()
        const params = {
            _date_from: filters.d_from,
            _date_to: filters.d_to,
            _date_year: filters.d_year,
            _cat: category
        };
        
        app.crud.request('sp-get_all_report_barchart', params, function (response) {
        
          return cb(response)
        })
      },
      
    },
    filter: {
      get_status: function(){
        let d_from = $('#date_from').val()
        let d_to = $('#date_to').val()
        let d_year = $('#inp_year').val()
      
        const filters = {
            "d_from":d_from,
            "d_to": d_to,
            "d_year" : d_year
       };

       return filters;
      },
    },
    tbl: {
      // DATATABLES
      notification: function() {

          let unfiltered_rows_count;

          const columns = [
              {data: "read_status", title: "", className: 'read_status'},
              {data: "trans_no", title: "TRANS#", className: 'trans_no', sortable : false},
              {data: "category", title: "Form", className: 'category'},
              {data: "docs_status", title: "Document Status", className: 'docs_status'},
              {data: "requestor", title: "Requestor", className: 'requestor'},
              {data: "date_request", title: "Date Requested", className: 'date_request'},
              {title: "Priority", className: 'priority_level', sortable : false},
              {title: "Actions", className: 'td_actions' , sortable : false},
            //   {data: "date_approved", title: "Date Approved", className: 'date_approved'},
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
            dom: 'Bfrtip',
            buttons: [
              { 
                extend: 'pdf', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 1, 2, 3, 4, 5, 6 ]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 1, 2, 3, 4, 5, 6 ]
                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 1, 2, 3, 4, 5, 6 ]
                }
              },
                // 'copy', 
                // 'csv', 
                // 'excel', 
                // 'pdf', 
                // 'print'
            ],
              columns: columns,
              order: [[ 0, "asc" ], [ 5, "asc" ]],  
              columnDefs: [
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id;
                    },
                    targets: -1
                },
                {
                  render: function ( data, type, row ) {
                      // return row.tbl_id + ' ' + row.tbl_id;

                      let text;

                      if(row.docs_status == 1) {
                        let date_needed = moment(row.date_needed, 'YYYY-MM-DD')
                        let diff = main.fn.calculate_days(date_needed)
    
                        app.get.priority_status(diff, function(prio){
                          
                          text = prio;
    
                        })
                      } else {
                        text = 'N/A'
                      }

                      return text;
                  },
                  targets: -2
              },
              {
                render: function ( data, type, row ) {

                    // DISPLAY STATUS WITH TEXT
                    let docs_status;

                    switch(row.docs_status){
                        case '0':
                            docs_status = 'Pending';
                            break;
                        case '1':
                            docs_status = 'Approved';
                            break;
                        case '2':
                            docs_status = 'Disapproved';
                            break;
                        case '3':
                            docs_status = 'Cancelled';
                            break;
                        default:
                            docs_status = 'N/A';
                            break;
                    }

                    return docs_status;
                },
                targets: -5
            },
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
                    //   console.log({resp})
                      
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
                let docs_status;

                switch(data.docs_status){
                    case '0':
                        docs_status = '<span class="label label-sm gradient-4">Pending</span>';
                        break;
                    case '1':
                        docs_status = '<span class="label label-sm gradient-1">Approved</span>';
                        break;
                    case '2':
                        docs_status = '<span class="label label-sm gradient-2">Disapproved</span>';
                        break;
                    case '3':
                        docs_status = '<span class="label label-sm gradient-2">Cancelled</span>';
                        break;
                    default:
                        docs_status = '<span class="label label-sm label-danger">N/A</span>';
                        break;
                }

                $( row ).find('td.docs_status')
                    .html(docs_status)
                    .attr({
                        "data-tbl_id": data.tbl_id
                    });

                  // DISPLAY PRIO WITH TEXT

                  if(data.docs_status == 1) {
                    let date_needed = moment(data.date_needed, 'YYYY-MM-DD')
                    let diff = main.fn.calculate_days(date_needed)

                    app.get.priority_status(diff, function(prio){
                      
                      $( row ).find('td.priority_level').html(prio)

                    })
                  } else {
                    $( row ).find('td.priority_level').html('N/A')
                  }
                  

                $( row ).find('td.read_status')
                  .html(data.read_status != 1 ?`
                   <a href="javascript:;" data-target="#modal-view_notif_details" data-toggle="modal" data-docs_status="${data.docs_status}" data-tbl_id="${data.tbl_id}" data-read_status="${data.read_status}" data-notification_id="${data.notification_id}" class="btn text-warning tooltips btn-read_message">
                    <i class="fa fa-envelope tooltips" data-placement="top" title="Unread" ></i>
                   </a>` : 
                  `<a href="javascript:;" data-target="#modal-view_notif_details" data-toggle="modal" data-docs_status="${data.docs_status}" data-tbl_id="${data.tbl_id}" data-read_status="${data.read_status}" data-notification_id="${data.notification_id}" class="btn tooltips btn-read_message">
                  <i class="fa fa-envelope-open tooltips" data-placement="top" title="Read"></i>
                  <span></span>
                  </a>`
                  )

 
                  let html_action = () => {

                    // none notified personnel
                    if(_utype != 'user_np') return 'N/A'

                    // processed
                    if(_utype == 'user_np' && data.docs_status == 1 && data.issued_tag == 1) return '<span class="label label-sm label-success">Processed</span>'
                    
                    // rejected
                    if(_utype == 'user_np' && data.docs_status == 1 && data.rejected_tag == 1) return '<span class="label label-sm label-danger">Rejected</span>'
                    
                    // process and reject buttons
                    if(_utype =='user_np' && data.docs_status == 1) return `
                      <a href="javascript:void(0)" class="custom_action_icon_btn process_document text-success" data-pr_tag="1" data-form="${data.form}" data-document_title="${data.document_title}" data-email="${data.email}" data-requestor="${data.requestor}" data-docs_status="${data.docs_status}" data-tbl_id="${data.tbl_id}"  data-trans_no="${data.trans_no}" data-toggle="tooltip" data-placement="top" title="Process" data-original-title="Process">
                        <i class="fa fa-check"></i>
                      </a>
                      <a href="javascript:void(0)" class="custom_action_icon_btn process_document text-danger" data-pr_tag="2" data-form="${data.form}" data-document_title="${data.document_title}" data-email="${data.email}" data-requestor="${data.requestor}" data-docs_status="${data.docs_status}" data-tbl_id="${data.tbl_id}"  data-trans_no="${data.trans_no}" data-toggle="tooltip" data-placement="top" title="Reject" data-original-title="Reject">
                        <i class="fa fa-close"></i>
                      </a>`

                    // muted check for pending, disapproved, cancelled status
                    if(_utype == 'user_np' && data.docs_status != 1) return `
                      <div href="javascript:void(0)" class="custom_action_icon_btn text-muted">
                        <i class="fa fa-check"></i>
                      </div`

                  }

                   $( row ).find('td:eq(-1)').html(html_action())

                  // // exclude process in normal user but notified.
                  // let _utype = app.cookie.get("utype");

                  // $( row ).find('td:eq(-1)')
                  // .html(_utype == 'user_np' ? data.docs_status == 1 ?  data.issued_tag == 1 ?
                  // `<span class="label label-sm label-success">Processed</span>` :
                  // `<a href="javascript:void(0)" class="custom_action_icon_btn process_document text-success" data-form="${data.form}" data-document_title="${data.document_title}" data-email="${data.email}" data-requestor="${data.requestor}" data-docs_status="${data.docs_status}" data-tbl_id="${data.tbl_id}"  data-trans_no="${data.trans_no}" data-toggle="tooltip" data-placement="top" title="Process" data-original-title="Process">
                  //   <i class="fa fa-check"></i>
                  // </a>
                  // <a href="javascript:void(0)" class="custom_action_icon_btn process_document text-danger" data-form="${data.form}" data-document_title="${data.document_title}" data-email="${data.email}" data-requestor="${data.requestor}" data-docs_status="${data.docs_status}" data-tbl_id="${data.tbl_id}"  data-trans_no="${data.trans_no}" data-toggle="tooltip" data-placement="top" title="Reject" data-original-title="Reject">
                  //   <i class="fa fa-close"></i>
                  // </a>
                  // ` : 
                  // `<div href="javascript:void(0)" class="custom_action_icon_btn text-muted">
                  //   <i class="fa fa-check"></i>
                  // </div>` : 'N/A'
                  // )
                      
                  $(row).addClass('hover_cls');

              }

          });
      },
      cancelled: function() {

        let unfiltered_rows_count;

        const columns = [
            {data: "trans_no", title: "TRANS#", className: 'trans_no', sortable : false},
            {data: "document_title", title: "Subject", className: 'document_title'},
            {data: "category", title: "Form", className: 'category'},
            {data: "status", title: "Document Status", className: 'status'},
            {data: "date_request", title: "Date Requested", className: 'date_request'},
            {data: "cancelled_date", title: "Date Cancelled", className: 'cancelled_date'},
            {title: "Actions", className: 'td_action', sortable : false}
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
          dom: 'Bfrtip',
            buttons: [
              { 
                extend: 'pdf', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0, 1, 2, 3, 4, 5 ]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0, 1, 2, 3, 4, 5 ]
                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0, 1, 2, 3, 4, 5 ]
                }
              },
                // 'copy', 
                // 'csv', 
                // 'excel', 
                // 'pdf', 
                // 'print'
            ],
            columns: columns,
            order: [[ 4, "asc" ]],  
            columnDefs: [
              {
                  render: function ( data, type, row ) {
                      return row.tbl_id + ' ' + row.tbl_id;
                  },
                  targets: -1
              },
              {
                render: function ( data, type, row ) {

                    // DISPLAY STATUS WITH TEXT
                    let docs_status;

                    switch(row.status){
                        case '0':
                            docs_status = 'Pending';
                            break;
                        case '1':
                            docs_status = 'Approved';
                            break;
                        case '2':
                            docs_status = 'Disapproved';
                            break;
                        case '3':
                            docs_status = 'Cancelled';
                            break;
                        default:
                            docs_status = 'N/A';
                            break;
                    }

                    return docs_status;
                },
                targets: -4
            },
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

            $( row ).find('td:eq(-1)')
                .html(`
                <div style="display:flex">
                <a href="javascript:void(0)" data-target="#modal-view_notif_details" data-toggle="modal" class="custom_action_icon_btn text-warning view_docs_details" data-toggle="tooltip" data-placement="top" title="View" data-original-title="View">
                    <i class="fa fa-file-text"></i>
                </a>
                </div>
                `
                );

              $( row ).find('td:eq(-1) > div > a')
                  .attr({
                      'data-tbl_id': data.tbl_id,
                      'data-docs_status': 3,
                      'data-trans_no': data.trans_no,
              });

              // DISPLAY STATUS WITH TEXT
              let stat;

              switch(data.status){
                  // case '0':
                  //     stat = '<span class="label label-sm gradient-4">Pending</span>';
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
          {data: "trans_no", title: "TRANS#", className: 'trans_no', sortable : false},
          {data: "document_title", title: "Subject", className: 'document_title'},
          {data: "category", title: "Form", className: 'category'},
          {data: "docs_status", title: "Document Status", className: 'docs_status'},
          {data: "date_request", title: "Date Requested", className: 'date_request'},
        //   {data: "date_approved", title: "Date Approved", className: 'date_approved'},
          {title: "Actions", className: 'td_action', sortable : false}
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
        dom: 'Bfrtip',
            buttons: [
              { 
                extend: 'pdf', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3, 4 ]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0, 1, 2, 3, 4 ]

                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0, 1, 2, 3, 4 ]

                }
              },
                // 'copy', 
                // 'csv', 
                // 'excel', 
                // 'pdf', 
                // 'print'
            ],
          columns: columns,
          order: [[ 4, "asc" ]],  
          columnDefs: [
            {
                render: function ( data, type, row ) {
                    return row.tbl_id + ' ' + row.tbl_id;
                },
                targets: -1
            },
            {
              render: function ( data, type, row ) {

                  // DISPLAY STATUS WITH TEXT
                  let docs_status;

                  switch(row.docs_status){
                      case '0':
                          docs_status = 'Pending';
                          break;
                      case '1':
                          docs_status = 'Approved';
                          break;
                      case '2':
                          docs_status = 'Disapproved';
                          break;
                      case '3':
                          docs_status = 'Cancelled';
                          break;
                      default:
                          docs_status = 'N/A';
                          break;
                  }

                  return docs_status;
              },
              targets: -3
          },
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
                //   console.log({resp})
                  
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

            $( row ).find('td:eq(-1)')
            .html(`
            <div style="display:flex">
              <a href="javascript:void(0)" data-target="#modal-view_notif_details" data-toggle="modal" class="custom_action_icon_btn text-warning view_docs_details" data-toggle="tooltip" data-placement="top" title="View" data-original-title="View">
                <i class="fa fa-file-text"></i>
              </a>
            </div>
            `
            );

              $( row ).find('td:eq(-1) > div > a')
                  .attr({
                      'data-tbl_id': data.tbl_id,
                      'data-docs_status': data.docs_status,
                      'data-trans_no': data.trans_no,
              });

            // DISPLAY STATUS WITH TEXT
            let docs_status;

            switch(data.docs_status){
                case '0':
                    docs_status = '<span class="label label-sm gradient-4">Pending</span>';
                    break;
                case '1':
                    docs_status = '<span class="label label-sm gradient-1">Approved</span>';
                    break;
                case '2':
                    docs_status = '<span class="label label-sm gradient-2">Disapproved</span>';
                    break;
                default:
                    docs_status = '<span class="label label-sm label-danger">N/A</span>';
                    break;
            }

            $( row ).find('td.docs_status')
                .html(docs_status)
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
        {data: "trans_no", title: "TRANS#", className: 'trans_no', sortable : false},
        {data: "document_title", title: "Subject", className: 'document_title'},
        {data: "category", title: "Form", className: 'category'},
        {data: "docs_status", title: "Document Status", className: 'docs_status'},
        {data: "requestor", title: "Requestor", className: 'requestor'},
        {data: "date_request", title: "Date Requested", className: 'date_request'},
        {title: "Actions", className: 'td_action', sortable : false}
        // {data: "date_approved", title: "Date Approved", className: 'date_approved'},
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
      dom: 'Bfrtip',
            buttons: [
              { 
                extend: 'pdf', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0,1, 2, 3, 4, 5 ]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0,1, 2, 3, 4, 5 ]
                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                columns: [ 0,1, 2, 3, 4, 5 ]
                }
              },
                // 'copy', 
                // 'csv', 
                // 'excel', 
                // 'pdf', 
                // 'print'
            ],
        columns: columns,
        order: [[ 4, "asc" ]],  
        columnDefs: [
          {
              render: function ( data, type, row ) {
                  return row.tbl_id + ' ' + row.tbl_id;
              },
              targets: -1
          },
          {
            render: function ( data, type, row ) {

                // DISPLAY STATUS WITH TEXT
                let docs_status;

                switch(row.docs_status){
                    case '0':
                        docs_status = 'Pending';
                        break;
                    case '1':
                        docs_status = 'Approved';
                        break;
                    case '2':
                        docs_status = 'Disapproved';
                        break;
                    case '3':
                        docs_status = 'Cancelled';
                        break;
                    default:
                        docs_status = 'N/A';
                        break;
                }

                return docs_status;
            },
            targets: -4
        },
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

            $( row ).find('td:eq(-1)')
            .html(`
            <div style="display:flex">
              <a href="javascript:void(0)" data-target="#modal-view_notif_details" data-toggle="modal" class="custom_action_icon_btn text-warning view_docs_details" data-toggle="tooltip" data-placement="top" title="View" data-original-title="View">
                <i class="fa fa-file-text"></i>
              </a>
            </div>
            `
            );

              $( row ).find('td:eq(-1) > div > a')
                  .attr({
                      'data-tbl_id': data.tbl_id,
                      'data-docs_status': data.docs_status,
                      'data-trans_no': data.trans_no,
              });

          // DISPLAY STATUS WITH TEXT
          let stat;

          switch(data.docs_status){
              case '0':
                  stat = '<span class="label label-sm gradient-4">Pending</span>';
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

          $( row ).find('td.docs_status')
              .html(stat)
              .attr({
                  "data-tbl_id": data.tbl_id
              });
                
            $(row).addClass('hover_cls');

        }

    });
},
get_status: function() {

  let unfiltered_rows_count;

  const columns = [
      {data: "month", title: "Month", className: 'month', sortable : false},
      {data: "approved", title: "Approved", className: 'approved', sortable : false},
      {data: "issued", title: "Issued", className: 'issued', sortable : false},
      {data: "ongoing", title: "Pending", className: 'ongoing', sortable : false},
      {data: "disapproved", title: "Disapproved", className: 'disapproved', sortable : false},
      {data: "cancelled", title: "Cancelled", className: 'cancelled', sortable : false},
     
  ]

  $('#status_tbl').dataTable({
      serverSide: true,
      lengthChange: false,
      searchDelay: 1000,
      searching: true,
      processing: true,
      searching: false,
      columns: columns,
      // order: [[ 4, "asc" ]],  
      columnDefs: [
        {
            render: function ( data, type, row ) {
                return row.month;
            },
            // targets: -1
        }
      ],
     
      ajax: function (data, callback, settings) {
          const filters = main.fn.filter.get_status()
          const params = {
              _limit_offset: data.start,
              _date_from: filters.d_from,
              _date_to: filters.d_to,
              _date_year: filters.d_year,
          };
          // console.log({params})
          app.view_table.request_date('sp-get_report_status_by_month_year', params, function (response) {
            
              let resp = response.data || [];

              // console.log({resp})
              
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

      }

  });
},
get_status_by_name: function() {

  let unfiltered_rows_count;

  const columns = [
      {data: "requestor", title: "Employee Name", className: 'requestor', sortable : false},
      {data: "jan", title: "Jan", className: 'jan', sortable : false},
      {data: "feb", title: "Feb", className: 'feb', sortable : false},
      {data: "mar", title: "Mar", className: 'mar', sortable : false},
      {data: "apr", title: "Apr", className: 'apr', sortable : false},
      {data: "may", title: "May", className: 'may', sortable : false},
      {data: "jun", title: "Jun", className: 'jun', sortable : false},
      {data: "jul", title: "Jul", className: 'jul', sortable : false},
      {data: "aug", title: "Aug", className: 'aug', sortable : false},
      {data: "sept", title: "Sept", className: 'sept', sortable : false},
      {data: "oct", title: "Oct", className: 'oct', sortable : false},
      {data: "nov", title: "Nov", className: 'nov', sortable : false},
      {data: "dec", title: "Dec", className: 'dec', sortable : false},
    
     
  ]

  $('#status_by_name_tbl').dataTable({
      serverSide: true,
      lengthChange: false,
      searchDelay: 1000,
      searching: true,
      processing: true,
      searching: false,
      columns: columns,
      // order: [[ 4, "asc" ]],  
      columnDefs: [
        {
            render: function ( data, type, row ) {
                return row.month;
            },
            // targets: -1
        }
      ],
     
      ajax: function (data, callback, settings) {
          const filters = main.fn.filter.get_status()
          const params = {
              _limit_offset: data.start,
              _date_from: filters.d_from,
              _date_to: filters.d_to,
              _date_year: filters.d_year,
          };
          // console.log({params})
          app.view_table.request_date('sp-get_report_status_by_name', params, function (response) {
            
              let resp = response.data || [];

              // console.log({resp})
              
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
  get_docs_details: function(tbl_id, docs_status, cb){
    const params = {
        _approval_id: tbl_id
    };
    app.crud.request('sp-get_notification_details', params, function (resp) {

    let d = resp[0]

    let approver = d.approver_list.split('|')

    let approver_list = approver.map((v,i) => {
      let textColor;

      if(v.search(/\bPending\b/) >= 0) {
          textColor = 'badge-warning'
      } else if(v.search(/\bApproved\b/) >= 0) {
          textColor = 'badge-success'
      } else if(v.search(/\bDisapproved\b/) >= 0) {
          textColor = 'badge-danger'
      } else {
          console.log({textColor})
      }
      
      return(`<div class="m-1 custom-badge ${textColor}" style="font-size: 14px">${v}</div>`)
    }) 

    let notif_list = 'N/A';
      

    if(d.notified_person_list) {
        let notif = d.notified_person_list.split(',')

        notif_list = notif.map((v,i) => {
            return(`<div>${v}</div>`)
        }) 

    }
    
    let url_main = server_url + '/uploads/'+ d.filename_main
    let download_link_main = `<a href="${url_main}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;
    let url_sup = server_url + '/uploads/'+ d.filename_sup
    let download_link_sup = `<a href="${url_sup}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;

    let d_stat = $('.txt_document_status');

    switch(docs_status){
      case 0: 
        d_stat.html('Pending').addClass('gradient-4').removeClass('gradient-1 gradient-2')
      break
      case 1: 
        d_stat.html('Approved').addClass('gradient-1').removeClass('gradient-4 gradient-2')
      break
      case 2: 
        d_stat.html('Disapproved').addClass('gradient-2').removeClass('gradient-1 gradient-4')
      break
      case 3: 
        d_stat.html('Cancelled').addClass('gradient-2').removeClass('gradient-1 gradient-4')
      break
      default:
        console.log('errorrr')
      break

    }

    $('.txt_trans_no').html(d.trans_no)
    $('.txt_category').html(d.category)
    $('.txt_requestor').html(d.requestor)
    $('.txt_document_title').html(d.category)
    $('.txt_requestor_message').html(d.requestor_message)
    $('.txt_date_request').html(d.date_request)

    $('.txt_approver_list').html(approver_list)
    $('.txt_notified_person_list').html(notif_list)
    $('.file_main_attch').html(d.filename_main == '' || d.filename_main == null ? 'NA' : download_link_main)
    $('.file_sup_attch').html(d.filename_sup == '' || d.filename_sup == null ? 'NA' : download_link_sup)

    app.loader('hide', '#modal-view_notif_details .modal-body');

        return cb(resp)
    });
  },
  get_process_tag: function(tbl_id, cb) {
    const params = {
      _tbl_id: tbl_id,
      _uid: uid
    };
    app.crud.request('sp-get_process_tagging', params, function (resp) {
      return cb(resp)
    })
  },
  update_process_document: function(tbl_id, process_remarks, type, cb) {
    const params = {
      _tbl_id: tbl_id,
      _uid: uid,
      _process_remarks: process_remarks,
      _type: type
    };
    app.crud.request('sp-update_process_document', params, function (resp) {
      return cb(resp)
    })
  },
  check_user_type: function(){
    // let _utype = app.cookie.get("utype");

    if(_utype == 'user_np') {
      // console.log({_utype})
      $('.show_if_np').removeAttr('hidden')
    }

  },
}
}

main.fn.check_user_type()
main.fn.tbl.notification()
main.fn.tbl.cancelled()
main.fn.tbl.request()
main.fn.tbl.approval()
// main.fn.tbl.get_status()
// main.fn.tbl.get_status_by_name()
app.get.user_details(uid, function(resp){
  let ud = resp = undefined ? '' : resp[0]
    issued_by = ud.last_name + ', ' + ud.first_name;
})


$('#modal-view_notif_details').on('hidden.bs.modal', function () {
    $(this).find("div.col-7").html('').end()
    $('.txt_document_status').html('')
})

$(document) 


.off('click', '.btn-read_message').on('click', '.btn-read_message', function(){
  let {tbl_id, read_status, notification_id, docs_status} = $(this).data()
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

    let approver = d.approver_list.split('|')

    let approver_list = approver.map((v,i) => {

      console.log(v)
      console.log(v.search(/\bPending\b/) >= 0)

      let textColor;

      if(v.search(/\bPending\b/) >= 0) {
          textColor = 'badge-warning'
      } else if(v.search(/\bApproved\b/) >= 0) {
          textColor = 'badge-success'
      } else if(v.search(/\bDisapproved\b/) >= 0) {
          textColor = 'badge-danger'
      } else {
          console.log({textColor})
      }

      return(`<div class="m-1 custom-badge ${textColor}" style="font-size: 14px">${v}</div>`)
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
    // console.log({docs_status})

    switch(docs_status){
      case 0: 
        d_stat.html('Pending').addClass('gradient-4').removeClass('gradient-1 gradient-2')
      break
      case 1: 
        d_stat.html('Approved').addClass('gradient-1').removeClass('gradient-4 gradient-2')
      break
      case 2: 
        d_stat.html('Disapproved').addClass('gradient-2').removeClass('gradient-1 gradient-4')
      break
      case 3: 
        d_stat.html('Cancelled').addClass('gradient-2').removeClass('gradient-1 gradient-4')
      break
      default:
        console.log('errorrr')
      break

    }

    $('.txt_trans_no').html(d.trans_no)
    $('.txt_category').html(d.category)
    $('.txt_requestor').html(d.requestor)
    $('.txt_document_title').html(d.category)
    $('.txt_requestor_message').html(d.requestor_message)
    $('.txt_date_request').html(d.date_request)
    // $('.txt_date_approved').html(d.date_approved)
    // $('.txt_approved_by').html(d.approved_by)

    $('.txt_approver_list').html(approver_list)
    $('.txt_notified_person_list').html(notif_list)
    $('.file_main_attch').html(d.filename_main == '' || d.filename_main == null ? 'NA' : download_link_main)
    $('.file_sup_attch').html(d.filename_sup == '' || d.filename_sup == null ? 'NA' : download_link_sup)
    $('.txt_disapproved_remarks').html(d.disapproved_remarks)



    app.loader('hide', '#modal-view_notif_details .modal-body');

  })


})


.off('click', '.view_docs_details').on('click', '.view_docs_details', function(){
    let {tbl_id , docs_status, trans_no} = $(this).data()

    // console.log({trans_no})
    // console.log({tbl_id})
    // console.log({docs_status})

    app.loader('show', '#modal-view_notif_details .modal-body');
    main.fn.get_docs_details(tbl_id, docs_status, function(){
    })

})

.off('click', '.process_document').on('click', '.process_document', function(){
  let {tbl_id , docs_status, trans_no, requestor, email, document_title, form, pr_tag} = $(this).data()
  let email_to = email.split() // convert to array for global notification
  let text = `<small>Trans #: </small> ${trans_no} <br> <small>Requestor: </small> ${requestor}`

  // console.log({email})
  // console.log({trans_no})
  // console.log({tbl_id})
  // console.log({docs_status})
  // console.log({email_to})
  console.log({pr_tag})

  main.fn.get_process_tag(tbl_id, function(resp){
    let ptag = resp[0].process_tag
    // console.log({ptag})

    if(ptag) {
      // Swal.fire('Invalid!', 'Document already sent a notification', 'error')
      Toast.fire({ icon: 'warning', title: 'Document already sent a notification.'})
      return
    }

    if(pr_tag == 1) {

      Swal.fire({
        title:"Are you sure you want to process this document?",
        html: text,
        input: 'text',
        inputPlaceholder: 'Enter Remarks (optional)',
        icon:'question',
        showCancelButton: true,
        confirmButtonText: 'Yes!',
        showLoaderOnConfirm: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        preConfirm: (process_remarks) => {
        console.log(process_remarks)
       
          return new Promise((resolve, reject) => { // for sweetalert loader ..
              main.fn.update_process_document(tbl_id, process_remarks, 1, function(resp){
                app.email_notification({ // notification for notifed person
                  doc_title : document_title,  
                  issued_by: issued_by,
                  email_to : email_to, 
                  trans_no : trans_no,
                  form_name : form,
                  process_remarks: process_remarks == '' ? 'N/A' : process_remarks,
                  file_name: 'email_notification_process'}, function(resp){
                  console.log('pre pros', {resp})
                  return resolve(resp)
                })
                
              })
      
          }).catch(err => { console.log(err) });
           
        },
      }).then((result) => {
        if (result.isConfirmed) {
          $("#notification_tbl").DataTable().draw();
          Toast.fire({ icon: 'success', title: 'Document notification sent successfully' })
        }
    
      })

    } else if(pr_tag == 2) {


      Swal.fire({
        title:"Are you sure you want to reject this document?",
        html: text,
        input: 'text',
        inputPlaceholder: 'Enter Remarks (optional)',
        icon:'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes!',
        showLoaderOnConfirm: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        preConfirm: (process_remarks) => {
        console.log(process_remarks)
       
          return new Promise((resolve, reject) => { // for sweetalert loader ..
              main.fn.update_process_document(tbl_id, process_remarks, 2, function(resp){
                app.email_notification({ // notification for notifed person
                  doc_title : document_title,  
                  issued_by: issued_by,
                  email_to : email_to, 
                  trans_no : trans_no,
                  form_name : form,
                  process_remarks: process_remarks == '' ? 'N/A' : process_remarks,
                  file_name: 'email_notification_reject'}, function(resp){
                  console.log('pre pros', {resp})
                  return resolve(resp)
                })
                
              })
      
          }).catch(err => { console.log(err) });
           
        },
      }).then((result) => {
        if (result.isConfirmed) {
          $("#notification_tbl").DataTable().draw();
          Toast.fire({ icon: 'success', title: 'Document notification sent successfully' })
        }
    
      })




    } else {
      console.log('error tag', pr_tag)
    }


    
  })

})

.off('click', '.search_data').on('click', '.search_data', function(){

  const { d_from, d_to, d_year} = main.fn.filter.get_status()

  if(d_from == '' || d_to == '' || d_year == '') {
    Toast.fire({ icon: 'error', title: 'Please fill all required fields.' }) 
    return
  }

  if(parseInt(d_from) > parseInt(d_to)) {
    Toast.fire({ icon: 'error', title: 'Invalid date range.' })
    return
  }


  let showChart = (chart_id, month, data, text) => {

    Highcharts.chart(chart_id, {
      chart: {
          type: 'column'
      },
      title: {
          text: text
      },
      // subtitle: {
      //     text: 'Source: WorldClimate.com'
      // },
      xAxis: {
          categories: month,
          crosshair: true
      },
      yAxis: {
          min: 0,
          title: {
              text: 'COUNT'
          }
      },
      // tooltip: {
      //     headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      //     pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      //         '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
      //     footerFormat: '</table>',
      //     shared: true,
      //     useHTML: true
      // },
      plotOptions: {
          column: {
              pointPadding: 0.2,
              borderWidth: 0
          }
      },
      series: data
  });


  }


  main.fn.chart.get_report('isr' , function(resp) {
    
    // console.table(resp)

    let name = ['Requests', 'Approved within Leadtime', 'Expired (Lapsed Requests)']

    let getMonth = resp.map(v => v.month)
    let getRequest = resp.map(v => parseInt(v.docs_request))
    let getApproved = resp.map(v => parseInt(v.approved_w_lt))
    let getExpired = resp.map(v => parseInt(v.expired))

    let getData = [getRequest, getApproved, getExpired]

    let reformattedData = getData.map( (v, i) => {
      return ({
        name: name[i],
        data: v
      })
    })

    // console.log({reformattedData})

    showChart('isr', getMonth, reformattedData, 'Overall Summary report: Leadtime Approval Summary')


  })
  

  main.fn.chart.get_report('ps' , function(resp) {
    
    // console.table(resp)

    let name = ['Approved Requests', 'Issued Requests', 'Pending Requests', 'Rejecte Requests']

    let getMonth = resp.map(v => v.month)
    let getApproved = resp.map(v => parseInt(v.approved))
    let getIssued = resp.map(v => parseInt(v.issued))
    let getPending = resp.map(v => parseInt(v.pending))
    let getRejected = resp.map(v => parseInt(v.rejected))

    let getData = [getApproved, getIssued, getPending, getRejected]

    let reformattedData = getData.map( (v, i) => {
      return ({
        name: name[i],
        data: v
      })
    })

    showChart('ps', getMonth, reformattedData, 'Processing Summary')


  })




})


// old report
// .off('click', '.search_data').on('click', '.search_data', function(){

//   const { d_from, d_to, d_year} = main.fn.filter.get_status()

//   if(d_from == '' || d_to == '' || d_year == '') {
//     Toast.fire({ icon: 'error', title: 'Please fill all required fields.' }) 
//     return
//   }

//   // console.log({d_from})
//   // console.log({d_to})
//   // console.log('d_from > d_to', d_from > d_to)

//   if(parseInt(d_from) > parseInt(d_to)) {
//     Toast.fire({ icon: 'error', title: 'Invalid date range.' })
//     return
//   }

//   main.fn.chart.get_status( function(resp){
//     // console.table(resp)

//     let get_months = resp.map(v => v.month);
//     let get_approved = resp.map(v => v.approved)
//     let get_issued = resp.map(v => v.issued)
//     let get_ongoing = resp.map(v => v.ongoing)
//     let get_disapproved = resp.map(v => v.disapproved)
//     let get_cancelled = resp.map(v => v.cancelled)

//     // console.log({get_approved})
//     // console.log({get_issued})
//     // console.log({get_ongoing})
//     // console.log({get_disapproved})
//     // console.log({get_cancelled})
//     // console.log({get_months})

//     let chartStatus = Chart.getChart("barChartSummary"); // <canvas> id
//     if (chartStatus != undefined) {
//       chartStatus.destroy();
//     }
   
//     var ctx = document.getElementById("barChartSummary").getContext("2d");

//     var data = {
//         labels: get_months,
//         datasets: [
//             {
//                 label: "Approved",
//                 backgroundColor: "rgba(75, 192, 192, 0.2)",
//                 borderColor: "rgb(75, 192, 192)",
//                 borderWidth: 1,
//                 data: get_approved
//             },
//             {
//                 label: "Issued",
//                 backgroundColor: "rgba(153, 102, 255, 0.2)",
//                 borderColor: "rgb(153, 102, 255)",
//                 borderWidth: 1,
//                 data: get_issued
//             },
//             {
//                 label: "Pending",
//                 backgroundColor: "rgba(255, 205, 86, 0.2)",
//                 borderColor: "rgb(255, 205, 86)",
//                 borderWidth: 1,
//                 data: get_ongoing
//             },
//             {
//                 label: "Disapproved",
//                 backgroundColor: "rgba(255, 99, 132, 0.2)",
//                 borderColor: "rgb(255, 99, 132)",
//                 borderWidth: 1,
//                 data: get_disapproved
//             },
//             {
//               label: "Cancelled",
//               backgroundColor: "rgba(255, 159, 64, 0.2)",
//               borderColor: "rgb(255, 159, 64)",
//               borderWidth: 1,
//               data: get_cancelled
//             },
//         ]
//     };

//     myBarChart = new Chart(ctx, {
//         type: 'bar',
//         data: data,
//         options: {
//           scales: {
//             y: {
//               beginAtZero: true
//             }
//           }
//         },
//     });

//     $("#status_tbl").DataTable().draw();
//     $("#status_by_name_tbl").DataTable().draw();
//   })

 


// })





