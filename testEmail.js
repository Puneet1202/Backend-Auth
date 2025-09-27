// testEmail.js
const sendEmail = require('./utils/SendEmail');

(async () => {
  try {
    await sendEmail(
      'punitkumar2121999@gmail.com',            // <-- recipient: yahan daaliye ourgmail@gmail.com
      'Test email from Node (quick)',
      '<p>Yeh test email hai. Agar aapko yeh mil raha hai, SMTP sahi configured hai.</p>'
    );
    console.log('Done');
  } catch (err) {
    console.error('Error sending email:', err);
  }
})();
