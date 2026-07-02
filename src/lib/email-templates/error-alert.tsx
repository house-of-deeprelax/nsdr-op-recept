import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface ErrorAlertProps {
  siteName?: string
  message?: string
  source?: string
  route?: string
  userEmail?: string
  occurredAt?: string
  count?: number
  adminUrl?: string
  stack?: string
}

const ErrorAlertEmail = ({
  siteName = 'NSDR op Recept',
  message = 'Onbekende fout',
  source = 'client',
  route = '—',
  userEmail = '—',
  occurredAt = new Date().toISOString(),
  count = 1,
  adminUrl = 'https://nsdr-op-recept.nl/admin',
  stack = '',
}: ErrorAlertProps) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Foutmelding in {siteName}: {message.slice(0, 80)}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nieuwe foutmelding</Heading>
        <Text style={text}>
          Er is een fout opgetreden in <strong>{siteName}</strong>
          {count > 1 ? ` (${count}× vergelijkbaar in het laatste uur)` : ''}.
        </Text>

        <Section style={box}>
          <Text style={label}>Bericht</Text>
          <Text style={value}>{message}</Text>
          <Hr style={hr} />
          <Text style={label}>Bron</Text>
          <Text style={value}>{source}</Text>
          <Hr style={hr} />
          <Text style={label}>Route</Text>
          <Text style={value}>{route}</Text>
          <Hr style={hr} />
          <Text style={label}>Gebruiker</Text>
          <Text style={value}>{userEmail}</Text>
          <Hr style={hr} />
          <Text style={label}>Tijdstip</Text>
          <Text style={value}>{new Date(occurredAt).toLocaleString('nl-NL')}</Text>
          {stack ? (
            <>
              <Hr style={hr} />
              <Text style={label}>Stack (eerste regels)</Text>
              <Text style={stackStyle}>{stack.split('\n').slice(0, 6).join('\n')}</Text>
            </>
          ) : null}
        </Section>

        <Text style={text}>
          Bekijk alle foutmeldingen in het beheerpaneel:{' '}
          <a href={adminUrl} style={link}>{adminUrl}</a>
        </Text>
        <Text style={footer}>
          Verdere e-mails voor dezelfde fout worden maximaal 1× per uur verstuurd.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ErrorAlertEmail

export const template = {
  component: ErrorAlertEmail,
  subject: (data: Record<string, any>) =>
    `[Fout] ${(data.message ?? 'Onbekende fout').toString().slice(0, 80)}`,
  displayName: 'Foutmelding (admin)',
  previewData: {
    siteName: 'NSDR op Recept',
    message: 'TypeError: Cannot read properties of undefined',
    source: 'client',
    route: '/genereren',
    userEmail: 'gebruiker@voorbeeld.nl',
    occurredAt: new Date().toISOString(),
    count: 3,
    adminUrl: 'https://nsdr-op-recept.nl/admin',
    stack: 'at Component (index.tsx:42)\n  at render (react.js:123)',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', border: '1px solid #e7e2d7', borderRadius: '14px', maxWidth: '600px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0c0c0a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 16px' }
const box = { backgroundColor: '#f7f5ef', borderRadius: '10px', padding: '16px 18px', margin: '12px 0 20px' }
const label = { fontSize: '11px', color: '#999999', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 4px' }
const value = { fontSize: '13px', color: '#0c0c0a', margin: '0 0 4px', wordBreak: 'break-word' as const }
const stackStyle = { fontFamily: 'Courier, monospace', fontSize: '11px', color: '#333', whiteSpace: 'pre-wrap' as const, margin: '0' }
const hr = { border: 'none', borderTop: '1px solid #e7e2d7', margin: '10px 0' }
const link = { color: '#8c9e6e', textDecoration: 'underline' }
const footer = { fontSize: '11px', color: '#999999', margin: '20px 0 0' }
