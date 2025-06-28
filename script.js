let data = JSON.parse(localStorage.getItem("studentData")) || [];
$(document).ready(function () {
  if (data.length === 0) {
    $.getJSON("StudentRecord.json", function (fetchedData) {
      data = fetchedData;
      localStorage.setItem("studentData", JSON.stringify(data));
      ShowDataInTable();
    });
  } else {
    ShowDataInTable();
  }
  $.getJSON("hobbies.json", function (hobbies) {
    let text = ``;  
    console.log(hobbies);
    for (let i = 0; i < hobbies.length; i++) {
      text += `<option class="dropdown-item w-100" value="${hobbies[i]}">${hobbies[i]}</option>`;
    }
    $(".hobbies-select").html(text);
  });
  $(".hobbies-select").select2({
    placeholder: "Select Your Hobbies",
    allowClear: true,
    dropdownParent: $("#StudentModal"),
  });

      CKEDITOR.replace('description');

});

$(document).on("click", "#togglePassword", function () {
  const passwordInput = $("#password");
  const icon = $("#togglePasswordIcon");
  const type = passwordInput.attr("type") === "password" ? "text" : "password";
  passwordInput.attr("type", type);
  icon.toggleClass("fa-eye fa-eye-slash");
});

$(".addStudentBtn").click(function () {
  $("#StudentModalLabel").show();
  $("#EditStudentModalLabel").hide();
  $("#submitBtn").val("Submit");
  $("#StudentForm")[0].reset();
  $("label.error,span.error").hide();
  $(".hobbies-select").val(null).trigger("change");
  if (CKEDITOR.instances.description) {
    CKEDITOR.instances.description.setData('');
  }
});
$(".btn-close").click(function () {
  $("#StudentForm")[0].reset();
  $("label.error,span.error").hide();
  $(".hobbies-select").val(null).trigger("change");
  $("#dob").css("color","black");
  if (CKEDITOR.instances.description) {
    CKEDITOR.instances.description.setData('');
  }
});

function ShowDataInTable() {
  data = JSON.parse(localStorage.getItem("studentData")) || [];

  const filteredData = data.filter((student) => !student.isDeleted);
  data = filteredData;
 
  if ($.fn.DataTable.isDataTable("#StudentTable")) {
    $("#StudentTable").DataTable().destroy();
  }

  $("#StudentTable").DataTable({
     "pageLength": 7,
     "lengthMenu":[7,10,20,50,100],
    data: data,
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "email" },
      { data: "password" },
      { data: "dob" },
      { data: "description" },
      { data: "sex" },
      { data: "hobbies" },
      { data: "subjects" },
      {
        data: null,
        render: function (_data, _type, row) {
          return `
            <div class="d-flex justify-content-center">
              <button type="button" class="btn btn-warning me-2" onclick="EditionOfStudentRecord(${row.id})" data-bs-toggle="modal" data-bs-target="#StudentModal">
                <i class="fas fa-edit"></i>
              </button>
              <button type="button" class="btn btn-danger" onclick="DeletionOfStudentRecord(${row.id})">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
  
          `;
        },
      },
    ],
  });
}

$.validator.addMethod(
  "validName",
  function (value) {
    return /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(value);
  },
  "Name must contain only letters and spaces."
);

$("#StudentForm").validate({
  ignore:[],
  rules: {
    name: {
      required: true,
      validName: true,
      minlength: 2,
    },
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true,
      minlength: 6,
    },
    dob: {
      required: true,
      date: true,
    },
    description:{
      required:true
    },

    "hobbies[]": {
      required: true,
    },
    subjects: {
      required: true,
      minlength: 1,
    },
    sex: {
      required: true,
    },
  },
  messages: {
    name: {
      required: "Please enter your name",
      minlength: "Name must be at least 2 characters",
    },
    email: {
      required: "Please enter your email",
      email: "Please enter a valid email address",
    },
    password: {
      required: "Please enter your password",
      minlength: "Password must be at least 6 characters",
    },
    dob: {
      required: "Please enter your date of birth",
      date: "Please enter a valid date",
    },
    description:{
      required:"Description is required !"
    },

    "hobbies[]": {
      required: "Please select at least one hobby",
    },
    subjects: {
      required: "Please select at least one subject",
    },
    sex: {
      required: "Please select your sex",
    },
  },


  submitHandler: function (_form) {

    if ($("#submitBtn").val() === "Save") {
      UpdateStudent();
    } else {
      StoreDataInTable();
    }
  },
    errorPlacement: function(error, element) {
     if (element.attr("type") === "radio" || element.attr("type") === "checkbox") {
      error.appendTo(element.closest(".mb-3"));  
    }

    else if (element.attr("name") === "password") {
      error.insertAfter(element.closest(".input-group"));
    }
    else if(element.attr("name") === "hobbies[]"){
      error.insertAfter(element.closest(".mb-3"));
    }
    else if(element.attr("name")=== "description"){
      error.insertAfter(element.closest(".mb-3"));
    }
    else {
      error.insertAfter(element);
    }
   },
});

function StoreDataInTable() {
  let name = $("#name").val();
  let email = $("#email").val();
  let password = $("#password").val();
  let dob = $("#dob").val();
  let description = CKEDITOR.instances.description ? CKEDITOR.instances.description.getData() : $("#description").val();
  let hobbies = $(".hobbies-select").val();
  let hobbiesCommaSeparated = "";
  if (hobbies && hobbies.length > 0) {
    for (let i = 0; i < hobbies.length; i++) {
      hobbiesCommaSeparated += `${hobbies[i]},`;
    }
    hobbiesCommaSeparated = hobbiesCommaSeparated.slice(0, -1);
  }
  let subjects = [];
  let subjectsLength = $("input[name='subjects']:checked").length;
  for (let i = 0; i < subjectsLength; i++) {
    subjects.push($("input[name='subjects']:checked")[i].value);
  }
  subjects = subjects.join(", ");

  let sex = $("input[name='sex']:checked").val();

  let AddStudentDataObject = {
    id: data.length + 1,
    name: name,
    email: email,
    password: password,
    dob: dob,
    description: description,
    sex: sex,
    hobbies: hobbiesCommaSeparated,
    subjects: subjects,
    isDeleted: false,
  };

  data.push(AddStudentDataObject);
  localStorage.setItem("studentData", JSON.stringify(data));
  $("#StudentForm")[0].reset();
  if (CKEDITOR.instances.description) {
    CKEDITOR.instances.description.setData('');
  }
  $("#StudentModal").modal("hide");
  ShowDataInTable();
}

function EditionOfStudentRecord(id) {
  $("input.error").css("color", "black");
  $("label.error,span.error").hide();
  $("#StudentModalLabel").hide();
  $("#EditStudentModalLabel").show();
  $("#submitBtn").val("Save");

  let student = data.find((x) => x.id === id);

  if (student) {
    $("#id").val(student.id);
    $("#name").val(student.name);
    $("#email").val(student.email);
    $("#password").val(student.password);
    $("#dob").val(student.dob);

      CKEDITOR.instances.description.setData(student.description);
  


    let hobbies = [];
    if (typeof student.hobbies === "string") {
      hobbies = student.hobbies.split(",").map(h => h.trim()).filter(h => h);
    } else if (Array.isArray(student.hobbies)) {
      hobbies = student.hobbies;
    }
    $(".hobbies-select").val(hobbies).trigger("change");

    $("input[name='subjects']").prop("checked", false);
    if (student.subjects) {
      let subjectsArr = [];
      if (Array.isArray(student.subjects)) {
        subjectsArr = student.subjects;
      } else if (typeof student.subjects === "string") {
        subjectsArr = student.subjects.split(",").map(s => s.trim());
      }
      subjectsArr.forEach(subject => {
        $(`input[name='subjects'][value='${subject}']`).prop("checked", true);
      });
    }

    
    $("input[name='sex']").prop("checked", false);
    if (student.sex) {
      $(`input[name='sex'][value='${student.sex}']`).prop("checked", true);
    }
  } else {
    alert("Student not found");
  }
}

function UpdateStudent() {
  let id = parseInt($("#id").val());
  let hobbies = $(".hobbies-select").val();
  let hobbiesCommaSeparated = "";
  if (hobbies && hobbies.length > 0) {
    for (let i = 0; i < hobbies.length; i++) {
      hobbiesCommaSeparated += `${hobbies[i]},`;
    }
    hobbiesCommaSeparated = hobbiesCommaSeparated.slice(0, -1);
  }
  let subjects = [];
  let subjectsLength = $("input[name='subjects']:checked").length;
  for (let i = 0; i < subjectsLength; i++) {
    subjects.push($("input[name='subjects']:checked")[i].value);
  }
  let subjectsCommaSeparated = subjects.join(", ");


  let description = CKEDITOR.instances.description
    ? CKEDITOR.instances.description.getData()
    : $("#description").val();

  let UpdateStudentObject = {
    id: id,
    name: $("#name").val(),
    email: $("#email").val(),
    password: $("#password").val(),
    dob: $("#dob").val(),
    description: description,
    sex: $("input[name='sex']:checked").val(),
    hobbies: hobbiesCommaSeparated,
    subjects: subjectsCommaSeparated,
    isDeleted: false,
  };

  let index = data.findIndex((student) => student.id === id);
  console.log(index);
  if (index !== -1) {
    data[index] = UpdateStudentObject;
    localStorage.setItem("studentData", JSON.stringify(data));
    ShowDataInTable();
    $("#StudentModal").modal("hide");
  }
}

function DeletionOfStudentRecord(id) {
  let studentToDelete = data.find((x) => x.id === id);
   $("#staticBackdropLabel").html(`Are you sure you want to delete the record for:    <strong>${studentToDelete.email}</strong>?`);
  $("#DeleteModal").modal("show");
  $("#ConfirmDeletion")
    .off("click")
    .on("click", function () {
       
      data = JSON.parse(localStorage.getItem("studentData")) || [];
      let index = data.findIndex((student) => student.id === id);
      if (index !== -1) {
        data[index].isDeleted = true;
        localStorage.setItem("studentData", JSON.stringify(data));
        ShowDataInTable();
      }
      $("#DeleteModal").modal("hide");
    });
}



