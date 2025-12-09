"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit2, Plus } from "lucide-react"
import ImageLightbox from "@/components/image-lightbox"

interface Item {
  id: number
  type: "lost" | "found"
  title: string
  description: string
  category: string
  location: string
  date_reported: string
  contact_name: string
  contact_email: string
  contact_phone: string
  status: "active" | "claimed" | "returned"
  image_url: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; username: string; role: string } | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Item>>({})
  const [filterStatus, setFilterStatus] = useState("all")
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userStr)
    if (userData.role !== "admin") {
      router.push("/")
      return
    }

    setUser(userData)
    fetchItems()
  }, [router])

  async function fetchItems() {
    try {
      const response = await fetch("/api/items")
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching items:", error)
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("user")
    router.push("/")
  }

  async function handleDeleteItem(id: number) {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/items/${id}`, { method: "DELETE" })
      if (response.ok) {
        setItems(items.filter((item) => item.id !== id))
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  async function handleSaveItem() {
    if (!formData.title) {
      alert("Title is required")
      return
    }

    try {
      const url = editingId ? `/api/items/${editingId}` : "/api/items"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        if (editingId) {
          setItems(items.map((item) => (item.id === editingId ? result : item)))
        } else {
          setItems([...items, result])
        }
        resetForm()
      }
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  // Convert selected image file to base64 and store in formData.image_url
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleImageChange = async (e: any) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // simple client-side validation
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      alert("Please upload a JPG, PNG or WEBP image.")
      return
    }
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      alert("Please upload an image smaller than 2MB.")
      return
    }

    try {
      const dataUrl = await fileToBase64(file)
      setFormData((prev) => ({ ...prev, image_url: dataUrl }))
    } catch (err) {
      console.error("Failed to read image file:", err)
      alert("Failed to read image file")
    }
  }

  function resetForm() {
    setFormData({})
    setEditingId(null)
  }

  function startEdit(item: Item) {
    setFormData(item)
    setEditingId(item.id)
  }

  const filteredItems =
    filterStatus === "all" ? items : items.filter((item) => item.status === filterStatus)

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "claimed":
        return "bg-yellow-100 text-yellow-800"
      case "returned":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeEmoji = (type: string) => {
    return type === "lost" ? "❌" : "✅"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="animate-fadeInUp">
            <h1 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur">
                🛡️
              </div>
              <span className="text-lg md:text-4xl">Admin Dashboard</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-lg mt-1 md:mt-2">Welcome back, <span className="font-semibold">{user.username}</span></p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-white/90 text-slate-700 hover:bg-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in self-start md:self-auto"
          >
            <span className="mr-2">🚪</span>
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-80 bg-white/80 backdrop-blur">
            <TabsTrigger value="items" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              📋 Manage Items
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              ➕ Create Item
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-purple-900">All Items ({filteredItems.length})</h2>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40 border-2 border-purple-200 bg-white/80">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-600 py-8">⏳ Loading items...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-center text-gray-600 py-8">📭 No items found</p>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 bg-white/90 backdrop-blur border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getTypeEmoji(item.type)}</span>
                          <h3 className="text-lg font-bold text-purple-900">{item.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        {item.image_url && (
                          <div className="mt-3">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-36 h-24 object-cover rounded-md border cursor-pointer"
                              onClick={() => setLightboxSrc(item.image_url as string)}
                            />
                          </div>
                        )}
                        <p className="text-gray-700 text-sm mt-2">{item.description}</p>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-600">
                          <p><strong>📂 Category:</strong> {item.category}</p>
                          <p><strong>📍 Location:</strong> {item.location}</p>
                          <p><strong>👤 Contact:</strong> {item.contact_name}</p>
                          <p><strong>📧 Email:</strong> {item.contact_email}</p>
                          <p><strong>📞 Phone:</strong> {item.contact_phone}</p>
                          <p><strong>📅 Date:</strong> {item.date_reported}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => startEdit(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="max-w-2xl">
            <Card className="p-4 md:p-6 bg-white/90 backdrop-blur border-2 border-purple-200">
              <h2 className="text-xl md:text-2xl font-bold text-purple-900 mb-6">
                {editingId ? "✏️ Edit Item" : "➕ Create New Item"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-semibold">Type</Label>
                    <Select
                      value={formData.type || ""}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="border-2 border-gray-200 focus:border-purple-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">❌ Lost</SelectItem>
                        <SelectItem value="found">✅ Found</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-semibold">Status</Label>
                    <Select
                      value={formData.status || ""}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="border-2 border-gray-200 focus:border-purple-500">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">🔵 Active</SelectItem>
                        <SelectItem value="claimed">🟡 Claimed</SelectItem>
                        <SelectItem value="returned">🟢 Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="text-gray-700 font-semibold">Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Item title"
                    className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 font-semibold">Description</Label>
                  <textarea
                    id="description"
                    className="w-full p-3 border-2 border-gray-200 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    rows={4}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Item description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-700 font-semibold">Category</Label>
                    <Input
                      id="category"
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Category"
                      className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-gray-700 font-semibold">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                      className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name" className="text-gray-700 font-semibold">Contact Name</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name || ""}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Contact name"
                      className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_email" className="text-gray-700 font-semibold">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email || ""}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="Contact email"
                      className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_phone" className="text-gray-700 font-semibold">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone || ""}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="Contact phone"
                    className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <Label htmlFor="date_reported" className="text-gray-700 font-semibold">Date Reported</Label>
                  <Input
                    id="date_reported"
                    type="date"
                    value={formData.date_reported || ""}
                    onChange={(e) => setFormData({ ...formData, date_reported: e.target.value })}
                    className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Photo (optional)</Label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-2"
                  />

                  {formData.image_url && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.image_url as string}
                        alt="preview"
                        className="max-w-full h-48 object-contain rounded cursor-pointer"
                        onClick={() => setLightboxSrc(formData.image_url as string)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSaveItem}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 shadow-lg"
                  >
                    {editingId ? "✏️ Update Item" : "➕ Create Item"}
                  </Button>
                  {editingId && (
                    <Button 
                      onClick={resetForm}
                      variant="outline"
                      className="border-2 border-purple-300"
                    >
                      ❌ Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}
