 
class HIVController {
  
    
    testCheck(req,res){
          
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

    getSubjectiveAssessment(req,res){
        var data = req.body; 
        var sql = require('mssql');
        var config = JSON.parse(process.env["SQLConnectionString"]);
        sql.on('error', err => {
            console.log("SQL Connection Error");
            console.log(err);
            // ... error handler
        });

        const id = parseInt(req.params.id, 10);
        console.log("Searching for ID : " + id);
        return new sql.ConnectionPool(config).connect()
        .then(pool => {
            pool.request()
            .input('id', id)
            .execute("get_SubjectiveAssessment")
            .then(result => {
                console.dir(result);
                console.log('Then closing sql connection');
                sql.close();
                if(result.recordsets.length >0 ){
                    res.status(200).send({
                        success: 'true',
                        message: 'Data found for given Subjective Assessment.',
                        result : result
                    });
                }else{
                    res.status(400).send({
                        success: 'false',
                        message: 'No data found for given Subjective Assessment.'
                    });
                }
            })
            .catch(err => {
                console.log('In catch closing sql connection');
                sql.close();
                console.log(err.message);
                res.status(500).send({
                    success: 'false',
                    message: err.message
                });
            });

        });

    }


    getSubjectiveAssessmentByUserID(req,res){
        var data = req.body; 
        var sql = require('mssql');
        var config = JSON.parse(process.env["SQLConnectionString"]);
        sql.on('error', err => {
            console.log("SQL Connection Error");
            console.log(err);
            // ... error handler
        });

        const id = parseInt(req.params.id, 10);
        console.log("Searching for ID : " + id);
        return new sql.ConnectionPool(config).connect()
        .then(pool => {
            pool.request()
            .input('userID', id)
            .execute("get_HIVSubjectiveAssessmentsByUserID")
            .then(result => {
                console.dir(result);
                console.log('Then closing sql connection');
                sql.close();
                if(result.recordsets.length >0 ){
                    res.status(200).send(
                        result.recordset
                    );
                }else{
                    res.status(400).send({
                        success: 'false',
                        message: 'No Subjective Assessments found for given UserID .'
                    });
                }
            })
            .catch(err => {
                console.log('In catch closing sql connection');
                sql.close();
                console.log(err.message);
                res.status(500).send({
                    success: 'false',
                    message: err.message
                });
            });

        });

    }

    getUsersByTrialID(req,res){
        var sql = require('mssql');
        var config = JSON.parse(process.env["SQLConnectionString"]);
        sql.on('error', err => {
            console.log("SQL Connection Error");
            console.log(err);
            // ... error handler
        });

        const trialID = req.params.id;
        console.log("Searching for ID : " + trialID);
        return new sql.ConnectionPool(config).connect()
        .then(pool => {
            pool.request()
            .input('trialID', trialID)
            .execute("get_UsersByTrialID")
            .then(result => {
                console.dir(result);
                console.log('Then closing sql connection');
                sql.close();
                if(result.recordsets.length >0 ){
                    res.status(200).send(
                        result.recordset
                    );
                }else{
                    res.status(400).send({
                        success: 'false',
                        message: 'No Users found for given TrialID.'
                    });
                }
            })
            .catch(err => {
                console.log('In catch closing sql connection');
                sql.close();
                console.log(err.message);
                res.status(500).send({
                    success: 'false',
                    message: err.message
                });
            });

        });

    }



    hivmgdSync(req,res){
        var LINQ = require('node-linq').LINQ;
        var data = req.body;
        var user = data.user;
        var responseData = {};
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
                        risk : subAss.risk,
                        riskValue : subAss.riskValue,
                        partnerRiskValue : subAss.partnerRiskValue,
                        latitude : subAss.latitude,
                        longitude : subAss.longitude,
                        answers: subAss.answers,
                        patientId : subAss.patientId,
                        jsonVersion : subAss.jsonVersion,
                        questionStatuses : subAss.questionStatuses 
                    };
        })
        .ToArray();
        var sql = require('mssql');
        var config = JSON.parse(process.env["SQLConnectionString"] || '{"user": "mgdhivdataadmin","password": "Bss@2005","server": "mgdhivdata.database.windows.net","database":"hivmgddev","encrypt": true,"connectionTimeout": 300000,"requestTimeout": 300000,"options": {"encrypt": true},"pool":{"max": 100,"min": 0,"idleTimeoutMillis": 300000 }}');
        sql.on('error', err => {
            console.log("SQL Connection Error");
            console.log(err);
            // ... error handler
        });

        return new sql.ConnectionPool(config).connect()
        .then(pool => {
            var subAssessCount = 0;
            pool.request()
            .input('deviceId', objUser.deviceId)
            .input('emailId', objUser.email)
            .input('fullName', objUser.fullName)
            .input('trialId', objUser.trialId)
            .input('devicetimeStamp', objUser.deviceTimestamp)
            .execute("Insert_User")
            .then(result => {
                console.dir(result);
                responseData.UserID = result.returnValue;
                var myPromises = []
                objSubAssess.forEach(subAssess => {
                    myPromises.push(insert_HIVSA(subAssess,pool));
                });

                return  Promise.all(myPromises);
            })           
            .then((result) => {
                console.log('Then ');
                console.log(result);
                sql.close();
                responseData.returnValue = result;
                res.status(200).send({
                    success: 'true',
                    response: responseData,
                    message: 'HIV MGD data sync successful...'
                });
            }).catch(err => {
                // ... error checks
                console.log('Out catch closing sql connection');
                sql.close();
                console.log(err);
                res.status(500).send({
                    success: 'false',
                    message: 'HIV MGD data sync successful...'
                });
            });
        })

  
        function insert_HIVSA(subAsses,pool){
            return new Promise(function(resolve,reject){
                var tvp_SAAns = new sql.Table();  
                 
                tvp_SAAns.columns.add('questionId', sql.Int);  
                tvp_SAAns.columns.add('optionId', sql.Int);  
                tvp_SAAns.columns.add('optionValue', sql.Bit);  
                tvp_SAAns.columns.add('optionResponse', sql.NVarChar(100));  
                
                subAsses.answers.forEach(function(answer){
                   
                    tvp_SAAns.rows.add(answer.questionId,answer.optionId,answer.optionValue=="true"?1:0,answer.optionResponse)
                });

                var tvp_SAQStatus = new sql.Table();  
                
                tvp_SAQStatus.columns.add('questionId', sql.Int);  
                tvp_SAQStatus.columns.add('status', sql.NVarChar(50));  
                subAsses.questionStatuses.forEach(function(queStatus){
                    
                    tvp_SAQStatus.rows.add(queStatus.questionId,queStatus.status)
                });

                console.log('before sql');
                
                return pool.request()
                .input('SAAnswers', tvp_SAAns)
                .input('SAQuestionStatus', tvp_SAQStatus)
                .input('deviceId', objUser.deviceId)
                .input('emailId', objUser.email)
                .input('fullName', objUser.fullName)
                .input('trialId', objUser.trialId)
                .input('patientId', subAsses.patientId)
                .input('startTime', subAsses.startTime)
                .input('endTime', subAsses.endTime)
                .input('risk', subAsses.risk)
                .input('riskValue', subAsses.riskValue)
                .input('partnerRiskValue', subAsses.partnerRiskValue)
                .input('jsonVersion', subAsses.jsonVersion)
                .input('latitude', subAsses.latitude)
                .input('longitude', subAsses.longitude)
                .input('devicetimeStamp', subAsses.deviceTimestamp)
                .execute("Insert_HIVSubjectiveAssessment")
                .then(result => {
                    console.dir(result);
                    console.log('Then closing sql connection');
                    resolve({patientID: subAsses.patientId,subAssessID: result.returnValue, message: "Subjective Assessment Recorded Successfully."});
                })
                .catch(err => {
                    // ... error checks
                    console.log('In catch closing sql connection');                   
                    reject(err);
                });
            });
            
        }

    }
}
const hivController = new HIVController();
export default hivController;

