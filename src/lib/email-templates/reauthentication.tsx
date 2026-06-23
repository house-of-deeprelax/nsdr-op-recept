import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Je verificatiecode</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>NSDR op Recept</Text>
        <Heading style={h1}>Bevestig je identiteit</Heading>
        <Text style={text}>Gebruik onderstaande code om je identiteit te bevestigen.</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Deze code verloopt binnenkort. Heb je dit niet aangevraagd? Dan kun je deze e-mail veilig negeren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', border: '1px solid #e7e2d7', borderRadius: '14px' }
const eyebrow = { color: '#8c9e6e', fontSize: '12px', fontWeight: 'bold' as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const, margin: '0 0 12px' }
const h1 = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#0c0c0a',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '34px',
  fontWeight: 'bold' as const,
  letterSpacing: '0.18em',
  color: '#0c0c0a',
  backgroundColor: '#f3f0e8',
  borderRadius: '12px',
  padding: '18px 20px',
  textAlign: 'center' as const,
  margin: '8px 0 22px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
