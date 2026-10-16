import type { Metadata } from 'next'
import ContactForm from './_form'

export const metadata: Metadata = {
  title: 'Contact Us | MK Refrigeration Bharuch',
  description: 'Contact MK Refrigeration in Bharuch for AC, Refrigerator, Washing Machine enquiries. Call, WhatsApp, or visit us Mon–Sat 10am–8pm.',
}

export default function ContactPage() {
  return <ContactForm />
}
