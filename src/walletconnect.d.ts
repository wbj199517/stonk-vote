
// Declare QRCodeModal
declare module '@walletconnect/qrcode-modal' {
  export interface QRCodeModal {
    open(uri: string, onClose: () => void): void;
    close(): void;
  }

  const QRCodeModal: QRCodeModal;
  export default QRCodeModal;
}
