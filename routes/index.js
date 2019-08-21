import express from 'express';
import hivController from '../hivControllers/hiv';

const router = express.Router();

router.get('/api/v1/check', hivController.testCheck);
  
router.post('/api/v1/checkpost', hivController.testCheckPost);

router.post('/api/v1/hivmgdSync', hivController.hivmgdSync);

router.get('/api/v1/getSubjectiveAssessment:id', hivController.getSubjectiveAssessment);

router.get('/api/v1/getHIVSubjectiveAssessmentByUserID:id', hivController.getSubjectiveAssessmentByUserID);

router.get('/api/v1/getUsersByTrialID:id', hivController.getUsersByTrialID);

router.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: './public'
      });
})

router.get('/subjectiveAssessments', (req, res) => {
  res.sendFile('subjectiveAssessments.html', {
      root: './public'
    });
})

export default router;