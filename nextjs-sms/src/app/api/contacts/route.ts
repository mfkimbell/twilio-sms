import { NextResponse } from 'next/server';
import { ContactRepository } from '@/repositories/contactRepository';

export async function GET(request: Request) {
  try {
    const contacts = await ContactRepository.getAllContacts();
    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contactData = await request.json();
    // contactData should follow the Contact interface shape
    const contactId = await ContactRepository.createContact(contactData);
    return NextResponse.json({ contactId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
