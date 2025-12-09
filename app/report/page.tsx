"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    description: "",
    category: "",
    location: "",
    date_reported: new Date().toISOString().split("T")[0],
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    image_url: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to submit report")

      const data = await response.json()

      toast({
        title: "Success!",
        description: `Your ${formData.type} item report has been submitted.`,
      })

      router.push(`/items/${data.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getProgressPercentage = () => {
    const requiredFields = ['title', 'description', 'category', 'location', 'contact_name', 'contact_email']
    const filledFields = requiredFields.filter(field => formData[field as keyof typeof formData]?.toString().trim())
    return Math.round((filledFields.length / requiredFields.length) * 100)
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file", description: "Only JPG, PNG or WEBP images are allowed.", variant: "destructive" })
      return
    }
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Please upload an image smaller than 2MB.", variant: "destructive" })
      return
    }

    try {
      const dataUrl = await fileToBase64(file)
      setFormData((prev) => ({ ...prev, image_url: dataUrl }))
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to read image file.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Report an Item</h1>
          <p className="text-muted-foreground mt-1">Help us reunite items with their owners</p>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur animate-fadeInUp">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {formData.type === "lost" ? "❌" : "✅"}
                </span>
              </div>
              <div>
                <CardTitle className="text-xl">
                  {formData.type === "lost" ? "Report Lost Item" : "Report Found Item"}
                </CardTitle>
                <CardDescription className="text-base">
                  Please provide as much information as possible to help reunite this item
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Item Type */}
              <div className="space-y-3">
                <Label>Item Type</Label>
                <RadioGroup value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lost" id="lost" />
                    <Label htmlFor="lost" className="font-normal cursor-pointer">
                      I lost an item
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="found" id="found" />
                    <Label htmlFor="found" className="font-normal cursor-pointer">
                      I found an item
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g., Black Leather Wallet"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wallet">Wallet</SelectItem>
                    <SelectItem value="Bag">Bag</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Keys">Keys</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  required
                  placeholder="Provide detailed description including color, brand, size, etc."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  required
                  placeholder="e.g., Library 3rd Floor, Parking Lot B"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date {formData.type === "lost" ? "Lost" : "Found"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date_reported}
                  onChange={(e) => handleChange("date_reported", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">
                      Your Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact_name"
                      required
                      placeholder="John Doe"
                      value={formData.contact_name}
                      onChange={(e) => handleChange("contact_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.contact_email}
                      onChange={(e) => handleChange("contact_email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Phone Number (Optional)</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.contact_phone}
                      onChange={(e) => handleChange("contact_phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              {/* Photo upload (optional) */}
              <div className="space-y-2">
                <Label htmlFor="image">Photo (optional)</Label>
                <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />

                {formData.image_url && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img src={formData.image_url} alt="preview" className="max-w-full h-32 md:h-48 object-contain rounded" />
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Form Progress</span>
                  <span className="text-muted-foreground">{getProgressPercentage()}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
