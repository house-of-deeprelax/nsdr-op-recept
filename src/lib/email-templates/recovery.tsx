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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
  token,
}: RecoveryEmailProps) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Herstel je wachtwoord voor {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wachtwoord herstellen</Heading>
        <Text style={text}>
          We hebben een verzoek ontvangen om je wachtwoord voor {siteName} te herstellen.
          Gebruik onderstaande code om verder te gaan, of klik op de knop hieronder.
        </Text>
        <Text style={codeStyle}>{token ?? '••••••'}</Text>
        <Button style={button} href={confirmationUrl}>
          Wachtwoord herstellen
        </Button>
        <Text style={footer}>
          Heb je dit niet aangevraagd? Dan kun je deze e-mail veilig negeren.
          Je wachtwoord wordt niet gewijzigd. De code is 1 uur geldig en wordt
          ongeldig zodra je een nieuwe aanvraagt.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
  fontSize: '34px',
  fontWeight: 'bold' as const,
  color: '#0c0c0a',
  letterSpacing: '0.3em',
  textAlign: 'center' as const,
  margin: '20px 0 24px',
  fontFamily: 'monospace',
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
