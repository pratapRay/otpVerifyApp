const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

const EMAIL = "norene.murphy65@ethereal.email";
const PASSWORD = "j7aDEUJafCHYyesWw2";

const nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
};

const transporter = nodemailer.createTransport(nodeConfig);

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: 'https://mailgen.js/'
  },
});

const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  const emailContent = {
    body: {
      name: username,
      intro: text || 'Welcome to Daily Tuition! We\'re very excited to have you on board.',
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
    },
  };

  const emailBody = mailGenerator.generate(emailContent);

  const message = {
    from: EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  try {
    await transporter.sendMail(message);
    return res.status(200).send({ msg: "You should receive an email from us." });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Failed to send email." });
  }
};

module.exports = registerMail;
