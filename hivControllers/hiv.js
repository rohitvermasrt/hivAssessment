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

    hivmgdSync(req,res){

        console.log(req.body);
        var data = req.body;
        var user = data.user;
        var objUser = {
            trialId : user.trialId,
            fullName : user.fullName,
            email : user.email,
            deviceId : user.deviceId,
            deviceTimestamp : user.timestamp
        }
        console.log(objUser);
        
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
                        questionStatuses : subAss.questionStatuses 
                    };
        })
        .ToArray();

        var config = process.env["SQLConnectionString"];
        console.log(config)
        // objSubAssess.forEach(function(subAssess) {
        //     var tableName = table.name;
        //     var tvp_Emp = new sql.Table();  
        //     // Columns must correspond with type we have created in database.   
        //     tvp_Emp.columns.add('Name', sql.VarChar(50));  
        //     tvp_Emp.columns.add('Salary', sql.Decimal(5, 0));
        // });

        console.log(objSubAssess);

        

        

        res.status(200).send({
            success: 'true',
            message: 'HIV MGD data sync successful...'
        });
    }
}
const hivController = new HIVController();
export default hivController;

