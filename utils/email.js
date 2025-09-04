const nodemailer=require("nodemailer");

module.exports.sendEMail=async(option)=>{
    //create transporter
    let transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_HOST_PORT,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    });
    //defind email option
    const mailOptions={
        from:"duy1 <duy1@test.com>",
        to:option.receiverEmail,
        subject:option.subject,
        text:option.message
    }
    //send email via transporter
    transporter.sendMail(mailOptions);

}

