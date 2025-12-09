export type ItemType = "lost" | "found"
export type ItemStatus = "active" | "claimed" | "returned"

export interface Item {
  id: number
  type: ItemType
  title: string
  description: string
  category: string
  location: string
  date_reported: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  status: ItemStatus
  image_url?: string
  created_at: string
  updated_at: string
}

export interface CreateItemInput {
  type: ItemType
  title: string
  description: string
  category: string
  location: string
  date_reported: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  image_url?: string
}
