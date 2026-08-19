package com.enonic.app.ai.contentoperator.image;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Random;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ImageDownscalerTest {

    @Test
    void smallImagePassesThroughUnchanged() throws Exception {
        final byte[] source = pngBytes(64, 64, false);
        final ImageDownscaler preparer = new ImageDownscaler();

        assertTrue(preparer.prepare(new ByteArrayInputStream(source), "image/png"));
        assertEquals("image/png", preparer.getMimeType());
        assertArrayEquals(source, Base64.getDecoder().decode(preparer.getData()));
    }

    @Test
    void largeImageIsDownscaledToJpeg() throws Exception {
        final byte[] source = pngBytes(2200, 1100, true);
        assertTrue(source.length > 1024 * 1024, "noise PNG must exceed the downscale threshold");

        final ImageDownscaler preparer = new ImageDownscaler();
        assertTrue(preparer.prepare(new ByteArrayInputStream(source), "image/png"));
        assertEquals("image/jpeg", preparer.getMimeType());

        final BufferedImage result =
            ImageIO.read(new ByteArrayInputStream(Base64.getDecoder().decode(preparer.getData())));
        assertNotNull(result);
        assertTrue(Math.max(result.getWidth(), result.getHeight()) <= 1024);
    }

    @Test
    void undecodableLargePayloadFallsBackToOriginal() throws Exception {
        final byte[] source = new byte[2 * 1024 * 1024];
        new Random(42).nextBytes(source);

        final ImageDownscaler preparer = new ImageDownscaler();
        assertTrue(preparer.prepare(new ByteArrayInputStream(source), "application/octet-stream"));
        assertEquals("application/octet-stream", preparer.getMimeType());
        assertArrayEquals(source, Base64.getDecoder().decode(preparer.getData()));
    }

    @Test
    void oversizedStreamIsRejected() throws Exception {
        final byte[] source = new byte[16 * 1024 * 1024];

        final ImageDownscaler preparer = new ImageDownscaler();
        assertFalse(preparer.prepare(new ByteArrayInputStream(source), "image/png"));
    }

    private static byte[] svgBytes(final String sizeAttributes) {
        final String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" " + sizeAttributes +
            "><rect width=\"100%\" height=\"100%\" fill=\"#f00\"/></svg>";
        return svg.getBytes(StandardCharsets.UTF_8);
    }

    private static BufferedImage decodeJpeg(final String base64) throws Exception {
        final BufferedImage result = ImageIO.read(new ByteArrayInputStream(Base64.getDecoder().decode(base64)));
        assertNotNull(result);
        return result;
    }

    @Test
    void svgIsRasterizedToJpeg() throws Exception {
        final byte[] source = svgBytes("width=\"200\" height=\"100\"");

        final ImageDownscaler preparer = new ImageDownscaler();
        assertTrue(preparer.prepare(new ByteArrayInputStream(source), "image/svg+xml"));
        assertEquals("image/jpeg", preparer.getMimeType());

        final BufferedImage result = decodeJpeg(preparer.getData());
        assertEquals(200, result.getWidth());
        assertEquals(100, result.getHeight());
    }

    @Test
    void largeSvgIsRasterizedDownscaled() throws Exception {
        final byte[] source = svgBytes("width=\"2048\" height=\"1024\"");

        final ImageDownscaler preparer = new ImageDownscaler();
        assertTrue(preparer.prepare(new ByteArrayInputStream(source), "image/svg+xml"));
        assertEquals("image/jpeg", preparer.getMimeType());

        final BufferedImage result = decodeJpeg(preparer.getData());
        assertEquals(1024, result.getWidth());
        assertEquals(512, result.getHeight());
    }

    @Test
    void svgWithOnlyViewBoxIsRasterized() throws Exception {
        final byte[] source = svgBytes("viewBox=\"0 0 300 150\"");

        final ImageDownscaler preparer = new ImageDownscaler();
        assertTrue(preparer.prepare(new ByteArrayInputStream(source), "image/svg+xml"));
        assertEquals("image/jpeg", preparer.getMimeType());

        final BufferedImage result = decodeJpeg(preparer.getData());
        assertTrue(Math.max(result.getWidth(), result.getHeight()) <= 1024);
    }

    @Test
    void svgMimeTypeWithParametersIsDetected() throws Exception {
        final byte[] source = svgBytes("width=\"200\" height=\"100\"");

        final ImageDownscaler preparer = new ImageDownscaler();
        assertTrue(preparer.prepare(new ByteArrayInputStream(source), "image/SVG+XML; charset=utf-8"));
        assertEquals("image/jpeg", preparer.getMimeType());
    }

    @Test
    void malformedSvgIsRejected() throws Exception {
        final byte[] source = "<svg not-xml".getBytes(StandardCharsets.UTF_8);

        final ImageDownscaler preparer = new ImageDownscaler();
        assertFalse(preparer.prepare(new ByteArrayInputStream(source), "image/svg+xml"));
    }

    private static byte[] pngBytes(final int width, final int height, final boolean noise) throws Exception {
        final BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        if (noise) {
            final Random random = new Random(42);
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    image.setRGB(x, y, random.nextInt());
                }
            }
        }
        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }
}
