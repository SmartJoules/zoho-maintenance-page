ZOHO.CREATOR.init()
        .then(function(data) {
// ZC Starts
var queryParams = ZOHO.CREATOR.UTIL.getQueryParams();
var config = { 
    appName : "smart-joules-app",
    reportName : "All_Maintanance_Scheduler_Task_Lists", 
    criteria : "Status = \"Pending\" && Task_Name != null",
    page : 1,
    pageSize : 100,
}
ZOHO.CREATOR.API.getAllRecords(config).then(function(response){
    var recordArr = response.data;
    x =0;
    for(var index in recordArr){
        x = x+1;
        const task = recordArr[index].Task_Name;
        const resp_type = recordArr[index].Field_Type.display_value;
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = x;
        tr.appendChild(td);
        const td1 = document.createElement("td");
        td1.textContent = task?task:"";
        td1.className = "text-start";
        tr.appendChild(td1);
        const td2 = document.createElement("td");
        td2.textContent = resp_type?resp_type:"";
        td2.className = "text-start";
        tr.appendChild(td2);
        const td3 = document.createElement("td");
        td3.className = "p-2";
        if(resp_type == "Multiple Choice")
        {
                const drop_down = document.createElement("div");
                const select_resp = document.createElement("select");
                select_resp.className = "form-select";
                const default_option = document.createElement("option");
                default_option.textContent = "Choose";
                const option1 = document.createElement("option");
                option1.textContent = "Yes";
                const option2 =document.createElement("option");
                option2.textContent = "No";
                select_resp.appendChild(default_option);
                select_resp.appendChild(option1);
                select_resp.appendChild(option2);
                drop_down.appendChild(select_resp);
                td3.appendChild(drop_down);
                tr.appendChild(td3);
               
        }
        else if(resp_type == "Number" || resp_type == "Text")
        {
            const input_type = (resp_type == "Number")?"number":(resp_type == "Text")?"text":"";
            const resp_input = document.createElement("input");
            resp_input.className = "form-control border";
            resp_input.id = "input-reponse" + index;
            resp_input.setAttribute("type",input_type);
            const resp_div = document.createElement("div");
            resp_div.appendChild(resp_input);
            td3.appendChild(resp_div);
            tr.appendChild(td3);
        }
        // Flag (Checkbox)
        const flag_td = document.createElement("td");
        const flag_input = document.createElement("input");
        flag_input.id = "flag"+ index;
        flag_input.setAttribute("type","checkbox");
        flag_input.className="form-check-input";
        flag_td.appendChild(flag_input);
        tr.appendChild(flag_td);
        // Remarks
        const td4 = document.createElement("td");
        const rem_div = document.createElement("div");
        const remark = document.createElement("input");
        remark.addEventListener("keypress",function(){
            const remark_ret = remark.value;
            console.log(remark_ret)
        })
        remark.className = "form-control";
        remark.setAttribute("type","text");
        remark.id = "resp-remark"+index;
        rem_div.appendChild(remark);
        td4.appendChild(rem_div);
        tr.appendChild(td4);
       
        // Attchments
        const td6 = document.createElement("td");
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = "attachments";
        modal.setAttribute("area-hidden","true");
        modal.setAttribute("tabindex","-1");
        const modal_dialog = document.createElement("div");
        modal_dialog.className = "modal-dialog";
        modal.appendChild(modal_dialog);
        const modal_content = document.createElement("div");
        modal_content.className = "modal-content";
        modal_dialog.appendChild(modal_content);
        const modal_header = document.createElement("div");
        modal_header.className = "modal-header";
        const h_five = document.createElement("h5");
        h_five.className = "modal-title";
        const close_btn = document.createElement("button");
        close_btn.className = "btn-close"
        close_btn.setAttribute("type","button");
        close_btn.setAttribute("data-bs-dismiss","modal");
        close_btn.setAttribute("area-label","Close");
        modal_header.appendChild(h_five);
        modal_header.appendChild(close_btn);
        const modal_body = document.createElement("div");
        modal_body.className = "modal-body";
        const attach_div = document.createElement("div");
        attach_div.className = "p-2 border";
        const file = document.createElement("input");
        file.className = "form-control";
        file.setAttribute("type","file");
        file.id = "formFile";
        attach_div.appendChild(file);
        const add_file = document.createElement("button");
        add_file.className ="btn btn-primary btn-sm mt-3";
        add_file.textContent = "Add New";
        modal_body.appendChild(attach_div);
        add_file.addEventListener("click",function(){
            modal_body.appendChild(attach_div);
        })
        modal_body.appendChild(add_file);
        modal_content.appendChild(modal_header);
        modal_content.appendChild(modal_body);
        const attach_btn = document.createElement("button");
        attach_btn.className = "btn btn-sm";
        attach_btn.setAttribute("data-bs-toggle","modal");
        attach_btn.setAttribute("data-bs-target","#attachments")
        const attch_icon = document.createElement("i");
        attch_icon.style.fontSize = "25px";
        attch_icon.className = "bi bi-folder-plus";
        attach_btn.appendChild(attch_icon);
        td6.appendChild(attach_btn);
        td6.appendChild(modal);
        tr.appendChild(td6);
        const tbody = document.querySelector("#t-body");
        tbody.appendChild(tr);
    }   
    // Submit Button
const submit_btn = document.querySelector(".submit-btn");
submit_btn.addEventListener("click",function(){
    const table_row = document.getElementsByTagName("tr");
    for (let i = 0; i < table_row.length; i++) {
        
    }
})
    
});
            // ZC ENDS
        });
        