import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Je inlogcode voor {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Je inlogcode</Heading>
        <Text style={text}>
          Gebruik deze eenmalige code om in te loggen bij {siteName}. De code verloopt binnenkort.
        </Text>
        {token ? <Text style={codeStyle}>{token}</Text> : null}
        <Text style={text}>Werkt de code niet? Dan kun je ook via onderstaande knop inloggen.</Text>
        <Button style={button} href={confirmationUrl}>
          Inloggen
        </Button>
        <Text style={footer}>
          Heb je dit niet aangevraagd? Dan kun je deze e-mail veilig negeren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', border: '1px solid #e7e2d7', borderRadius: '14px' }
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
  margin: '0 0 18px',
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
const button = {
  backgroundColor: '#8c9e6e',
  color: '#0c0c0a',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
