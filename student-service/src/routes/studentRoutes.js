const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// Public / Health endpoint
router.get('/health', studentController.healthCheck);

// Statistics endpoint for dashboard cards
router.get('/stats', studentController.getStudentStats);

// Student CRUD operations
router.get('/', optionalAuth, studentController.getAllStudents);
router.get('/:id', optionalAuth, studentController.getStudentById);

// Creation, Updating, Deletion (guarded by JWT token; accepts Bearer token from Auth Service)
// If BYPASS_AUTH=true is set in env, allows testing without token
const authGuard = (req, res, next) => {
  if (process.env.BYPASS_AUTH === 'true') {
    return next();
  }
  return verifyToken(req, res, next);
};

router.post('/', authGuard, studentController.createStudent);
router.put('/:id', authGuard, studentController.updateStudent);
router.delete('/:id', authGuard, studentController.deleteStudent);

module.exports = router;
