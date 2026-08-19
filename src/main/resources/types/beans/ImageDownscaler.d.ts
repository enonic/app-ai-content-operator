declare interface ImageDownscaler {
  /**
   * Reads the image stream and prepares a base64 payload for the model.
   * Downscales images above 1 MB to a 1024px JPEG; rejects streams above 15 MB.
   * @param stream A java.io.InputStream (call openStream() on an XP ByteSource).
   * @param mimeType The attachment mime type, kept on passthrough.
   * @returns true when a payload is available via getMimeType()/getData().
   */
  prepare(stream: unknown, mimeType: string): boolean;

  getMimeType(): string;

  getData(): string;
}

interface XpBeans {
  'com.enonic.app.ai.contentoperator.image.ImageDownscaler': ImageDownscaler;
}
