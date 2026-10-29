import { QRCodeSVG } from 'qrcode.react'
import { absUrl } from '../lib/format.js'

export default function QrCard({ path, title, text }) {
  const url = absUrl(path)
  return (
    <section className="qr-card card">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
        <p className="url-line">{url}</p>
      </div>
      <div className="qr-frame" aria-hidden="true">
        <QRCodeSVG value={url} size={168} bgColor="#fffdf9" fgColor="#14283a" level="M" includeMargin />
      </div>
    </section>
  )
}
