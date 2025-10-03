const db = require('../database');

const Student = {
  // Get all students
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM tbl_students', (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  // Get student by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM tbl_students WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  },

  // Create new student
  create: (studentData) => {
    return new Promise((resolve, reject) => {
      const { firstname, lastname, course, status } = studentData;
      db.query(
        'INSERT INTO tbl_students (firstname, lastname, course, status) VALUES (?, ?, ?, ?)',
        [firstname, lastname, course, status],
        (err, results) => {
          if (err) reject(err);
          resolve({ id: results.insertId, ...studentData });
        }
      );
    });
  },

  // Update student
  update: (id, studentData) => {
    return new Promise((resolve, reject) => {
      const { firstname, lastname, course, status } = studentData;
      db.query(
        'UPDATE tbl_students SET firstname = ?, lastname = ?, course = ?, status = ? WHERE id = ?',
        [firstname, lastname, course, status, id],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  },

  // Delete student
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM tbl_students WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  // Get students by status
  getByStatus: (status) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM tbl_students WHERE status = ?', [status], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
};

module.exports = Student;