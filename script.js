ZOHO.CREATOR.init().then(function (data) {
  //
  var queryParams = ZOHO.CREATOR.UTIL.getQueryParams();
  var maintenance_id = queryParams.maintenance_id;

  const createTable = async (start_date, end_date, site, area) => {
    let conditional_criteria = `Task_Name != "Measure Air Flow" && Task_Name != "Expense Inccurred" && Task_Name != "Inventory Consumption"`;
    if (queryParams.maintenance_id) {
      conditional_criteria += ` && Maintenance_ID == ${maintenance_id}`;
      conditional_criteria += start_date
        ? ` && Schedule_Date == '${start_date}'`
        : "";
    } else {
      conditional_criteria +=
        start_date && end_date
          ? ` && Schedule_Date >= '${start_date}' && Schedule_Date <= '${end_date}'`
          : "";
    }
    if (site) {
      conditional_criteria += ` && Site == ${site}`;
    }
    if (area) {
      conditional_criteria += ` && Area == "${area}"`;
    }
    const configuration = {
      appName: "smart-joules-app",
      reportName: "All_Maintenance_Scheduler_Task_List",
      criteria: conditional_criteria,
      page: 1,
      pageSize: 200,
    };
    const response = await ZOHO.CREATOR.API.getAllRecords(configuration);
    let recordArr = response.data;
    const maintenanceArr = recordArr.reduce((acc, curr) => {
      if (!acc.includes(curr.Maintenance_ID)) {
        acc.push(curr.Maintenance_ID);
      }
      return acc;
    }, []);
    recordArr.sort((a, b) => parseFloat(a["S_No"]) - parseFloat(b["S_No"]));
    const area_label = document.querySelector(`#area-name`);
    if (area) {
      area_label.textContent = area;
    } else {
      area_label.textContent = recordArr[0].Area;
    }
    const added_user = document.querySelector(`#added-user`);
    user_config = {
      appName: "smart-joules-app",
      reportName: "All_Maintenance_Scheduler_Report",
      criteria: `ID ==  ${recordArr[0].Maintenance_ID}`,
    };
    const user_resp = await ZOHO.CREATOR.API.getAllRecords(user_config);
    if (user_resp.code == 3000) {
      added_user.value = user_resp.data[0].Completed_by;
    }
    const area_list = [];
    let k = -1;
    for (let j = 0; j < maintenanceArr.length; j++) {
      mConfig = {
        appName: "smart-joules-app",
        reportName: "All_Maintenance_Scheduler_Report",
        id: maintenanceArr[j],
      };
      const m_obj = await ZOHO.CREATOR.API.getRecordById(mConfig);
      const m_tr = document.createElement("tr");
      m_tr.innerHTML = `<td colspan="11" class="bg-light text-start fw-bold">${m_obj.data.Title}</td>`;
      document.querySelector("#t-body").appendChild(m_tr);
      const newRecordArr = recordArr.filter(
        (rec) => rec.Maintenance_ID == maintenanceArr[j]
      );
      for (let i = 0; i < newRecordArr.length; i++) {
        k++;
        area_list.push(newRecordArr[i].Area);
        if (
          newRecordArr[i].Task_Name != "Measure Air Flow" &&
          newRecordArr[i].Task_Name != "Expense Inccurred" &&
          newRecordArr[i].Task_Name != "Inventory Consumption"
        ) {
          function escapeDoubleQuotes(str) {
            return str.replace(/"/g, '\\"');
          }
          const taskChoices = async (taskConfig) => {
            taskConfig = {
              appName: "smart-joules-app",
              reportName: "All_Tasks",
              criteria: `Task_Name == "${escapeDoubleQuotes(
                newRecordArr[i].Task_Name
              )}" && Maintanance_ID == ${newRecordArr[i].Maintenance_Master}`,
            };
            try {
              const task_resp = await ZOHO.CREATOR.API.getAllRecords(
                taskConfig
              );
              const choices = task_resp.data[0];
              return choices.Choices.map((choice) => choice.display_value);
            } catch (err) {
              // console.log(err);
              return [];
            }
          };
          const task_choices = await taskChoices();

          const s_no = i + 1;
          const tr = document.createElement("tr");
          tr.className = `table-row`;
          const audio_file = newRecordArr[i].Audio
            ? `https://creatorapp.zohopublic.in${newRecordArr[i].Audio}`.replace(
                "api",
                "publishapi"
              ) +
              `&privatelink=2W361xtEeUYvSCpz9OvhZNQQdfszJ5VzM9CDDdBA45uA6ZvZBjAugkemTskwKuqGYbyOUXRqAFwj0q1wSRnGmy3GYpgdPxXavS87`
            : "";
          const video_file = newRecordArr[i].Video
            ? `https://creatorapp.zohopublic.in${newRecordArr[i].Video}`.replace(
                "api",
                "publishapi"
              ) +
              `&privatelink=2W361xtEeUYvSCpz9OvhZNQQdfszJ5VzM9CDDdBA45uA6ZvZBjAugkemTskwKuqGYbyOUXRqAFwj0q1wSRnGmy3GYpgdPxXavS87`
            : "";
          let tr_data = `<td>${s_no}
                        <audio class="d-none" id="audioPlayer${k}" controls>
                            <source src="${audio_file}" type="audio/mpeg">
                          </audio>
                        </td>
                            <td class='text-nowrap'>${
                              newRecordArr[i].Schedule_Date
                            }</td>
                            <td class='text-start' style='min-width: 200px;'>${
                              newRecordArr[i].Task_Name
                            } ${
            newRecordArr[i].Audio
              ? `<span class="fs-6 cursor-pointer" id="audio-${k}"><i class='bi bi-play-fill'></i></span>`
              : ""
          }</td>`;

          tr_data += `<td class='d-none' id="response-type${k}">${newRecordArr[i].Field_Type.display_value}</td>`;
          let select_tag = `<td id='resp-opt${k}' style='min-width: 150px;'><select class='form-select' id='input-reponse${k}'>
                           <option value=null ${
                             newRecordArr[i].Response_Option.display_value ||
                             newRecordArr[i].Response_Option1
                               ? ""
                               : "selected"
                           }>Choose</option>`;
          select_tag +=
            task_choices.includes("Yes") ||
            newRecordArr[i].Task_Name == "Cleaning of Air Filters"
              ? `<option value='Yes' ${
                  newRecordArr[i].Response_Option.display_value === "Yes"
                    ? "selected"
                    : newRecordArr[i].Response_Option1 === "Yes"
                    ? "selected"
                    : ""
                }>Yes</option>`
              : "";
          select_tag +=
            task_choices.includes("No") ||
            newRecordArr[i].Task_Name == "Cleaning of Air Filters"
              ? `<option value='No' ${
                  newRecordArr[i].Response_Option.display_value === "No"
                    ? "selected"
                    : newRecordArr[i].Response_Option1 === "No"
                    ? "selected"
                    : ""
                }>No</option>`
              : "";
          const choice_config = {
            appName: "smart-joules-app",
            reportName: "All_Maintanance_Task_Db",
            criteria: `Single_Line != "Yes" && Single_Line != "No"`,
          };

          const getChoice = await ZOHO.CREATOR.API.getAllRecords(choice_config);
          let all_choice = getChoice.data;
          all_choice = [...new Set(all_choice)];
          for (let l = 0; l < all_choice.length; l++) {
            select_tag += task_choices.includes(all_choice[l].Single_Line)
              ? `<option value='${all_choice[l].Single_Line}' ${
                  newRecordArr[i].Response_Option.display_value ==
                    all_choice[l].Single_Line ||
                  newRecordArr[i].Response_Option1 === all_choice[l].Single_Line
                    ? "selected"
                    : ""
                }>${all_choice[l].Single_Line}</option>`
              : "";
          }
          select_tag += `</select></td>`;
          const num_input = `<td id='resp-opt${k}'><input type='number' id='input-reponse${k}' value='${newRecordArr[i].Response_Amount}' class='form-control'></td>`;
          const text_input = `<td id='resp-opt${k}'><input type='text' id='input-reponse${k}' value='${newRecordArr[i].Response_Text}' class='form-control'></td>`;
          const response_options = newRecordArr[i].Field_Type.display_value;
          const resp_type =
            response_options == "Multiple Choice" ||
            response_options == "Expense" ||
            response_options == "Consumption"
              ? select_tag
              : response_options == "Number" ||
                response_options == "Meter Reading"
              ? num_input
              : response_options == "Text"
              ? text_input
              : "";
          tr_data = tr_data + resp_type;
          tr_data += `<td><div class='d-flex align-items-top'><div class="image-field border border-secondary rounded d-flex justify-content-around align-items-center">
                            <div class="upload text-center cursor-pointer"><label for="img${k}" class="cursor-pointer"><i class="bi bi-image"></i></label><input type="file" id="img${k}" accept="image/*" class="d-none"></div>
                            <div class="capture h-100 text-center cursor-pointer">
                            <label data-bs-toggle="modal" data-bs-target="#capture${k}" class="cursor-pointer"><i class="bi bi-camera-fill cam-open"></i></label>
                            <div class="modal fade" id="capture${k}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                               <div class="modal-dialog">
                                 <div class="modal-content">
                                   <div class="modal-header">
                                     <h1 class="modal-title fs-5" id="exampleModalLabel">Camera</h1>
                                     <button type="button" class="btn-close cam-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                   </div>
                                   <div class="modal-body">
                                   <div class="capture-camera">
                               <video id="video${k}" class="vid" vidid="${
            newRecordArr[i].ID
          }" index="${k}" playsinline autoplay>Video stream not available.</video>
                             </div>
                                   </div>
                                   <div class="modal-footer">
                                   <canvas id="canvas${k}" class="d-none"></canvas>
                                   <input type="file" class="d-none" id="img-capture${k}">
                                     <button type="button" class="btn btn-secondary cam-close" data-bs-dismiss="modal">Close</button>
                                     <button type="button" class="btn btn-secondary switch">Switch Camera</button>
                                     <button type="button" id="startbutton${k}" data-bs-dismiss="modal" class="btn btn-primary capture">Capture</button>
                                   </div>
                                 </div>
                               </div>
                             </div>
                            </div>
                            <div class="capture h-100 cursor-pointer"><label class="cursor-pointer h-100 d-flex align-items-center" id="clear-file${k}" style="font-size: 10px;"><i class="bi bi-x-square-fill"></i></label></div>
                        </div>${
                          newRecordArr[i].Image_Mandatory == "false"
                            ? ``
                            : `<span class="text-danger fw-bold px-1">*</span>`
                        }</div>
                       </td>`;
          tr_data += `<td><input type='checkbox' id='flag${k}' ${
            newRecordArr[i].Flags_For_Review == "true" ? "checked" : ""
          } class='form-check-input'></td>`;
          tr_data += `<td><input type='text' value="${newRecordArr[i].Remarks}" id='remark${k}' class='form-control'></td>`;
          const img_url = newRecordArr[i].Image
            ? `https://creatorapp.zohopublic.in${newRecordArr[i].Image}`.replace(
                "api",
                "publishapi"
              ) +
              `&privatelink=2W361xtEeUYvSCpz9OvhZNQQdfszJ5VzM9CDDdBA45uA6ZvZBjAugkemTskwKuqGYbyOUXRqAFwj0q1wSRnGmy3GYpgdPxXavS87`
            : ``;
          tr_data += `<td><img src='${img_url}' class='img-tag object-fit-contain rounded border' id='img_prev${k}'></td>`;
          tr_data += `<td class='d-none'>${newRecordArr[i].ID}</td>`;
          tr_data += `<td class='d-none'>${newRecordArr[i].Maintenance_ID}</td>`;
          tr_data += `<td>${
            newRecordArr[i].Video
              ? `<i id="vid${k}-icon" class="bi fs-4 text-primary cursor-pointer bi-play-circle-fill" data-bs-toggle="modal" data-bs-target="#video-pop${k}"></i>
                        <div class="modal fade" id="video-pop${k}"  aria-hidden="true" data-bs-backdrop="static">
                          <div class="modal-dialog">
                            <div class="modal-content">
                            <div class="modal-header">
                               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                              <div class="modal-body">
                                <video class="vid" controls>
                                  <source src="${video_file}" type="video/mp4">
                                </video>
                              </div>
                            </div>
                          </div>
                        </div>`
              : `<div class="d-none"></div>`
          }
                        </td>`;
          tr_data += `<td class="d-none img-man">${newRecordArr[i].Image_Mandatory}</td>`;
          tr_data += `<td class="d-none flag-choices"></td>`;
          tr.innerHTML = tr_data;
          const tbody = document.querySelector("#t-body");
          tbody.appendChild(tr);
          const img_obj = document.querySelector(`#img${k}`);
          const img_capture_obj = document.querySelector(`#img-capture${k}`);
          const img_tag = document.querySelector(`#img_prev${k}`);
          if (newRecordArr[i].Audio) {
            document
              .querySelector(`#audio-${k}`)
              .addEventListener("click", () => {
                const audio = document.querySelector(`#audioPlayer${k}`);
                const audio_obj = document.querySelector(`#audio-${k}`);
                if (audio.paused) {
                  audio.play();
                  audio_obj.innerHTML = "<i class='bi bi-pause-fill'></i>";
                } else {
                  audio.pause();
                  audio_obj.innerHTML = "<i class='bi bi-play-fill'></i>";
                }
              });
          }

          document
            .querySelector(`#clear-file${k}`)
            .addEventListener("click", async () => {
              img_obj.value = "";
              img_tag.src = "";

              formData = {
                data: {
                  Image: "",
                },
              };

              const config = {
                appName: "smart-joules-app",
                reportName: "All_Maintenance_Scheduler_Task_List_Records",
                id: newRecordArr[i].ID,
                data: formData,
              };
              try {
                const resp = await ZOHO.CREATOR.API.updateRecord(config);
                console.log(resp);
              } catch (err) {
                console.log(err);
              }
            });

          img_obj.addEventListener("change", async () => {
            const file = img_obj.files[0];
            if (file) {
              const image_url = URL.createObjectURL(file);
              img_tag.src = image_url;
              img_capture_obj.value = "";
              img_capture_obj.src = "";
              try {
                const compressedFile = await compressImage(file, 3, 1024, 1024);
                console.log("Compressed File:", compressedFile);
                const config = {
                  appName: "smart-joules-app",
                  reportName: "All_Maintenance_Scheduler_Task_List_Records",
                  id: newRecordArr[i].ID,
                  fieldName: "Image",
                  file: compressedFile,
                };
                try {
                  const resp = await ZOHO.CREATOR.API.uploadFile(config);
                  console.log(resp);
                } catch (err) {
                  console.log(err);
                }
              } catch (error) {
                console.error("Error compressing the file:", error);
              }
            }
          });

          img_capture_obj.addEventListener("change", function () {
            const file = img_capture_obj.files[0];
            if (file) {
              const image_url = URL.createObjectURL(file);
              img_tag.src = image_url;
              img_obj.value = "";
              img_obj.src = "";
            }
          });

          document
            .querySelector(`#remark${k}`)
            .addEventListener("change", async (e) => {
              formData = {
                data: {
                  Remarks: e.target.value ? e.target.value : "",
                },
              };

              const config = {
                appName: "smart-joules-app",
                reportName: "All_Maintenance_Scheduler_Task_List_Records",
                id: newRecordArr[i].ID,
                data: formData,
              };
              try {
                const response = await ZOHO.CREATOR.API.updateRecord(config);
                console.log(response);
              } catch (err) {
                console.log(err);
              }
            });
          document
            .querySelector(`#flag${k}`)
            .addEventListener("change", async (e) => {
              formData = {
                data: {
                  Flags_For_Review: e.target.checked,
                },
              };
              const config = {
                appName: "smart-joules-app",
                reportName: "All_Maintenance_Scheduler_Task_List_Records",
                id: newRecordArr[i].ID,
                data: formData,
              };
              try {
                const resp = await ZOHO.CREATOR.API.updateRecord(config);
                console.log(resp);
              } catch (err) {
                console.log(err);
              }
            });

          if (
            response_options == "Multiple Choice" ||
            response_options == "Consumption" ||
            response_options == "Expense"
          ) {
            document
              .querySelector(`#resp-opt${k}`)
              .addEventListener("change", async (e) => {
                const response = e.target.value;
                if (response) {
                  const choiceConfig = {
                    appName: "smart-joules-app",
                    reportName: "All_Maintanance_Task_Db",
                    criteria: `Single_Line == "${response}"`,
                  };

                  const choicePromise = await ZOHO.CREATOR.API.getAllRecords(
                    choiceConfig
                  );
                  const choiceId = choicePromise.data[0].ID;
                  formData = {
                    data: {
                      Response_Option: response === "null" ? null : choiceId,
                      Response_Value: response === "null" ? "" : e.target.value,
                    },
                  };
                  const config = {
                    appName: "smart-joules-app",
                    reportName: "All_Maintenance_Scheduler_Task_List_Records",
                    id: newRecordArr[i].ID,
                    data: formData,
                  };
                  try {
                    const resp = await ZOHO.CREATOR.API.updateRecord(config);
                    console.log(resp);
                  } catch (err) {
                    console.log(err);
                  }
                }
              });
          } else if (
            response_options == "Number" ||
            response_options == "Meter Reading"
          ) {
            document
              .querySelector(`#resp-opt${k}`)
              .addEventListener("change", async (e) => {
                const response = e.target.value;
                if (response) {
                  formData = {
                    data: {
                      Response_Amount:
                        response === "null" ? null : e.target.value,
                      Response_Value: response === "null" ? "" : e.target.value,
                    },
                  };
                  const config = {
                    appName: "smart-joules-app",
                    reportName: "All_Maintenance_Scheduler_Task_List_Records",
                    id: newRecordArr[i].ID,
                    data: formData,
                  };
                  try {
                    const resp = await ZOHO.CREATOR.API.updateRecord(config);
                    console.log(resp);
                  } catch (err) {
                    console.log(err);
                  }
                }
              });
          } else if (response_options === "Text") {
            document
              .querySelector(`#resp-opt${k}`)
              .addEventListener("change", async (e) => {
                const response = e.target.value;
                if (response) {
                  formData = {
                    data: {
                      Response_Text: response === "null" ? "" : e.target.value,
                      Response_Value: response === "null" ? "" : e.target.value,
                    },
                  };
                  const config = {
                    appName: "smart-joules-app",
                    reportName: "All_Maintenance_Scheduler_Task_List_Records",
                    id: newRecordArr[i].ID,
                    data: formData,
                  };
                  try {
                    const resp = await ZOHO.CREATOR.API.updateRecord(config);
                    console.log(resp);
                  } catch (err) {
                    console.log(err);
                  }
                }
              });
          }
        }
      }
    }
  };

  const compressImage = (file, maxSizeMB, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.9;
          let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          while (
            compressedDataUrl.length > maxSizeMB * 1024 * 1024 &&
            quality > 0.1
          ) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          fetch(compressedDataUrl)
            .then((res) => res.blob())
            .then((blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            })
            .catch((err) => reject(err));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

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
    } else if (filter == "true") {
      createTable(
        query_start_date != "null" && query_end_date != "null"
          ? query_start_date
          : "",
        query_start_date != "null" && query_end_date != "null"
          ? query_end_date
          : "",
        site != "null" ? site : "",
        area != "null" ? area : ""
      );
    }
  };

  queryFilter();

  const canva = () => {
    var canvas = document.querySelector("#signature-pad");
    var ctx = canvas.getContext("2d");

    var drawing = false;
    var lastX = 0;
    var lastY = 0;

    canvas.addEventListener("mousedown", function (e) {
      drawing = true;
      lastX = e.offsetX;
      lastY = e.offsetY;
    });

    canvas.addEventListener("mousemove", function (e) {
      if (drawing === true) {
        drawLine(lastX, lastY, e.offsetX, e.offsetY);
        lastX = e.offsetX;
        lastY = e.offsetY;
      }
    });

    canvas.addEventListener("mouseup", function (e) {
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
      });
    }
  };
  canva();

  const getFlagChoices = async (id) => {
    const config = {
      appName: "smart-joules-app",
      reportName: "All_Maintenance_Scheduler_Task_List_Records",
      criteria: "ID == " + id,
    };
    try {
      const response = await ZOHO.CREATOR.API.getAllRecords(config);
      const data = response.data[0];
      if (data.Flag_Choices) {
        return data.Flag_Choices.map((choice) => choice.display_value);
      } else {
        return [];
      }
    } catch (err) {
      console.error("Error fetching flag choices:", err, id);
      return [];
    }
  };

  const addRecord = async () => {
    const tr = document.querySelectorAll(".table-row");
    const promises = [];
    for (let i = 0; i < tr.length; i++) {
      const row = tr[i];
      const responseElement = document.querySelector(`#resp-opt${i}`).lastChild;
      if (!responseElement || !responseElement.value) continue;
      const response = responseElement.value;
      const flagChoices = await getFlagChoices(row.children[9].textContent);
      const flagResp = document.querySelector(`#flag${i}`).checked
        ? "true"
        : flagChoices.includes(response)
        ? "true"
        : "false";
      console.log(flagResp);
      const respOption = document.querySelector(
        `#response-type${i}`
      ).textContent;
      const remarkOutput = document.querySelector(`#remark${i}`).value || "";
      let choiceId = "";

      if (respOption === "Multiple Choice") {
        const choiceConfig = {
          appName: "smart-joules-app",
          reportName: "All_Maintanance_Task_Db",
          criteria: `Single_Line == "${response}"`,
        };

        const choicePromise = ZOHO.CREATOR.API.getAllRecords(choiceConfig)
          .then((choiceResp) => {
            if (choiceResp.data && choiceResp.data[0]) {
              choiceId = choiceResp.data[0].ID;
            }

            const formData = {
              data: {
                Remarks: remarkOutput,
                Status: "Completed",
                Response_Option: choiceId,
                Response_Option1: ["Expense", "Consumption"].includes(
                  respOption
                )
                  ? response
                  : "",
                Response_Amount: ["Number", "Meter Reading"].includes(
                  respOption
                )
                  ? response
                  : "",
                Response_Text: respOption === "Text" ? response : "",
                Response_Value: response,
                Flags_For_Review: flagResp,
              },
            };

            const config = {
              appName: "smart-joules-app",
              reportName: "All_Maintenance_Scheduler_Task_List_Records",
              id: row.children[9].textContent,
              data: formData,
            };

            return ZOHO.CREATOR.API.updateRecord(config);
          })
          .then((result) => result)
          .catch((err) => {
            console.error("Error processing multiple choice response:", err);
            return null;
          });

        promises.push(choicePromise);
      } else {
        const formData = {
          data: {
            Remarks: remarkOutput,
            Status: "Completed",
            Response_Option: "",
            Response_Option1: ["Expense", "Consumption"].includes(respOption)
              ? response
              : "",
            Response_Amount: ["Number", "Meter Reading"].includes(respOption)
              ? response
              : "",
            Response_Text: respOption === "Text" ? response : "",
            Response_Value: response,
            Flags_For_Review: flagResp,
          },
        };

        const config = {
          appName: "smart-joules-app",
          reportName: "All_Maintenance_Scheduler_Task_List_Records",
          id: row.children[9].textContent,
          data: formData,
        };

        const updatePromise = ZOHO.CREATOR.API.updateRecord(config)
          .then((result) => result)
          .catch((err) => {
            console.error("Error updating record:", err);
            return null;
          });

        promises.push(updatePromise);
      }
    }

    return Promise.all(promises);
  };

  const addImage = async () => {
    const trCollection = document.getElementsByClassName("table-row");
    const promises = [];

    for (let i = 0; i < trCollection.length; i++) {
      const row = trCollection[i];
      const responseElement = document.querySelector(`#resp-opt${i}`);
      if (!responseElement) continue;

      const response = responseElement.lastChild;
      if (
        !response.value ||
        response.value === "null" ||
        response.value === undefined ||
        response.value === null
      )
        continue;

      const retImg = document.querySelector(`#img${i}`);
      const retCaptureImg = document.querySelector(`#img-capture${i}`);
      if (!retImg && !retCaptureImg) continue;

      const taskId = row.children[9].textContent;
      const respImgValue = retImg?.files[0] || retCaptureImg?.files[0] || "";

      const config = {
        appName: "smart-joules-app",
        reportName: "All_Maintenance_Scheduler_Task_List_Records",
        id: taskId,
        fieldName: "Image",
        file: respImgValue,
      };

      const uploadPromise = ZOHO.CREATOR.API.uploadFile(config)
        .then((result) => result)
        .catch((err) => {
          console.error("Error uploading file:", err);
          return null;
        });

      promises.push(uploadPromise);
    }
    return Promise.all(promises);
  };

  let currentCamera = "environment";
  let stream;
  let metadataLoaded = false;

  document.addEventListener("click", (event) => {
    const target_class_list = Array.from(event.target.classList);
    const target_obj = event.target.parentElement;
    if (target_class_list.includes("cam-open")) {
      const video_id =
        event.target.parentElement.getAttribute("data-bs-target");
      const video_obj = document.querySelector(video_id);
      const video = video_obj.querySelector("video");
      const canvas = video_obj.querySelector("canvas");

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: currentCamera,
          },
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
          console.error("Error accessing camera: " + err);
        });
      video.setAttribute("playsinline", "");
    } else if (target_class_list.includes("cam-close")) {
      stopCamera();
    } else if (target_class_list.includes("capture")) {
      const canvas = target_obj.querySelector("canvas");
      const video_element = target_obj.parentElement.querySelector("video");
      captureImage(video_element, canvas);
    } else if (target_class_list.includes("switch")) {
      const video_element = target_obj.parentElement.querySelector("video");
      switchCamera(video_element);
    }
  });

  const captureImage = async (video, canvas) => {
    if (!metadataLoaded) {
      console.error("Video metadata is not yet loaded.");
      return;
    }
    const index_no = video.getAttribute("index");
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL("image/png");
    const capturedImage = document.querySelector(`#img_prev${index_no}`);
    stopCamera();
    capturedImage.src = imageDataURL;
    const imageBlob = dataURItoBlob(imageDataURL);
    const imageFile = new File([imageBlob], "captured_image.png", {
      type: "image/png",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(imageFile);
    const image_field = document.querySelector(`#img-capture${index_no}`);
    image_field.files = dataTransfer.files;
    const recID = video.getAttribute("vidid");
    const options = {
      maxSizeMB: 4,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(
        image_field.files[0],
        3,
        1024,
        1024
      );
      console.log("Compressed File:", compressedFile);
      const config = {
        appName: "smart-joules-app",
        reportName: "All_Maintenance_Scheduler_Task_List_Records",
        id: recID,
        fieldName: "Image",
        file: compressedFile,
      };
      try {
        const resp = await ZOHO.CREATOR.API.uploadFile(config);
        console.log(resp);
      } catch (err) {
        console.log(err);
      }
    } catch (error) {
      console.error("Error compressing the file:", error);
    }
  };

  const switchCamera = (video) => {
    currentCamera =
      currentCamera === "user"
        ? "environment"
        : currentCamera === "environment"
        ? "user"
        : "";
    stopCamera();

    if (currentCamera == "user") {
      video.style.transform = "rotateY(180deg)";
    } else {
      video.style.transform = "rotateY(0deg)";
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: currentCamera,
        },
      })
      .then(function (cameraStream) {
        video.srcObject = cameraStream;
        stream = cameraStream;
        video.setAttribute("playsinline", "");
      })
      .catch(function (err) {
        console.error("Error accessing camera: " + err);
      });
  };

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const submittedUser = async () => {
    const addedUserElement = document.querySelector("#added-user");
    if (!addedUserElement) return;

    const tableRows = Array.from(document.getElementsByClassName("table-row"));
    const schedulerIds = Array.from(
      new Set(tableRows.map((row) => row.children[10].textContent))
    );

    const user_name = addedUserElement.value;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const today = new Date();
    const current_date = `${today.getDate()}-${months[
      today.getMonth()
    ].substring(0, 3)}-${today.getFullYear()}`;

    const formData = {
      data: {
        Completed_by: user_name || "",
        Completed_On: current_date,
      },
    };

    const promises = schedulerIds.map(async (id) => {
      const config = {
        appName: "smart-joules-app",
        reportName: "New_Maintenance_Scheduler_Report",
        id: id,
        data: formData,
      };

      const resp = await ZOHO.CREATOR.API.updateRecord(config);
      return resp;
    });
    return promises;
  };

  const updateSignature = async () => {
    promises = [];
    const table_row = document.getElementsByClassName("table-row");
    const main_arr = [];
    for (let k = 0; k < table_row.length; k++) {
      main_arr.push(table_row[k].children[10].textContent);
    }
    const schedulerArr = [...new Set(main_arr)];
    function dataURLtoBlob(dataURL) {
      const byteString = atob(dataURL.split(",")[1]);
      const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    }
    const canvas = document.getElementById("signature-pad");
    const dataURL = canvas.toDataURL();
    const img_url = dataURLtoBlob(dataURL);
    for (let i = 0; i < schedulerArr.length; i++) {
      var config = {
        appName: "smart-joules-app",
        reportName: "New_Maintenance_Scheduler_Report",
        id: schedulerArr[i],
        fieldName: "Signature",
        file: img_url ? img_url : null,
      };
      promises.push(await ZOHO.CREATOR.API.uploadFile(config));
    }
    return promises;
  };

  const loaderStart = () => {
    const wrapper = document.getElementsByClassName("wrapper")[0];
    if (wrapper) wrapper.style.display = "block";
    document.body.style.overflow = "hidden";
  };

  const loaderEnd = (msg) => {
    const wrapper = document.getElementsByClassName("wrapper")[0];
    if (wrapper) wrapper.style.display = "none";
    document.body.style.overflow = "auto";

    const modalAlert = document.querySelector("#img-mand-alert");
    if (modalAlert) {
      modalAlert.querySelector(".modal-title").textContent = "";
      modalAlert.querySelector(
        ".modal-body"
      ).innerHTML = `<span class="fw-bold">${msg}</span>`;
      $("#img-mand-alert").modal("show");
    }
  };

  // Function to check mandatory image uploads
  const checkMandatory = () => {
    const trArr = document.querySelector("tr");
    let j = -1;
    let x = 0;
    let task_list;
    Array.from(trArr).forEach((row, i) => {
      j++;
      const imgMandat = row.querySelector(".img-man").textContent;
      const checkImg2 = document.getElementById(`img_prev${j}`);

      if (imgMandat === "true" || imgMandat === true) {
        if (checkImg2.src.includes("creatorapp.zoho.in")) {
          const taskName = row.querySelector("td:nth-child(3)").textContent;
          task_list.push(taskName);
          x++;
        }
      }
    });

    if (x > 0) {
      const modalAlert = document.querySelector("#img-mand-alert");
      if (modalAlert) {
        modalAlert.querySelector(
          ".modal-body"
        ).innerHTML = `<span>${task_list.join(
          ", "
        )}</span><br><span>The above tasks are mandatory to upload images</span>`;
        $("#img-mand-alert").modal("show"); // Assuming jQuery is being used
      }
      return true;
    } else {
      return false;
    }
  };

  // Event listener for the submit button
  document.querySelector("#submit-btn").addEventListener("click", async () => {
    const imgMandate = checkMandatory();
    if (!imgMandate) {
      loaderStart();
      try {
        const addRecords = await addRecord();
        console.log("Records Added:", addRecords);

        const addedUser = await submittedUser();
        console.log("User Submitted:", addedUser);

        const addSign = await updateSignature();
        console.log("Signature Added:", addSign);
      } catch (err) {
        loaderEnd(err);
      } finally {
        loaderEnd("Records Successfully Added!");
      }
    }
  });
  document.querySelector("#go-next").addEventListener("click", () => {
    const user_id = ZOHO.CREATOR.UTIL.getInitParams().loginUser;
    window.parent.location.href = user_id.includes(".in")
      ? "https://creatorapp.zoho.in/smartjoules/smart-joules-app/#Form:Maintenance_Task_Filter"
      : "https://smartjoules.zohocreatorportal.in/#Form:Maintenance_Task_Filter";
  });
  // ZC End
});
