const nodemailer = require('nodemailer');
const pool = require('../config/database');

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class NotificationService {
  // Send session reminder emails
  static async sendSessionReminder(sessionId) {
    try {
      // Get session details with participant info
      const query = `
        SELECT s.*, st.email as student_email, st.first_name as student_first_name,
               m.email as mentor_email, m.first_name as mentor_first_name,
               sk.name as skill_name
        FROM sessions s
        JOIN users st ON s.student_id = st.id
        JOIN users m ON s.mentor_id = m.id
        JOIN skills sk ON s.skill_id = sk.id
        WHERE s.id = $1 AND s.status = 'scheduled'
        AND s.scheduled_at > NOW() + INTERVAL '24 hours'
      `;

      const result = await pool.query(query, [sessionId]);
      if (result.rows.length === 0) return;

      const session = result.rows[0];

      // Send reminder to student (24 hours before)
      const studentMailOptions = {
        from: process.env.EMAIL_USER,
        to: session.student_email,
        subject: `Reminder: ${session.skill_name} session tomorrow`,
        html: `
          <h2>Session Reminder</h2>
          <p>Hi ${session.student_first_name},</p>
          <p>This is a reminder that you have a <strong>${session.skill_name}</strong> session scheduled for tomorrow.</p>
          <p><strong>Time:</strong> ${new Date(session.scheduled_at).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
          <p><strong>Mentor:</strong> ${session.mentor_first_name}</p>
          ${session.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${session.meeting_link}">${session.meeting_link}</a></p>` : ''}
          ${session.location ? `<p><strong>Location:</strong> ${session.location}</p>` : ''}
          <p>Don't forget to prepare for your learning session!</p>
          <p>Best regards,<br>BlockLearn Team</p>
        `
      };

      // Send reminder to mentor
      const mentorMailOptions = {
        from: process.env.EMAIL_USER,
        to: session.mentor_email,
        subject: `Reminder: ${session.skill_name} teaching session tomorrow`,
        html: `
          <h2>Teaching Session Reminder</h2>
          <p>Hi ${session.mentor_first_name},</p>
          <p>This is a reminder that you have a <strong>${session.skill_name}</strong> teaching session scheduled for tomorrow.</p>
          <p><strong>Time:</strong> ${new Date(session.scheduled_at).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
          <p><strong>Student:</strong> ${session.student_first_name}</p>
          ${session.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${session.meeting_link}">${session.meeting_link}</a></p>` : ''}
          ${session.location ? `<p><strong>Location:</strong> ${session.location}</p>` : ''}
          <p>Prepare your teaching materials and be ready to share your knowledge!</p>
          <p>Best regards,<br>BlockLearn Team</p>
        `
      };

      // Send emails
      await transporter.sendMail(studentMailOptions);
      await transporter.sendMail(mentorMailOptions);

      console.log(`Session reminder sent for session ${sessionId}`);

    } catch (error) {
      console.error('Error sending session reminder:', error);
    }
  }

  // Send session cancellation notifications
  static async sendCancellationNotification(sessionId) {
    try {
      const query = `
        SELECT s.*, st.email as student_email, st.first_name as student_first_name,
               m.email as mentor_email, m.first_name as mentor_first_name,
               sk.name as skill_name
        FROM sessions s
        JOIN users st ON s.student_id = st.id
        JOIN users m ON s.mentor_id = m.id
        JOIN skills sk ON s.skill_id = sk.id
        WHERE s.id = $1
      `;

      const result = await pool.query(query, [sessionId]);
      if (result.rows.length === 0) return;

      const session = result.rows[0];

      // Send cancellation notice to both parties
      const mailOptions = {
        from: process.env.EMAIL_USER,
        subject: `Session Cancelled: ${session.skill_name}`,
        html: `
          <h2>Session Cancellation Notice</h2>
          <p>Hi,</p>
          <p>We regret to inform you that the <strong>${session.skill_name}</strong> session scheduled for ${new Date(session.scheduled_at).toLocaleString()} has been cancelled.</p>
          <p>If you have any questions, please contact the other participant or our support team.</p>
          <p>Best regards,<br>BlockLearn Team</p>
        `
      };

      // Send to student
      await transporter.sendMail({ ...mailOptions, to: session.student_email });

      // Send to mentor
      await transporter.sendMail({ ...mailOptions, to: session.mentor_email });

      console.log(`Cancellation notification sent for session ${sessionId}`);

    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
  }

  // Send session completion confirmation
  static async sendCompletionConfirmation(sessionId) {
    try {
      const query = `
        SELECT s.*, st.email as student_email, st.first_name as student_first_name,
               m.email as mentor_email, m.first_name as mentor_first_name,
               sk.name as skill_name
        FROM sessions s
        JOIN users st ON s.student_id = st.id
        JOIN users m ON s.mentor_id = m.id
        JOIN skills sk ON s.skill_id = sk.id
        WHERE s.id = $1 AND s.status = 'completed'
      `;

      const result = await pool.query(query, [sessionId]);
      if (result.rows.length === 0) return;

      const session = result.rows[0];

      // Send completion confirmation
      const mailOptions = {
        from: process.env.EMAIL_USER,
        subject: `Session Completed: ${session.skill_name}`,
        html: `
          <h2>Session Completion Confirmation</h2>
          <p>Hi,</p>
          <p>Great news! Your <strong>${session.skill_name}</strong> session has been completed successfully.</p>
          <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
          <p><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
          <p>Don't forget to leave feedback for your learning/teaching partner!</p>
          <p>Best regards,<br>BlockLearn Team</p>
        `
      };

      // Send to student
      await transporter.sendMail({ ...mailOptions, to: session.student_email });

      // Send to mentor
      await transporter.sendMail({ ...mailOptions, to: session.mentor_email });

      console.log(`Completion confirmation sent for session ${sessionId}`);

    } catch (error) {
      console.error('Error sending completion confirmation:', error);
    }
  }

  // Schedule reminder job (to be called by a cron job)
  static async scheduleReminders() {
    try {
      // Find sessions scheduled for tomorrow
      const query = `
        SELECT id FROM sessions
        WHERE status = 'scheduled'
        AND scheduled_at >= NOW() + INTERVAL '23 hours'
        AND scheduled_at <= NOW() + INTERVAL '25 hours'
      `;

      const result = await pool.query(query);

      // Send reminders for each session
      for (const session of result.rows) {
        await this.sendSessionReminder(session.id);
      }

      console.log(`Sent reminders for ${result.rows.length} upcoming sessions`);

    } catch (error) {
      console.error('Error in reminder scheduling:', error);
    }
  }
}

module.exports = NotificationService;
