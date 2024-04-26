import nodemailer from 'nodemailer';
const AWS = require('aws-sdk');

export async function createSEStransporter() {
    // Create a SES session
    const SES = new AWS.SES({ apiVersion: '2010-12-01', region: process.env.REACT_APP_SES_REGION });
  
    // Get SMTP credentials from SES
    const data = await SES.getSendQuota({}).promise();
    const smtp_credentials = data.Endpoints[0];
  
    // Configure transporter with SES credentials
    const transporter = nodemailer.createTransport({
      host: smtp_credentials.Hostname,
      port: smtp_credentials.Port,
      secure: true, // Use TLS for SES
      auth: {
        user: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        pass: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
      }
    });
  
    return transporter;
  }