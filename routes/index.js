import express from 'express';
import hivController from '../hivControllers/hiv';

const router = express.Router();

router.get('/api/v1/check', hivController.testCheck);
  
router.post('/api/v1/checkpost', hivController.testCheckPost);

router.post('/api/v1/hivmgdSync', hivController.hivmgdSync);

router.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: './public'
      });
})

export default router;