const db = require('../config/db');

/**
 * Retrieve all students with optional search, department/status filter, and sorting
 * GET /api/students
 */
async function getAllStudents(req, res) {
  try {
    const { search, department, status, sortBy = 'id', sortOrder = 'DESC' } = req.query;

    let students = await db.query('SELECT * FROM `students` ORDER BY `id` DESC');

    // Filter by search query (name, roll_number, email)
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      students = students.filter(s =>
        (s.first_name && s.first_name.toLowerCase().includes(q)) ||
        (s.last_name && s.last_name.toLowerCase().includes(q)) ||
        (s.roll_number && s.roll_number.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q))
      );
    }

    // Filter by department
    if (department && department !== 'All' && department.trim() !== '') {
      students = students.filter(s => s.department.toLowerCase() === department.toLowerCase());
    }

    // Filter by status
    if (status && status !== 'All' && status.trim() !== '') {
      students = students.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }

    // Sort
    const validSortFields = ['id', 'first_name', 'last_name', 'roll_number', 'gpa', 'enrollment_date', 'department', 'status'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'id';
    const isAsc = sortOrder.toUpperCase() === 'ASC';

    students.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    console.error('[Student Controller] getAllStudents error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students records.'
    });
  }
}

/**
 * Retrieve aggregated statistics for dashboard
 * GET /api/students/stats
 */
async function getStudentStats(req, res) {
  try {
    const students = await db.query('SELECT * FROM `students`');

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const inactiveStudents = students.filter(s => s.status === 'Inactive').length;
    const graduatedStudents = students.filter(s => s.status === 'Graduated').length;
    const suspendedStudents = students.filter(s => s.status === 'Suspended').length;

    const gpaSum = students.reduce((acc, s) => acc + (parseFloat(s.gpa) || 0), 0);
    const averageGpa = totalStudents > 0 ? (gpaSum / totalStudents).toFixed(2) : '0.00';

    const departmentDistribution = {};
    students.forEach(s => {
      departmentDistribution[s.department] = (departmentDistribution[s.department] || 0) + 1;
    });

    const totalDepartments = Object.keys(departmentDistribution).length;

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        graduatedStudents,
        suspendedStudents,
        averageGpa,
        totalDepartments,
        departmentDistribution
      }
    });
  } catch (err) {
    console.error('[Student Controller] getStudentStats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute student statistics.'
    });
  }
}

/**
 * Retrieve single student by ID
 * GET /api/students/:id
 */
async function getStudentById(req, res) {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID parameter.'
      });
    }

    const students = await db.query('SELECT * FROM `students` WHERE `id` = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: students[0]
    });
  } catch (err) {
    console.error('[Student Controller] getStudentById error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details.'
    });
  }
}

/**
 * Create a new student record
 * POST /api/students
 */
async function createStudent(req, res) {
  try {
    const {
      roll_number,
      first_name,
      last_name,
      email,
      phone,
      department,
      enrollment_date,
      gpa,
      status
    } = req.body;

    // Validation
    if (!roll_number || !first_name || !last_name || !email || !department || !enrollment_date) {
      return res.status(400).json({
        success: false,
        message: 'Roll number, first name, last name, email, department, and enrollment date are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid student email address.'
      });
    }

    const parsedGpa = parseFloat(gpa) || 0.0;
    if (parsedGpa < 0 || parsedGpa > 4.0) {
      return res.status(400).json({
        success: false,
        message: 'GPA must be between 0.0 and 4.0.'
      });
    }

    // Check duplicate roll number or email
    const duplicates = await db.query(
      'SELECT * FROM `students` WHERE `roll_number` = ? OR `email` = ?',
      [roll_number.trim(), email.trim()]
    );

    if (duplicates.length > 0) {
      const match = duplicates[0];
      const field = match.roll_number.toLowerCase() === roll_number.trim().toLowerCase() ? 'Roll Number' : 'Email';
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists.`
      });
    }

    const result = await db.query(
      'INSERT INTO `students` (`roll_number`, `first_name`, `last_name`, `email`, `phone`, `department`, `enrollment_date`, `gpa`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        roll_number.trim(),
        first_name.trim(),
        last_name.trim(),
        email.trim(),
        phone ? phone.trim() : '',
        department.trim(),
        enrollment_date,
        parsedGpa,
        status || 'Active'
      ]
    );

    const newStudentId = result.insertId;
    const created = await db.query('SELECT * FROM `students` WHERE `id` = ?', [newStudentId]);

    return res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: created.length > 0 ? created[0] : { id: newStudentId, ...req.body }
    });
  } catch (err) {
    console.error('[Student Controller] createStudent error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create student record.'
    });
  }
}

/**
 * Update an existing student record
 * PUT /api/students/:id
 */
async function updateStudent(req, res) {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID parameter.'
      });
    }

    const existing = await db.query('SELECT * FROM `students` WHERE `id` = ?', [studentId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    const current = existing[0];
    const {
      roll_number = current.roll_number,
      first_name = current.first_name,
      last_name = current.last_name,
      email = current.email,
      phone = current.phone,
      department = current.department,
      enrollment_date = current.enrollment_date,
      gpa = current.gpa,
      status = current.status
    } = req.body;

    const parsedGpa = parseFloat(gpa) || 0.0;
    if (parsedGpa < 0 || parsedGpa > 4.0) {
      return res.status(400).json({
        success: false,
        message: 'GPA must be between 0.0 and 4.0.'
      });
    }

    // Check duplicate roll number or email belonging to other students
    const duplicates = await db.query(
      'SELECT * FROM `students` WHERE (`roll_number` = ? OR `email` = ?) AND `id` != ?',
      [roll_number.trim(), email.trim(), studentId]
    );

    if (duplicates.length > 0) {
      const match = duplicates[0];
      const field = match.roll_number.toLowerCase() === roll_number.trim().toLowerCase() ? 'Roll Number' : 'Email';
      return res.status(400).json({
        success: false,
        message: `Another student already has this ${field}.`
      });
    }

    // Format enrollment_date to YYYY-MM-DD if string date
    const formattedDate = typeof enrollment_date === 'string' && enrollment_date.includes('T')
      ? enrollment_date.split('T')[0]
      : enrollment_date;

    await db.query(
      'UPDATE `students` SET `roll_number` = ?, `first_name` = ?, `last_name` = ?, `email` = ?, `phone` = ?, `department` = ?, `enrollment_date` = ?, `gpa` = ?, `status` = ? WHERE `id` = ?',
      [
        roll_number.trim(),
        first_name.trim(),
        last_name.trim(),
        email.trim(),
        phone ? phone.trim() : '',
        department.trim(),
        formattedDate,
        parsedGpa,
        status,
        studentId
      ]
    );

    const updated = await db.query('SELECT * FROM `students` WHERE `id` = ?', [studentId]);

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: updated[0]
    });
  } catch (err) {
    console.error('[Student Controller] updateStudent error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student record.'
    });
  }
}

/**
 * Delete a student record
 * DELETE /api/students/:id
 */
async function deleteStudent(req, res) {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID parameter.'
      });
    }

    const existing = await db.query('SELECT * FROM `students` WHERE `id` = ?', [studentId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    await db.query('DELETE FROM `students` WHERE `id` = ?', [studentId]);

    return res.status(200).json({
      success: true,
      message: `Student ${existing[0].first_name} ${existing[0].last_name} (${existing[0].roll_number}) deleted successfully.`
    });
  } catch (err) {
    console.error('[Student Controller] deleteStudent error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student record.'
    });
  }
}

/**
 * Health check endpoint
 * GET /api/students/health
 */
function healthCheck(req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'student-service',
    timestamp: new Date().toISOString(),
    storageMode: db.isFallbackMode() ? 'in-memory-fallback' : 'mysql-connected'
  });
}

module.exports = {
  getAllStudents,
  getStudentStats,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  healthCheck
};
