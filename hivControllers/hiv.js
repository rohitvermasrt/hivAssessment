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

        res.status(200).send({
            success: 'true',
            message: 'HIV MGD data sync successful...'
        });
    }
}
const hivController = new HIVController();
export default hivController;

