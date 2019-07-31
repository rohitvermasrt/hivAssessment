var LINQ = require('node-linq').LINQ;
var sql = require('mssql');

  
class HIVController {

    testCheck(req,res){
          
        console.log(JSON.parse(config).host);
        console.log(config);
        res.status(200).send({
            success: 'true',
            message: 'todos retrieved successfully'
        });
    }

    testCheckPost(req,res){
        res.status(200).send({
            success: 'true',
            message: 'post success',
            id: req.query.id
        });
    }

    hivmgdSync(req,res){

        var data = req.body;
        var user = data.user;
        var objUser = {
            trialId : user.trialId,
            fullName : user.fullName,
            email : user.email,
            deviceId : user.deviceId,
            deviceTimestamp : user.timestamp
        }
        //console.log(objUser);
        
        var objSubAssess = new LINQ(data.subjectiveAssessments)
        .Select(function(subAss) 
        {
            return { 
                        deviceId : subAss.deviceId, 
                        startTime : subAss.startTime,
                        endTime : subAss.endTime,
                        deviceTimestamp : subAss.timestamp,
                        riskValue : subAss.riskValue,
                        latitude : subAss.latitude,
                        longitude : subAss.longitude,
                        answers: subAss.answers,
                        patientId : subAss.patientId,
                        jsonVersion : subAss.jsonVersion,
                        questionStatuses : subAss.questionStatuses 
                    };
        })
        .ToArray();

        var config = process.env["SQLConnectionString"];

        sql.on('error', err => {
            console.log("SQL Connection Error");
            console.log(err);
            // ... error handler
        });

        return sql.connect(config)
        .then(pool => {
            var subAssessCount = 0;
                objSubAssess.forEach(function(subAssess) {
                    subAssessCount +=1;
                    var tvp_SAAns = new sql.Table();  
                     
                    tvp_SAAns.columns.add('questionId', sql.Int);  
                    tvp_SAAns.columns.add('optionId', sql.Int);  
                    tvp_SAAns.columns.add('optionValue', sql.Bit);  
                    tvp_SAAns.columns.add('optionResponse', sql.NVarChar(100));  
                    
                    subAssess.answers.forEach(function(answer){
                       
                        tvp_SAAns.rows.add(answer.questionId,answer.optionId,answer.optionValue=="true"?1:0,answer.optionResponse)
                    });

                    var tvp_SAQStatus = new sql.Table();  
                    
                    tvp_SAQStatus.columns.add('questionId', sql.Int);  
                    tvp_SAQStatus.columns.add('status', sql.NVarChar(50));  
                    subAssess.questionStatuses.forEach(function(queStatus){
                        
                        tvp_SAQStatus.rows.add(queStatus.questionId,queStatus.status)
                    });

                    console.log('before sql');
                    
                    pool.request()
                    .input('SAAnswers', tvp_SAAns)
                    .input('SAQuestionStatus', tvp_SAQStatus)
                    .input('deviceId', objUser.deviceId)
                    .input('emailId', objUser.email)
                    .input('fullName', objUser.fullName)
                    .input('trialId', objUser.trialId)
                    .input('patientId', subAssess.patientId)
                    .input('startTime', subAssess.startTime)
                    .input('endTime', subAssess.endTime)
                    .input('risk', subAssess.riskValue)
                    .input('jsonVersion', subAssess.jsonVersion)
                    .input('riskValue', subAssess.riskValue)
                    .input('latitude', subAssess.latitude)
                    .input('longitude', subAssess.longitude)
                    .input('devicetimeStamp', objUser.deviceTimestamp)
                    .execute("Insert_HIVSubjectiveAssessment")
                    .then(result => {
                        console.dir(result);
                        console.log('Then closing sql connection');
                        // sql.close();
                        // res.status(200).send({
                        //     success: 'true',
                        //     message: 'HIV MGD data sync successful...'
                        // });
                        return true;
                    })
                    .catch(err => {
                        // ... error checks
                        console.log('In catch closing sql connection');
                        sql.close();
                        console.log(err.message);
                        
                    });
                });
                console.log("For each finished");
                var finalResponse = 
                {
                    status: true , 
                    message : "",
                    totalSubjectiveAssessment : subAssessCount
                };
                return finalResponse;
        })
        .then(result =>{
            sql.close();
            res.status(200).send({
                success: 'true',
                message: 'HIV MGD data sync successful...'
            });
        })
        .catch(err => {
            // ... error checks
            console.log('Out catch closing sql connection');
            sql.close();
            console.log(err);
            res.status(500).send({
                success: 'false',
                message: 'HIV MGD data sync successful...'
            });
        });
  
    }
}
const hivController = new HIVController();
export default hivController;

