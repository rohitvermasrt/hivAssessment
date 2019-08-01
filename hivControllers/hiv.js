var LINQ = require('node-linq').LINQ;
var sql = require('mssql');

  
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
        var config = process.env["SQLConnectionString"] ;
        const id = parseInt(req.params.id, 10);
        sql.on('error', err => {
            console.log("SQL Connection Error");
            console.log(err);
            // ... error handler
        });

        return sql.connect(config)
        .then(pool => {
           return pool.request()
            .input('id', id)
            .execute("get_SubjectiveAssessment")
            .then(result => {
                //console.log(result.recordsets.length());
                console.log(JSON.stringify(result.recordsets[0]));
                var qJSON = result.recordsets[0].
                console.log('Then closing sql connection');
                sql.close();
                res.status(200).send({
                    success: 'true',
                    result: result,
                    message: 'HIV MGD data sync successful...'
                });
                return true;
            });
            
        }).catch(err => {
            // ... error checks
            console.log('In catch closing sql connection');
            sql.close();
            console.log(err.message);
            
        });;
               
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

        var config = process.env["SQLConnectionString"] ||  "mssql://mgdhivdataadmin:Bss@2005@mgdhivdata.database.windows.net/hivmgddev?encrypt=true" ;

        sql.on('error', err => {
            console.log("SQL Connection Error");
            console.log(err);
            // ... error handler
        });

        return sql.connect(config)
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
                res.status(200).send({
                    success: 'true',
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
                
                pool.request()
                .input('SAAnswers', tvp_SAAns)
                .input('SAQuestionStatus', tvp_SAQStatus)
                .input('deviceId', objUser.deviceId)
                .input('emailId', objUser.email)
                .input('fullName', objUser.fullName)
                .input('trialId', objUser.trialId)
                .input('patientId', subAsses.patientId)
                .input('startTime', subAsses.startTime)
                .input('endTime', subAsses.endTime)
                .input('risk', subAsses.riskValue)
                .input('jsonVersion', subAsses.jsonVersion)
                .input('riskValue', subAsses.riskValue)
                .input('latitude', subAsses.latitude)
                .input('longitude', subAsses.longitude)
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
                    resolve("Insertion successfull");
                })
                .catch(err => {
                    // ... error checks
                    console.log('In catch closing sql connection');
                    sql.close();
                   
                    reject(err);
                });
            });
            
        }

    }
}
const hivController = new HIVController();
export default hivController;

