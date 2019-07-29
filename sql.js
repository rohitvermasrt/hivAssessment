var sql = require('mssql');
var config = process.env["WEBSITE_SITE_NAME"];

    var tvp_Emp = new sql.Table();  
// Columns must correspond with type we have created in database.   
tvp_Emp.columns.add('Name', sql.VarChar(50));  
tvp_Emp.columns.add('Salary', sql.Decimal(5, 0));
  