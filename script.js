document.getElementsByClassName("wrapper")[0].style.display = "none";
ZOHO.CREATOR.init()
    .then(function (data) {
        //   
        var queryParams = ZOHO.CREATOR.UTIL.getQueryParams();
        var maintenance_id = queryParams.maintenance_id;
        const monthString = (int) => {
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            return months[int].substring(0, 3);
        }

        const createTable = async (start_date, end_date, site, area) => {

            let conditional_criteria = `Task_Name != "Measure Air Flow" && Task_Name != "Expense Inccurred" && Task_Name != "Inventory Consumption"`;
            if (queryParams.maintenance_id) {
                conditional_criteria += ` && Maintenance_ID == ${maintenance_id}`;
                conditional_criteria += (start_date) ? ` && Date_field == "${start_date} 00:00:00"` : "";
            }
            else {
                conditional_criteria += (start_date && end_date) ? ` && Date_field >= "${start_date}" && Date_field <= "${end_date}"` : "";
            }
            if (site) {
                conditional_criteria += ` && Site == ${site}`;
            }
            if (area) {
                conditional_criteria += ` && Area == "${area}"`;

            }
            const configuration = {
                appName: "smart-joules-app",
                reportName: "All_Maintenance_Scheduler_Task_List_Records",
                criteria: conditional_criteria,
                page: 1,
                pageSize: 200,
            }
            const response = await ZOHO.CREATOR.API.getAllRecords(configuration);
            let recordArr = response.data;
            const maintenanceArr = recordArr.reduce((acc, curr) => {
                if (!acc.includes(curr.Maintenance_ID)) {
                    acc.push(curr.Maintenance_ID);
                }
                return acc;
            }, [])
            recordArr.sort((a, b) => parseFloat(a["S_No"]) - parseFloat(b["S_No"]));
            const area_label = document.querySelector(`#area-name`);
            if (area) {
                area_label.textContent = area;
            }
            else {
                area_label.textContent = recordArr[0].Area;

            }
            const added_user = document.querySelector(`#added-user`);
            user_config = {
                appName: "smart-joules-app",
                reportName: "All_Maintenance_Scheduler_Report",
                criteria: `ID ==  ${recordArr[0].Maintenance_ID}`
            }
            const user_resp = await ZOHO.CREATOR.API.getAllRecords(user_config);
            if (user_resp.code == 3000) {
                added_user.value = user_resp.data[0].Completed_by;
            }


            const area_list = [];
            for (let j = 0; j < maintenanceArr.length; j++) {
                mConfig = {
                    appName: "smart-joules-app",
                    reportName: "All_Maintenance_Scheduler_Report",
                    id: maintenanceArr[j]
                }
                const m_obj = await ZOHO.CREATOR.API.getRecordById(mConfig);
                console.log(m_obj);
                const m_tr = document.createElement("tr");
                m_tr.innerHTML = `<td colspan="11" class="bg-light text-start fw-bold">${m_obj.data.Title}</td>`;
                document.querySelector("#t-body").appendChild(m_tr);
                const newRecordArr = recordArr.filter(rec => rec.Maintenance_ID == maintenanceArr[j]);
        
                for (let i = 0; i < newRecordArr.length; i++) {
                    area_list.push(newRecordArr[i].Area);
                    if (newRecordArr[i].Task_Name != "Measure Air Flow" && newRecordArr[i].Task_Name != "Expense Inccurred" && newRecordArr[i].Task_Name != "Inventory Consumption") {

                        function escapeDoubleQuotes(str) {
                            return str.replace(/"/g, '\\"');
                        }
                            const taskChoices = async (taskConfig)=>{
                                
                                taskConfig = {
                                    appName: "smart-joules-app",
                                    reportName: "All_Tasks",
                                    criteria: `Task_Name == "${escapeDoubleQuotes(newRecordArr[i].Task_Name)}" && Maintanance_ID == ${m_obj.data.Maintanance.ID}`
                                }
                                try{    
                                const task_resp = await ZOHO.CREATOR.API.getAllRecords(taskConfig);
                                const choices = task_resp.data[0];
                                return choices.Choices.map(choice => choice.display_value);
                                }
                                catch(err){
                                    // console.log(err);
                                    return [];
                                }
                            }
                            const task_choices = await taskChoices();
                        
                        const s_no = i + 1;
                        const tr = document.createElement("tr");
                        tr.className = `table-row`;
                        const audio_file = newRecordArr[i].Audio ? `https://creatorapp.zohopublic.in${newRecordArr[i].Audio}`.replace("api", "publishapi") + `&privatelink=q52rRrGjs3HzqO2GjTB28AvBeqgmKVMkma5HDOUxYwpq1Km45hJaRHn3q6Bukj4m0C1Zgq2gM1xg4wFKvrez60A7x2C7aMFxbO3V` : "";
                        let tr_data = `<td>${s_no}
                        <audio class="d-none" id="audioPlayer${i}" controls>
                            <source src="${audio_file}" type="audio/mpeg">
                          </audio>
                        </td>
                            <td class='text-nowrap'>${newRecordArr[i].Date_field.substring(0, 6)}</td>
                            <td class='text-start' style='min-width: 200px;'>${newRecordArr[i].Task_Name} ${newRecordArr[i].Audio ? `<span class="fs-6 cursor-pointer" id="audio-${i}"><i class='bi bi-play-fill'></i></span>` :""}</td>`;
                            
                        tr_data += `<td class='d-none'>${newRecordArr[i].Field_Type.display_value}</td>`;
                        let select_tag = `<td id='resp-opt${i}' id='select' style='min-width: 150px;'><select class='form-select' id='input-reponse${i}'>
                           <option value=null ${(newRecordArr[i].Response_Option.display_value || newRecordArr[i].Response_Option1) ? '' : 'selected'}>Choose</option>`;
                           select_tag += task_choices.includes("Yes") ? `<option value='Yes' ${(newRecordArr[i].Response_Option.display_value === 'Yes') ? 'selected' : (newRecordArr[i].Response_Option1 === 'Yes') ? 'selected' : ''}>Yes</option>`: "";
                           select_tag += task_choices.includes("No") ? `<option value='No' ${(newRecordArr[i].Response_Option.display_value === 'No') ? 'selected' : (newRecordArr[i].Response_Option1 === 'No') ? 'selected' : ''}>No</option>`:"" ;
                           select_tag += task_choices.includes("Done") ? `<option value='Done' ${(newRecordArr[i].Response_Option.display_value === 'Done' || newRecordArr[i].Response_Option1 === "Done") ? 'selected' : ''}>Done</option>`:"";
                           select_tag += task_choices.includes("Not Done") ? `<option value='Not Done' ${(newRecordArr[i].Response_Option.display_value == 'Not Done' || newRecordArr[i].Response_Option1 === "Not Done") ? 'selected' : ''}>Not Done</option>`:"";
                           select_tag += task_choices.includes("Okay") ? `<option value='Not Done' ${(newRecordArr[i].Response_Option.display_value == 'Okay' || newRecordArr[i].Response_Option1 === "Okay") ? 'selected' : ''}>Okay</option>`:"";
                           select_tag += task_choices.includes("Not Okay") ? `<option value='Not Okay' ${(newRecordArr[i].Response_Option.display_value == 'Not Okay' || newRecordArr[i].Response_Option1 === "Not Okay") ? 'selected' : ''}>Not Okay</option>`:"";
                           select_tag += task_choices.includes("Electrical") ? `<option value='Electrical' ${(newRecordArr[i].Response_Option.display_value == 'Electrical' || newRecordArr[i].Response_Option1 === "Electrical") ? 'selected' : ''}>Electrical</option>`:"";
                           select_tag += task_choices.includes("Damage") ? `<option value='Damage' ${(newRecordArr[i].Response_Option.display_value == 'Damage' || newRecordArr[i].Response_Option1 === "Damage") ? 'selected' : ''}>Damage</option>`:"";
                           select_tag += task_choices.includes("Safety") ? `<option value='Safety' ${(newRecordArr[i].Response_Option.display_value == 'Safety' || newRecordArr[i].Response_Option1 === "Safety") ? 'selected' : ''}>Safety</option>`:"";
                           select_tag += `</select></td>`;
                        const num_input = `<td id='resp-opt${i}'><input type='number' id='input-reponse${i}' value='${newRecordArr[i].Response_Amount}' class='form-control'></td>`;
                        const text_input = `<td id='resp-opt${i}'><input type='text' id='input-reponse${i}' value='${newRecordArr[i].Response_Text}' class='form-control'></td>`;
                        const response_options = newRecordArr[i].Field_Type.display_value;
                        const resp_type = (response_options == "Multiple Choice" || response_options == "Expense" || response_options == "Consumption") ? select_tag : (response_options == "Number" || response_options == "Meter Reading") ? num_input : (response_options == "Text") ? text_input : "";
                        tr_data = tr_data + resp_type;
                        tr_data += `<td><div class="image-field border border-secondary rounded d-flex justify-content-around align-items-center">
                            <div class="upload text-center cursor-pointer"><label for="img${i}" class="cursor-pointer"><i class="bi bi-image"></i></label><input type="file" id="img${i}" accept="image/*" class="d-none"></div>
                            <div class="capture h-100 text-center cursor-pointer">
                            <label data-bs-toggle="modal" data-bs-target="#capture${i}" class="cursor-pointer"><i class="bi bi-camera-fill cam-open"></i></label>
                            <div class="modal fade" id="capture${i}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                               <div class="modal-dialog">
                                 <div class="modal-content">
                                   <div class="modal-header">
                                     <h1 class="modal-title fs-5" id="exampleModalLabel">Camera</h1>
                                     <button type="button" class="btn-close cam-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                   </div>
                                   <div class="modal-body">
                                   <div class="capture-camera">
                               <video id="video${i}" class="vid" index="${i}" playsinline autoplay>Video stream not available.</video>
                             </div>
                                   </div>
                                   <div class="modal-footer">
                                   <canvas id="canvas${i}" class="d-none"></canvas>
                                   <input type="file" class="d-none" id="img-capture${i}">
                                     <button type="button" class="btn btn-secondary cam-close" data-bs-dismiss="modal">Close</button>
                                     <button type="button" class="btn btn-secondary switch">Switch Camera</button>
                                     <button type="button" id="startbutton${i}" data-bs-dismiss="modal" class="btn btn-primary capture">Capture</button>
                                   </div>
                                 </div>
                               </div>
                             </div>
                            </div>
                            <div class="capture h-100 text-center cursor-pointer"><label class="cursor-pointer h-100" id="clear-file${i}" style="font-size: 10px;"><i class="bi bi-x-square-fill"></i></label></div>
                        </div></td>`;
                        tr_data += `<td><input type='checkbox' id='flag${i}' ${newRecordArr[i].Flags_For_Review == 'true' ? 'checked' : ''} class='form-check-input'></td>`;
                        tr_data += `<td><input type='text' id='remark${i}' class='form-control'></td>`;
                        const fileUrl = newRecordArr[i].Image;
                        const img_url = fileUrl ? `https://creatorapp.zohopublic.in/publishapi/v2/smartjoules/smart-joules-app/report/All_Maintenance_Scheduler_Task_List_Records/${newRecordArr[i].ID}/Image/download?privatelink=q52rRrGjs3HzqO2GjTB28AvBeqgmKVMkma5HDOUxYwpq1Km45hJaRHn3q6Bukj4m0C1Zgq2gM1xg4wFKvrez60A7x2C7aMFxbO3V` : ``;
                        tr_data += `<td><img src='${img_url}' class='img-tag object-fit-contain rounded border' id='img_prev${i}'></td>`;
                        tr_data += `<td class='d-none'>${newRecordArr[i].ID}</td>`;
                        tr_data += `<td class='d-none'>${newRecordArr[i].Maintenance_ID}</td>`
                        tr.innerHTML = tr_data;
                        const tbody = document.querySelector("#t-body");
                        tbody.appendChild(tr);
                        const img_obj = document.querySelector(`#img${i}`);
                        const img_capture_obj = document.querySelector(`#img-capture${i}`);
                        const img_tag = document.getElementsByClassName("img-tag")[i];
                        if(newRecordArr[i].Audio)
                            {
                                document.querySelector(`#audio-${i}`).addEventListener("click",()=>{
                                    const audio = document.querySelector(`#audioPlayer${i}`);
                                    const audio_obj = document.querySelector(`#audio-${i}`);
                                    if (audio.paused) {
                                        audio.play();
                                        audio_obj.innerHTML = "<i class='bi bi-pause-fill'></i>";
                                      } else {
                                        audio.pause();
                                        audio_obj.innerHTML = "<i class='bi bi-play-fill'></i>";
                                        
                                      }
                                })
                            }

                        document.querySelector(`#clear-file${i}`).addEventListener("click", function () {
                            img_obj.value = '';
                            img_tag.src = '';
                        })

                        img_obj.addEventListener("change", function () {
                            const file = img_obj.files[0];
                            if (file) {
                                const image_url = URL.createObjectURL(file);
                                img_tag.src = image_url;
                                img_capture_obj.value = '';
                                img_capture_obj.src = '';

                            }
                        })

                        img_capture_obj.addEventListener("change", function () {
                            const file = img_capture_obj.files[0];
                            if (file) {
                                const image_url = URL.createObjectURL(file);
                                img_tag.src = image_url;
                                img_obj.value = '';
                                img_obj.src = '';
                            }
                        })
                    }

                }
            }

            const distictAreaList = [...new Set(area_list)];
            // distictAreaList.forEach(y => {
            //     const drop_li = document.createElement("li");
            //     const drop_a = document.createElement("a");
            //     drop_a.className = "dropdown-item";
            //     drop_a.textContent = y;
            //     drop_li.addEventListener("click", function () {

            //         const tr = document.getElementsByTagName("tr");
            //         for (let z = 0; z < tr.length; z++) {
            //             const my_tr = tr[z];
            //             const area_tag = my_tr.getElementsByTagName("td")[2];
            //             if (area_tag) {
            //                 const area_btn = document.querySelector("#area-btn");
            //                 area_btn.textContent = area_tag.textContent;
            //                 const area_name = area_tag.textContent;
            //                 if (area_name != y) {
            //                     my_tr.style.display = "none";
            //                 }
            //                 else {
            //                     my_tr.style.display = "";
            //                 }
            //             }
            //         }
            //     })
            //     drop_li.appendChild(drop_a);
            //     const drop_down = document.querySelector(".dropdown-menu");
            //     drop_down.appendChild(drop_li);
            // })
        }
        // document.querySelector("#clear-area").addEventListener("click", function () {
        //     const tr = document.getElementsByTagName("tr");
        //     for (const i of tr) {
        //         i.style.display = "";
        //         const area_btn = document.querySelector("#area-btn");
        //         area_btn.textContent = "Area";
        //     }
        // })

        // document.querySelector("#date-filter").addEventListener("click",function(){
        //     const start = document.querySelector("#start-date");
        //     const end = document.querySelector("#end-date");
        //     if(start && end){
        //         if(start.value && end.value){
        //             const start_date_obj = new Date(start.value);
        //             const end_date_obj = new Date(end.value);
        //             if(end_date_obj >= start_date_obj){
        //                 const end_date = end_date_obj.getDate()+"-"+monthString(end_date_obj.getMonth())+"-"+end_date_obj.getFullYear()  + " 00:00:00";
        //                 const start_date = start_date_obj.getDate()+"-"+ monthString(start_date_obj.getMonth())+"-"+start_date_obj.getFullYear() + " 00:00:00";
        //                 const table_rows = document.querySelector("#t-body");
        //                 table_rows.innerHTML = "";
        //                 createTable(start_date,end_date);
        //             }
        //         }
        //     }
        // })


        const queryFilter = () => {
            const query_date = queryParams.date;
            const query_start_date = queryParams.start_date;
            const query_end_date = queryParams.end_date;
            const filter = queryParams.filter;
            const site = queryParams.site;
            const area = queryParams.area;
            if (query_date) {
                const start_date = query_date;
                const current_date = query_date;
                createTable(start_date, current_date);
            }
            else if (filter == "true") {
                createTable((query_start_date != "null" && query_end_date != "null") ? query_start_date : "", (query_start_date != "null" && query_end_date != "null") ? query_end_date : "", (site != "null") ? site : "", (area != "null") ? area : "");
            }


        }
        queryFilter();
        // document.querySelector("#clear-date-filter").addEventListener("click",function(){
        //     document.querySelector("#t-body").innerHTML = "";
        //     document.querySelector("#start-date").value = "";
        //     document.querySelector("#end-date").value = "";
        //     defaultFilter();
        // })
        const canva = () => {
            var canvas = document.querySelector("#signature-pad");
            var ctx = canvas.getContext('2d');

            var drawing = false;
            var lastX = 0;
            var lastY = 0;

            canvas.addEventListener('mousedown', function (e) {
                drawing = true;
                lastX = e.offsetX;
                lastY = e.offsetY;
            });

            canvas.addEventListener('mousemove', function (e) {
                if (drawing === true) {
                    drawLine(lastX, lastY, e.offsetX, e.offsetY);
                    lastX = e.offsetX;
                    lastY = e.offsetY;
                }
            });

            canvas.addEventListener('mouseup', function (e) {
                drawing = false;
            });

            function drawLine(x1, y1, x2, y2) {
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.closePath();
            }
            const small_obj = document.getElementsByTagName("small")[0];
            if (small_obj) {
                small_obj.addEventListener("click", function () {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                })
            }
        }
        canva();

        const add_records = async () => {
            const tr = document.getElementsByClassName("table-row");
            promises = [];
            for (let i = 0; i < tr.length; i++) {
                const response = document.querySelector(`#resp-opt${i}`);
                const response_option = tr[i];
                const td = response_option.children;
                const resp_option = td[3].textContent;
                if (response) {
                    const resp = response.lastChild;
                    if (resp.value && resp.value != "null" && resp.value != undefined && resp.value != null && resp.value != "") {
                        const task_id = td[9];
                        const flag_obj = document.querySelector("#flag" + i);
                        if (flag_obj) {
                            var flag_resp = flag_obj.checked ? true : false;
                        }
                        const remark_output = document.querySelector("#resp-remark" + i);
                        const multipleResp = (resp) => {
                            return (resp == "Yes") ? "175578000000850048" : (resp == "No") ? "175578000000850052" : (resp == "Done") ? "175578000000569059" : (resp == "Not Done") ? "175578000000569063" :
                             (resp == "Okay") ? "175578000000569051": (resp == "Not Okay") ? "175578000000569055" :(resp == "Electrical") ? "175578000000390011" : (resp == "Damage") ? "175578000000390007":
                             (resp == "Safety") ? "175578000000390033":"";
                        }
                        formData = {
                            "data": {
                                "Remarks": remark_output ? remark_output.value : null,
                                "Status": "Completed",
                                "Response_Option": (resp_option == "Multiple Choice") ? multipleResp(resp.value) : null,
                                "Response_Option1": (resp_option == "Expense" || resp_option == "Consumption") ? resp.value : "",
                                "Response_Amount": (resp_option == "Number" || resp_option == "Meter Reading") ? resp.value : null,
                                "Response_Text": (resp_option == "Text") ? resp.value : null,
                                "Response_Value": resp.value ? resp.value : "",
                                "Flags_For_Review": flag_resp ? flag_resp : false,
                            }
                        }
                        config = {
                            appName: "smart-joules-app",
                            reportName: "All_Maintenance_Scheduler_Task_List_Records",
                            id: task_id.textContent,
                            data: formData,
                        }
                        promises.push(ZOHO.CREATOR.API.updateRecord(config));
                    }
                }
            }
            return Promise.all(promises)
        };

        const addImage = async () => {
            const promises = [];
            const trCollection = document.getElementsByClassName("table-row");
            const trArray = Array.from(trCollection)
            trArray.forEach((row, i) => {
                const response_option = row;
                const td = response_option.children;
                const response = document.querySelector(`#resp-opt${i}`);
                if (response) {
                    const resp = response.lastChild;
                    if (resp.value && resp.value != "null" && resp.value != undefined && resp.value != null) {
                        const ret_img = document.querySelector(`#img${i}`);
                        const ret_capture_img = document.querySelector(`#img-capture${i}`);
                        console.log(ret_capture_img);
                        if (ret_img || ret_capture_img) {
                            const task_id = td[9].textContent;
                            const resp_img_value = ret_img.files[0] ? ret_img.files[0] : ret_capture_img.files[0] ? ret_capture_img.files[0] : "";
                            if (resp_img_value) {
                                const resp_img = resp_img_value;
                                if (resp_img instanceof Blob) {
                                    var config = {
                                        appName: "smart-joules-app",
                                        reportName: "All_Maintenance_Scheduler_Task_List_Records",
                                        id: task_id,
                                        fieldName: "Image",
                                        file: resp_img
                                    };

                                    promises.push(ZOHO.CREATOR.API.uploadFile(config));

                                }
                            }
                            else {
                                return "Invalid Image Format";
                            }
                        }
                        else {
                            promises.push()
                        }
                    }

                }
            })
            return Promise.all(promises)
        };

        let currentCamera = "environment";
        let stream;
        let metadataLoaded = false;

        document.addEventListener("click", (event) => {
            const target_class_list = Array.from(event.target.classList);
            const target_obj = event.target.parentElement;
            if (target_class_list.includes("cam-open")) {
                const video_id = event.target.parentElement.getAttribute("data-bs-target");
                const video_obj = document.querySelector(video_id);
                const video = video_obj.querySelector("video");
                const canvas = video_obj.querySelector("canvas");

                navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: currentCamera
                    }
                })
                    .then((cameraStream) => {
                        video.srcObject = cameraStream;
                        stream = cameraStream;
                        video.addEventListener("loadedmetadata", () => {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            metadataLoaded = true;
                        });
                    })
                    .catch((err) => {
                        console.error('Error accessing camera: ' + err);
                    });
                video.setAttribute('playsinline', '');
            } else if (target_class_list.includes("cam-close")) {
                stopCamera();
            } else if (target_class_list.includes("capture")) {

                const canvas = target_obj.querySelector("canvas");
                const video_element = target_obj.parentElement.querySelector("video");
                captureImage(video_element, canvas);
            }
            else if (target_class_list.includes("switch")) {
                const video_element = target_obj.parentElement.querySelector("video");
                switchCamera(video_element);
            }
        });

        const captureImage = (video, canvas) => {
            if (!metadataLoaded) {
                console.error('Video metadata is not yet loaded.');
                return;
            }
            const index_no = video.getAttribute("index");
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/png');
            const capturedImage = document.querySelector(`#img_prev${index_no}`);
            stopCamera();
            capturedImage.src = imageDataURL;
            const imageBlob = dataURItoBlob(imageDataURL);
            const imageFile = new File([imageBlob], 'captured_image.png', { type: 'image/png' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(imageFile);
            const image_field = document.querySelector(`#img-capture${index_no}`);
            image_field.files = dataTransfer.files;
        };



        const switchCamera = (video) => {
            currentCamera = (currentCamera === 'user') ? 'environment' : (currentCamera === "environment") ? 'user' : "";
            stopCamera();

            if (currentCamera == "user") {
                video.style.transform = "rotateY(180deg)";
            } else {
                video.style.transform = "rotateY(0deg)";
            }

            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: currentCamera
                }
            })
                .then(function (cameraStream) {
                    video.srcObject = cameraStream;
                    stream = cameraStream;
                    video.setAttribute('playsinline', '');
                })
                .catch(function (err) {
                    console.error('Error accessing camera: ' + err);
                });
        };

        function stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }


        const dataURItoBlob = (dataURI) => {
            const byteString = atob(dataURI.split(',')[1]);
            const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mimeString });
        };


        const submittedUser = async () => {
            const added_user = document.querySelector("#added-user");
            promises = [];
            if (added_user) {
                const table_row = document.getElementsByClassName("table-row");
                const main_arr = [];
                for (let k = 0; k < table_row.length; k++) {
                    main_arr.push(table_row[k].children[10].textContent);
                }
                const schedulerArr = [...new Set(main_arr)];
                const user_name = added_user.value;
                const months = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                const today = new Date();
                today.toLocaleDateString();
                const current_date = today.getDate() + "-" + months[today.getMonth()].substring(0, 3) + "-" + today.getFullYear();
                formData = {
                    "data": {
                        "Completed_by": user_name ? user_name : "",
                        "Completed_On": current_date
                    }
                }
                for (let i = 0; i < schedulerArr.length; i++) {
                    const config = {
                        appName: "smart-joules-app",
                        reportName: "Maintenance_Scheduler_Report",
                        id: schedulerArr[i],
                        data: formData,
                    }
                    promises.push(ZOHO.CREATOR.API.updateRecord(config));
                }


            }
            return Promise.all(promises);
        }



        const count = async () => {
            promises = [];
            const table_row = document.getElementsByClassName("table-row");
            const main_arr = [];
            for (let k = 0; k < table_row.length; k++) {
                main_arr.push(table_row[k].children[10].textContent);
            }
            const schedulerArr = [...new Set(main_arr)];
            for (let i = 0; i < schedulerArr.length; i++) {
                countConfig = {
                    appName: "smart-joules-app",
                    reportName: "All_Maintenance_Scheduler_Task_List_Records",
                    criteria: `Maintenance_Scheduler_ID == ${schedulerArr[i]}`
                }
                const tot_obj = await ZOHO.CREATOR.API.getRecordCount(countConfig);
                const rec_count = tot_obj.result;
                if (rec_count) {
                    const all_rec_count = rec_count.records_count;

                    completedConfig = {
                        appName: "smart-joules-app",
                        reportName: "All_Maintenance_Scheduler_Task_List_Records",
                        criteria: `Maintenance_Scheduler_ID == ${schedulerArr[i]} && Status == \"Completed\"`
                    }
                    const complete_obj = await ZOHO.CREATOR.API.getRecordCount(completedConfig);
                    const complete_rec = complete_obj.result;
                    if (complete_rec) {
                        const complete_count = complete_rec.records_count;
                        if (complete_count) {
                            formData3 = {
                                "data": {
                                    "Status": (complete_count == all_rec_count) ? "Completed" : "Pending",
                                    "Progress": complete_count ? complete_count + " / " + all_rec_count : "0" + " / " + all_rec_count,
                                }
                            }
                            var configStatus = {
                                appName: "smart-joules-app",
                                reportName: "Maintenance_Scheduler_Report",
                                id: schedulerArr[i],
                                data: formData3,
                            }
                            promises.push(ZOHO.CREATOR.API.updateRecord(configStatus));
                        }
                    }
                }
            }
            return Promise.all(promises);
        }

        const updateSignature = () => {
            promises = [];
            const table_row = document.getElementsByClassName("table-row");
            const main_arr = [];
            for (let k = 0; k < table_row.length; k++) {
                main_arr.push(table_row[k].children[10].textContent);
            }
            const schedulerArr = [...new Set(main_arr)];
            function dataURLtoBlob(dataURL) {
                const byteString = atob(dataURL.split(',')[1]);
                const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ab], { type: mimeString });
            }
            const canvas = document.getElementById('signature-pad');
            const dataURL = canvas.toDataURL();
            const img_url = dataURLtoBlob(dataURL);
            for (let i = 0; i < schedulerArr.length; i++) {
                var config = {
                    appName: "smart-joules-app",
                    reportName: "Maintenance_Scheduler_Report",
                    id: schedulerArr[i],
                    fieldName: "Signature",
                    file: img_url ? img_url : null,
                }
                promises.push(ZOHO.CREATOR.API.uploadFile(config));
            }
            return Promise.all(promises);
        }

        const loaderStart = () => {
            document.getElementsByClassName("wrapper")[0].style.display = "block";
            document.body.style = "hidden";
        }
        const LoaderEnd = () => {
            document.getElementsByClassName("wrapper")[0].style.display = "none";
            document.body.style = "hidden";
            window.alert("Record Completed Successfully");
        }

        document.querySelector("#submit-btn").addEventListener("click", async () => {
            try {
                await loaderStart();
                const add_record = await add_records();
                console.log("Records Added", add_record);
                const add_image = await addImage();
                console.log("Images Added", add_image);
                const added_user = await submittedUser();
                console.log(added_user);
                const count_records = await count();
                console.log(count_records);
                const addSign = await updateSignature();
                console.log(addSign);
                await LoaderEnd();
            } catch (err) {
                console.log(err);
            }
        })
        // ZC End
    });