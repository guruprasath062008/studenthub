const mysql = require('mysql2/promise');

let pool = null;
let isFallback = false;

// Standalone fallback memory store
const memoryStudents = [
  {
    id: 1,
    roll_number: 'CS2023001',
    first_name: 'Aarav',
    last_name: 'Patel',
    email: 'aarav.patel@student.edu',
    phone: '+91 9876543210',
    department: 'Computer Science',
    enrollment_date: '2023-08-16',
    gpa: 3.85,
    status: 'Active',
    created_at: new Date('2023-08-16')
  },
  {
    id: 2,
    roll_number: 'CS2023002',
    first_name: 'Diya',
    last_name: 'Sharma',
    email: 'diya.sharma@student.edu',
    phone: '+91 9876543211',
    department: 'Computer Science',
    enrollment_date: '2023-08-16',
    gpa: 3.92,
    status: 'Active',
    created_at: new Date('2023-08-16')
  },
  {
    id: 3,
    roll_number: 'IT2023015',
    first_name: 'Rohan',
    last_name: 'Verma',
    email: 'rohan.verma@student.edu',
    phone: '+91 9876543212',
    department: 'Information Technology',
    enrollment_date: '2023-08-18',
    gpa: 3.45,
    status: 'Active',
    created_at: new Date('2023-08-18')
  },
  {
    id: 4,
    roll_number: 'EE2022040',
    first_name: 'Ananya',
    last_name: 'Iyer',
    email: 'ananya.iyer@student.edu',
    phone: '+91 9876543213',
    department: 'Electrical Engineering',
    enrollment_date: '2022-08-20',
    gpa: 3.70,
    status: 'Active',
    created_at: new Date('2022-08-20')
  },
  {
    id: 5,
    roll_number: 'ME2022025',
    first_name: 'Vikram',
    last_name: 'Singh',
    email: 'vikram.singh@student.edu',
    phone: '+91 9876543214',
    department: 'Mechanical Engineering',
    enrollment_date: '2022-08-20',
    gpa: 3.20,
    status: 'Inactive',
    created_at: new Date('2022-08-20')
  },
  {
    id: 6,
    roll_number: 'CE2021008',
    first_name: 'Sneha',
    last_name: 'Nair',
    email: 'sneha.nair@student.edu',
    phone: '+91 9876543215',
    department: 'Civil Engineering',
    enrollment_date: '2021-08-22',
    gpa: 3.95,
    status: 'Graduated',
    created_at: new Date('2021-08-22')
  },
  {
    id: 7,
    roll_number: 'CS2023009',
    first_name: 'Kavya',
    last_name: 'Reddy',
    email: 'kavya.reddy@student.edu',
    phone: '+91 9876543216',
    department: 'Computer Science',
    enrollment_date: '2023-08-16',
    gpa: 3.65,
    status: 'Active',
    created_at: new Date('2023-08-16')
  },
  {
    id: 8,
    roll_number: 'IT2022033',
    first_name: 'Arjun',
    last_name: 'Mehta',
    email: 'arjun.mehta@student.edu',
    phone: '+91 9876543217',
    department: 'Information Technology',
    enrollment_date: '2022-08-18',
    gpa: 2.90,
    status: 'Suspended',
    created_at: new Date('2022-08-18')
  }
];
let nextStudentId = 9;

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'rootpassword';
  const database = process.env.DB_NAME || 'studenthub_db';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  try {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000
    });

    const conn = await pool.getConnection();
    console.log(`[Student Service DB] Successfully connected to MySQL at ${host}:${port}/${database}`);
    conn.release();
    isFallback = false;
  } catch (err) {
    console.warn(`[Student Service DB] MySQL connection to ${host}:${port} unavailable: ${err.message}`);
    console.log('[Student Service DB] Activating resilient in-memory storage mode for standalone testing.');
    isFallback = true;
  }
}

initDB();

async function query(sql, params = []) {
  if (!isFallback && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('[Student Service DB] MySQL Query Error:', err.message);
      throw err;
    }
  }

  // Fallback simulator for students
  const normalized = sql.trim().toLowerCase();

  // SELECT BY ID
  if (normalized.includes('from `students` where `id` = ?') || normalized.includes('from students where id = ?')) {
    const id = parseInt(params[0], 10);
    const match = memoryStudents.find(s => s.id === id);
    return match ? [match] : [];
  }

  // CHECK ROLL NUMBER OR EMAIL DUPLICATE
  if (normalized.includes('where `roll_number` = ? or `email` = ?') || normalized.includes('where roll_number = ? or email = ?')) {
    const roll = params[0];
    const email = params[1];
    const matches = memoryStudents.filter(s => s.roll_number.toLowerCase() === roll.toLowerCase() || s.email.toLowerCase() === email.toLowerCase());
    return matches;
  }

  // CHECK ROLL OR EMAIL FOR UPDATE (EXCLUDING CURRENT ID)
  if (normalized.includes('and `id` != ?') || normalized.includes('and id != ?')) {
    const roll = params[0];
    const email = params[1];
    const excludeId = parseInt(params[2], 10);
    const matches = memoryStudents.filter(s => s.id !== excludeId && (s.roll_number.toLowerCase() === roll.toLowerCase() || s.email.toLowerCase() === email.toLowerCase()));
    return matches;
  }

  // GENERAL SELECT ALL
  if (normalized.startsWith('select') && (normalized.includes('from `students`') || normalized.includes('from students'))) {
    return [...memoryStudents];
  }

  // INSERT
  if (normalized.startsWith('insert into `students`') || normalized.startsWith('insert into students')) {
    const [roll_number, first_name, last_name, email, phone, department, enrollment_date, gpa, status] = params;
    const newStudent = {
      id: nextStudentId++,
      roll_number,
      first_name,
      last_name,
      email,
      phone,
      department,
      enrollment_date,
      gpa: parseFloat(gpa) || 0.0,
      status: status || 'Active',
      created_at: new Date()
    };
    memoryStudents.push(newStudent);
    return { insertId: newStudent.id, affectedRows: 1 };
  }

  // UPDATE
  if (normalized.startsWith('update `students`') || normalized.startsWith('update students')) {
    const [roll_number, first_name, last_name, email, phone, department, enrollment_date, gpa, status, id] = params;
    const targetId = parseInt(id, 10);
    const index = memoryStudents.findIndex(s => s.id === targetId);
    if (index !== -1) {
      memoryStudents[index] = {
        ...memoryStudents[index],
        roll_number,
        first_name,
        last_name,
        email,
        phone,
        department,
        enrollment_date,
        gpa: parseFloat(gpa) || 0.0,
        status: status || 'Active',
        updated_at: new Date()
      };
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // DELETE
  if (normalized.startsWith('delete from `students`') || normalized.startsWith('delete from students')) {
    const targetId = parseInt(params[0], 10);
    const index = memoryStudents.findIndex(s => s.id === targetId);
    if (index !== -1) {
      memoryStudents.splice(index, 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  return [];
}

module.exports = {
  query,
  initDB,
  isFallbackMode: () => isFallback
};
