$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}
var dialog, form;

$(document).ready(function() {
    var lastsel;
    $("#divUsers").hide();
     $("#dispSubAssess").dialog({
      autoOpen: false,
      height: 500,
      width: 800,
      modal: true,
      close: function() {}
    });

    $("#frmTrial").dialog({
      autoOpen: true,
      height: 400,
      width: 400,
      modal: true,
      closeOnEscape: false
    });
    
    $( "#btnSubmit" ).click(function() {
        var value = $("#users option:selected").val();
        alert(value);
        getHIVSubjectiveAssessmentByUserID(value);
      });
    
    $('#btnTrialSubmit').click(function(){
        var trialID = $("#txtTrialID").val();
        getUsersByTrialID(trialID);
    }); 
    
    //$("#frmTrial").dialog('open');   
});

function getHIVSubjectiveAssessmentByUserID(userid)
    {
        var apiHost = $(location).attr('host');
        var apiURL = "https://" + apiHost + "/api/v1/getHIVSubjectiveAssessmentByUserID" + userid;
        console.log(apiURL);
        $.ajax({
            url: apiURL,
            type: "get", //send it through get method
            success: function(response) {
                console.log(response);
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
                        console.log('On Select = ' + id);
                        data = $(this).jqGrid("getLocalRow", id);
                        console.log(data);
                        
                        getSubjectiveAssessmentByID(data.Id);
                        // if (id && id !== lastsel) {
                        //     $('#grid').restoreRow(lastsel);
                        //     $('#grid').editRow(id, true);
                        //     lastsel = id;
                        // }

                    }
                });
                alert('Data Loaded..');
              //Do Something
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
        console.log(apiURL);
        $.ajax({
            url: apiURL,
            type: "get", //send it through get method
            success: function(response) {
                console.log(response);
                $.each(response, function (){
                    $(".users").append($("<option     />").val(this.id).text(this.name));
                });
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
        console.log(apiURL);
        $.ajax({
            url: apiURL,
            type: "get", //send it through get method
            success: function(response) {
                console.log(response);
                var subjAssJSON = JSON.parse(response.result.recordsets[0][0].ActualJSON);
                var answers = response.result.recordsets[1];
                var output = '<table style="width:100%">';
                
                subjAssJSON.forEach(element => {
                 output += "<tr><td><br>" + element.questionId + " : " + element.question + "</td></tr>" 
                 var filteredData = answers.filter(function(item){
                    return item.questionId == element.questionId
                 });

                 filteredData.forEach(ans => {
                   element.options.forEach(option => {
                     if(ans.optionId==option.optionId){
                      output += "<tr><td><b>" + option.option + (ans.optionResponse!="null"? " - " + ans.optionResponse : "") + "</td></tr>";
                      //break;
                     }
                    
                   })
                    
                 });
                 
                 console.log(filteredData);
                 
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