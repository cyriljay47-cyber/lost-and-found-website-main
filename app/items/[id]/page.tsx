"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Tag, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Item } from "@/lib/types"
import Link from "next/link"
import ImageLightbox from "@/components/image-lightbox"

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    fetchItem()
  }, [resolvedParams.id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${resolvedParams.id}`)
      if (!response.ok) throw new Error("Item not found")
      const data = await response.json()
      setItem(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load item details",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!item) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      const updatedItem = await response.json()
      setItem(updatedItem)

      toast({
        title: "Status Updated",
        description: `Item status changed to ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading item details...</p>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Listings
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{item.title}</h1>
                <Badge variant={item.type === "lost" ? "destructive" : "default"} className="text-sm">
                  {item.type}
                </Badge>
                <Badge variant={item.status === "active" ? "outline" : "secondary"}>{item.status}</Badge>
              </div>
              <p className="text-muted-foreground">Reported on {new Date(item.date_reported).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.image_url && (
                  <div className="mb-4">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-64 object-contain rounded-md border cursor-pointer"
                      onClick={() => setLightboxSrc(item.image_url as string)}
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
                  <p className="text-foreground leading-relaxed">{item.description}</p>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date {item.type === "lost" ? "Lost" : "Found"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.date_reported).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {item.status === "active" ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.status}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Update */}
            {item.status === "active" && (
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                  <CardDescription>Mark this item as claimed or returned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Select onValueChange={handleStatusUpdate} disabled={updating}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Change status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claimed">Mark as Claimed</SelectItem>
                        <SelectItem value="returned">Mark as Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch with the reporter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Name</p>
                  <p className="text-foreground">{item.contact_name}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <a
                    href={`mailto:${item.contact_email}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm truncate">{item.contact_email}</p>
                    </div>
                  </a>

                  {item.contact_phone && (
                    <a
                      href={`tel:${item.contact_phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm">{item.contact_phone}</p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}
