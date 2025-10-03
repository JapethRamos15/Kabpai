const Student = require('../models/studentModel');

const studentController = {
  // Get all students
  getAllStudents: async (req, res) => {
    try {
      const students = await Student.getAll();
      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching students',
        error: error.message
      });
    }
  },

  // Get student by ID
  getStudentById: async (req, res) => {
    try {
      const student = await Student.getById(req.params.id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching student',
        error: error.message
      });
    }
  },

  // Create new student
  createStudent: async (req, res) => {
    try {
      const { firstname, lastname, course, status } = req.body;

      // Validation
      if (!firstname || !lastname || !course || !status) {
        return res.status(400).json({
          success: false,
          message: 'All fields (firstname, lastname, course, status) are required'
        });
      }

      const newStudent = await Student.create({
        firstname,
        lastname,
        course,
        status
      });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: newStudent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating student',
        error: error.message
      });
    }
  },

  // Update student
  updateStudent: async (req, res) => {
    try {
      const { firstname, lastname, course, status } = req.body;
      const studentId = req.params.id;

      // Check if student exists
      const existingStudent = await Student.getById(studentId);
      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Validation
      if (!firstname || !lastname || !course || !status) {
        return res.status(400).json({
          success: false,
          message: 'All fields (firstname, lastname, course, status) are required'
        });
      }

      await Student.update(studentId, {
        firstname,
        lastname,
        course,
        status
      });

      res.json({
        success: true,
        message: 'Student updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating student',
        error: error.message
      });
    }
  },

  // Delete student
  deleteStudent: async (req, res) => {
    try {
      const studentId = req.params.id;

      // Check if student exists
      const existingStudent = await Student.getById(studentId);
      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      await Student.delete(studentId);

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting student',
        error: error.message
      });
    }
  },

  // Get students by status
  getStudentsByStatus: async (req, res) => {
    try {
      const { status } = req.params;
      const students = await Student.getByStatus(status);
      
      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching students by status',
        error: error.message
      });
    }
  }
};

module.exports = studentController;