$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

$(document).ready(function() {
    $("p").text("asdfasdfads")
    getSubjectiveAssessmentByID(1);

    

    function getSubjectiveAssessmentByID(id)
    {
        const subAssID = $.urlParam('id');
        var apiHost = $(location).attr('host');
        var apiURL = "http://" + apiHost + "/api/v1/getSubjectiveAssessment" + subAssID;
        console.log(apiURL);
        $.ajax({
            url: apiURL,
            type: "get", //send it through get method
            success: function(response) {
                console.log(response);
                var subjAssJSON = JSON.parse(response.result.recordsets[0][0].ActualJSON);
                var answers = response.result.recordsets[1];
                var output = '';
                
                subjAssJSON.forEach(element => {
                 output += "<br><b>Question " + element.questionId + " : " + element.question + "</b>" 
                 var filteredData = answers.filter(function(item){
                    return item.questionId == element.questionId
                 });

                 filteredData.forEach(ans => {
                   element.options.forEach(option => {
                     if(ans.optionId==option.optionId){
                      output += "<br><b> Answer => OptionId : " + ans.optionId + "  Option : " + option.option + " - " + (ans.optionResponse!="null"?ans.optionResponse:"")
                      //break;
                     }
                    
                   })
                    
                 });
                 console.log(filteredData);
                 
                });
                $("p").html(output);
                
              //Do Something
            },
            error: function(xhr) {
                console.log(xhr);
              //Do Something to handle error
            }
          });
    
        $("p").text($(location).attr('host'));
    }
})