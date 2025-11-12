const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  console.log('📧 Checking email configuration...');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET');
  console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email credentials not configured - skipping email sending');
    return null;
  }

  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    return null;
  }
};

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    console.log('📧 Contact form submission received:', req.body);
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      console.log('❌ Missing required fields:', { name: !!name, email: !!email, phone: !!phone, subject: !!subject, message: !!message });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create contact entry
    console.log('💾 Creating contact entry in database...');
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    });
    console.log('✅ Contact entry created:', contact._id);

    // Send email notification to admin
    const transporter = createTransporter();
    if (transporter) {
      try {
        console.log('📧 Sending admin notification email...');
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
          `
        });
        console.log('✅ Admin notification email sent successfully');

        console.log('📧 Sending confirmation email to user...');
        // Send confirmation email to user
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Thank you for contacting Sai Flow Water',
          html: `
            <h2>Thank you for reaching out!</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p><strong>Your Message:</strong></p>
            <p>${message}</p>
            <br>
            <p>Best regards,<br>Sai Flow Water Team</p>
            <hr>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
          `
        });
        console.log('✅ Confirmation email sent successfully');
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        console.error('   Error code:', emailError.code);
        console.error('   Error message:', emailError.message);
        // Continue even if email fails - don't let email failure break the contact form
      }
    } else {
      console.log('⚠️  Email transporter not available - skipping email notifications');
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email
      }
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status, replyMessage } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (status) {
      contact.status = status;
    }

    if (replyMessage) {
      contact.replyMessage = replyMessage;
      contact.replied = true;
      contact.repliedAt = Date.now();

      // Send reply email
      const transporter = createTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: contact.email,
            subject: `Re: ${contact.subject}`,
            html: `
              <h2>Response to your inquiry</h2>
              <p>Dear ${contact.name},</p>
              <p>${replyMessage}</p>
              <br>
              <p>Best regards,<br>Sai Flow Water Team</p>
              <hr>
              <p><strong>Your original message:</strong></p>
              <p>${contact.message}</p>
            `
          });
        } catch (emailError) {
          console.error('Reply email error:', emailError);
        }
      }
    }

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
