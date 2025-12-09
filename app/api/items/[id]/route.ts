import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Item } from "@/lib/types"

// GET single item by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [item] = await query<Item[]>("SELECT * FROM items WHERE id = ?", [id])

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

// PATCH update item
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updates: string[] = []
    const values: any[] = []

    if (body.status) {
      updates.push("status = ?")
      values.push(body.status)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    values.push(id)
    const sql = `UPDATE items SET ${updates.join(", ")} WHERE id = ?`

    await query(sql, values)

    // Fetch updated item
    const [updatedItem] = await query<Item[]>("SELECT * FROM items WHERE id = ?", [id])

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

// PUT full item update (for admin dashboard)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      type,
      title,
      description,
      category,
      location,
      date_reported,
      contact_name,
      contact_email,
      contact_phone,
      status,
      image_url,
    } = body

    const sql = `
      UPDATE items SET 
        type = ?, title = ?, description = ?, category = ?, 
        location = ?, date_reported = ?, contact_name = ?, 
        contact_email = ?, contact_phone = ?, status = ?, image_url = ?
      WHERE id = ?
    `

    await query(sql, [
      type,
      title,
      description,
      category,
      location,
      date_reported,
      contact_name,
      contact_email,
      contact_phone,
      status,
      image_url,
      id,
    ])

    const updated = await query<Item[]>("SELECT * FROM items WHERE id = ?", [id])
    return NextResponse.json(Array.isArray(updated) ? updated[0] : updated)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

// DELETE item
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await query("DELETE FROM items WHERE id = ?", [id])

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
