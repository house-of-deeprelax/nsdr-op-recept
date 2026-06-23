import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>Je verificatiecode voor {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Je verificatiecode</Heading>
        <Text style={text}>
          Bedankt voor je aanmelding bij{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          .
        </Text>
        <Text style={text}>
          Bevestig je e-mailadres (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) met onderstaande code.
        </Text>
        <Text style={codeStyle}>{token ?? '••••••'}</Text>
        <Text style={text}>Werkt de code niet? Dan kun je ook via onderstaande knop bevestigen.</Text>
        <Button style={button} href={confirmationUrl}>
          E-mailadres bevestigen
        </Button>
        <Text style={footer}>
          Heb je geen account aangemaakt? Dan kun je deze e-mail veilig negeren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: 'inherit', textDecoration: 'underline' }
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
