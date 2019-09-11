QuestionJSON = [];
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}
var dialog, form;

$(document).ready(function() {
  
  $(document).ajaxStart(function(){
    $("#wait").css("display", "block");
  });
  $(document).ajaxComplete(function(){
    $("#wait").css("display", "none");
  });
    var lastsel;
    
     $("#dispSubAssess").dialog({
      autoOpen: false,
      height: 500,
      width: 800,
      modal: true,
      close: function() {}
    });

    $("#frmTrial").dialog({
      autoOpen: false,
      height: 190,
      width: 400,
      modal: true,
      closeOnEscape: false
    });
    
    $("#btnSubmit" ).click(function() {
        var value = $("#users option:selected").val();
        //alert(value);
        getHIVSubjectiveAssessmentByUserID(value);
      });
    
    $('#btnTrialSubmit').click(function(){
        var trialID = $("#txtTrialID").val();
        getUsersByTrialID(trialID);
    }); 
    $('#btnReset').click(function(){
      clearForm();
    });
    clearForm();
});
function clearGrid()
{
  $("#grid").jqGrid("GridUnload");
}

function clearForm()
{
  $("#frmTrial").dialog('open');
  $("#divUsers").hide();
  $('#divAssessments').hide();
  $('#divSummary').hide();
  $("#grid").jqGrid("clearGridData");
  $("#grid").jqGrid("GridUnload");
  $('#users')
    .find('option')
    .remove()
    .end()
    .append('<option value="select">Select User</option>')
    .val('select');
  $('#txtTrialID').text('');
}

function getHIVSubjectiveAssessmentByUserID(userid)
    {
        var apiHost = $(location).attr('host');
        var apiURL = "https://" + apiHost + "/api/v1/getHIVSubjectiveAssessmentByUserID" + userid;
        $("#grid").jqGrid("clearGridData");
        $("#grid").jqGrid("GridUnload");
        $.ajax({
            url: apiURL,
            type: "get", //send it through get method
            success: function(response) {
                $("#grid").jqGrid({
                    colModel: [
                        {name: "Id"},
                        { name: "deviceId" },
                        { name: "patientId" },
                        { name: "startTime" },
                        { name: "endTime" },
                        { name: "risk" },
                        { name: "riskValue" },
                        { name: "partnerRiskValue" }
                    ],
                    data: response,
                    onSelectRow : function(id){ 
                        data = $(this).jqGrid("getLocalRow", id);
                        getSubjectiveAssessmentByID(data.Id);
                    }
                });
                $('#divAssessments').show();
                
            },
            error: function(xhr) {
                console.log(xhr);
              //Do Something to handle error
            }
          });
    }

    function getUsersByTrialID(trialID)
    {
        //const userID = $.urlParam('id');
        var apiHost = $(location).attr('host');
        var apiURL = "https://" + apiHost + "/api/v1/getUsersByTrialID" + trialID;
        $.ajax({
            url: apiURL,
            type: "get", //send it through get method
            success: function(response) {
              console.log(response);
                $.each(response[0], function (){
                    $("#users").append($("<option     />").val(this.id).text(this.name));
                    //$("#users").append("<a class='dropdown-item'>"  + this.name + "</a>");
                });

                window.QuestionJSON = response[1];
                console.log(response);
                console.log(window.QuestionJSON);
                $('#lblUsers').text('Total Users : ' + response[2][0].UserCount);
                $('#lblSubAss').text('Total Subjective Assessments : '  + response[3][0].SACount);
                $('#divSummary').show();
                $("#frmTrial").dialog('close');
                $("#divUsers").show();
              //Do Something
            },
            error: function(xhr) {
                console.log(xhr);
              //Do Something to handle error
            }
          });
    }

    function getSubjectiveAssessmentByID(id)
    {
        const subAssID = id;
        var apiHost = $(location).attr('host');
        var apiURL = "https://" + apiHost + "/api/v1/getSubjectiveAssessment" + subAssID;
        $.ajax({
            url: apiURL,
            type: "get", //send it through get method
            success: function(response) {
                console.log('Question JSON');
                var subjAssJSON = JSON.parse(window.QuestionJSON[0].ActualJSON);
                console.log(subjAssJSON);
                var answers = response.result.recordsets[0];
                var output = '<table style="width:100%">';
                
                subjAssJSON.forEach(element => {
                 output += "<tr><td><br>" + element.questionId + " : " + element.question + "</td></tr>" 
                 var filteredData = answers.filter(function(item){
                    return item.questionId == element.questionId
                 });

                 filteredData.forEach(ans => {
                   element.options.forEach(option => {
                     if(ans.optionId==option.optionId){
                      output += "<tr><td><b>" + (typeof option.option === 'undefined'? "" : option.option) + (ans.optionResponse!="null"? " - " + ans.optionResponse : "") + "</td></tr>";
                      //break;
                     }
                    
                   })
                    
                 });
                                                 
                });
                output+= "</table>";
                $("#divSubAssess").html(output);
                $("#dispSubAssess").dialog('open');   
              //Do Something
            },
            error: function(xhr) {
                console.log(xhr);
              //Do Something to handle error
            }
          });
    
    }